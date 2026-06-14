import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import https from 'node:https';
import http from 'node:http';

function newsPlugin() {
  const NEWS_URL = 'https://news.google.com/rss/search?q=FIFA+World+Cup+2026&hl=en-US&gl=US&ceid=US:en';

  return {
    name: 'news-proxy',
    configureServer(server) {
      server.middlewares.use('/api/news', (_req, res) => {
        function get(url, hops) {
          if (hops > 6) { res.statusCode = 500; res.end('Too many redirects'); return; }
          const mod = url.startsWith('https') ? https : http;
          mod.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; DevProxy/1.0)' } }, (r) => {
            if (r.statusCode >= 300 && r.statusCode < 400 && r.headers.location) {
              r.resume();
              get(r.headers.location, hops + 1);
              return;
            }
            res.setHeader('Content-Type', 'application/xml; charset=utf-8');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.statusCode = r.statusCode;
            r.pipe(res);
          }).on('error', (e) => { res.statusCode = 500; res.end(e.message); });
        }
        get(NEWS_URL, 0);
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react(), newsPlugin()],
    server: {
      proxy: {
        '/football-api': {
          target: 'https://api.football-data.org/v4',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/football-api/, ''),
          headers: {
            'X-Auth-Token': env.VITE_FOOTBALL_API_KEY || '',
          },
        },
      },
    },
  };
});
