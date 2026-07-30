const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = __dirname;
const M = { '.html': 'text/html', '.js': 'text/javascript', '.png': 'image/png', '.json': 'application/json', '.svg': 'image/svg+xml' };
http.createServer((q, r) => {
  let u = decodeURIComponent(q.url.split('?')[0]);
  if (u === '/') u = '/index.html';
  const rp = path.resolve(path.join(ROOT, u));
  if (!rp.startsWith(path.resolve(ROOT))) { r.writeHead(403); return r.end(); }
  fs.readFile(rp, (e, d) => {
    if (e) { r.writeHead(404); return r.end('nf: ' + u); }
    r.writeHead(200, { 'Content-Type': M[path.extname(rp)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    r.end(d);
  });
}).listen(+(process.env.PORT || 8933), () =>
  console.log('lookdev on http://localhost:' + (process.env.PORT || 8933)));
