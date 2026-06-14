import https from 'node:https';
import http from 'node:http';

const NEWS_URL = 'https://news.google.com/rss/search?q=FIFA+World+Cup+2026&hl=en-US&gl=US&ceid=US:en';

export default function handler(_req, res) {
  function get(url, hops) {
    if (hops > 6) {
      res.statusCode = 500;
      res.end('Too many redirects');
      return;
    }
    const mod = url.startsWith('https') ? https : http;
    mod.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; NewsProxy/1.0)' } }, (r) => {
      if (r.statusCode >= 300 && r.statusCode < 400 && r.headers.location) {
        r.resume();
        get(r.headers.location, hops + 1);
        return;
      }
      res.setHeader('Content-Type', 'application/xml; charset=utf-8');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.statusCode = 200;
      r.pipe(res);
    }).on('error', (e) => {
      res.statusCode = 500;
      res.end(e.message);
    });
  }
  get(NEWS_URL, 0);
}
