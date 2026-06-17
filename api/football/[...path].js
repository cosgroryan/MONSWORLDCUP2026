import https from 'node:https';

export default function handler(req, res) {
  const apiPath = req.url.replace(/^\/api\/football/, '');
  const url = `https://api.football-data.org/v4${apiPath}`;

  https.get(url, { headers: { 'X-Auth-Token': process.env.VITE_FOOTBALL_API_KEY || '' } }, (r) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.statusCode = r.statusCode;
    r.pipe(res);
  }).on('error', (e) => {
    res.statusCode = 500;
    res.end(JSON.stringify({ error: e.message }));
  });
}
