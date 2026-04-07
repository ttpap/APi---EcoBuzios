const http  = require('http');
const https = require('https');
const fs    = require('fs');
const path  = require('path');
const url   = require('url');

const PORT = 4321;
const DIR  = __dirname;

const MIME = {
  '.html': 'text/html',
  '.js':   'application/javascript',
  '.css':  'text/css',
  '.json': 'application/json',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.svg':  'image/svg+xml',
};

const API_URL = 'https://ixgujnhdjrgoakqzdkgx.supabase.co/functions/v1/public-stats-api';

function proxyApi(res, projetos) {
  const qs = projetos ? `?projetos=${projetos}` : '';
  const opts = {
    hostname: 'ixgujnhdjrgoakqzdkgx.supabase.co',
    path: `/functions/v1/public-stats-api${qs}`,
    headers: { 'x-api-key': 'c04248b422b59e718e8115a66286b1f9a56f5f447b44354128ad7406ebb50752' }
  };
  https.get(opts, (apiRes) => {
    let body = '';
    apiRes.on('data', chunk => body += chunk);
    apiRes.on('end', () => {
      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      });
      res.end(body);
    });
  }).on('error', (err) => {
    res.writeHead(502);
    res.end(JSON.stringify({ ok: false, error: err.message }));
  });
}

http.createServer((req, res) => {
  const parsed = url.parse(req.url);

  if (parsed.pathname === '/api/stats') {
    const projetos = new URLSearchParams(parsed.query || '').get('projetos') || '';
    return proxyApi(res, projetos);
  }

  const filePath = path.join(DIR, parsed.pathname === '/' ? '/dashboard.html' : decodeURIComponent(parsed.pathname));
  const ext = path.extname(filePath);
  const contentType = MIME[ext] || 'text/plain';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    }
  });
}).listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
