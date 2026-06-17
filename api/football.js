import https from 'node:https';

export default function handler(req, res) {
  // req.url is the original request path e.g. /api/football/competitions/2000/matches?status=FINISHED
  const apiPath = req.url.replace(/^\/api\/football/, '') || '/';
  const url = `https://api.football-data.org/v4${apiPath}`;

  https.get(url, { headers: { 'X-Auth-Token': process.env.VITE_FOOTBALL_API_KEY || '' } }, (r) => {
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = r.statusCode;
    r.pipe(res);
  }).on('error', (e) => {
    res.statusCode = 500;
    res.end(JSON.stringify({ error: e.message }));
  });
}
