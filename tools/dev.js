/* Server uji di laptop: menyajikan situs dan /api/jp tanpa Vercel. Jalankan: node tools/dev.js lalu buka http://localhost:8000 */
'use strict';
const http = require('http'), fs = require('fs'), path = require('path');
const akar = path.join(__dirname, '..'), api = require('../api/jp.js');
const JENIS = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.png': 'image/png', '.mp3': 'audio/mpeg', '.webmanifest': 'application/manifest+json', '.svg': 'image/svg+xml' };
http.createServer(function (req, res) {
  const u = new URL(req.url, 'http://x');
  if (u.pathname === '/api/jp') { return api(req, res); }
  let f = path.join(akar, decodeURIComponent(u.pathname));
  if (f.indexOf(akar) !== 0) { res.statusCode = 403; return res.end(); }
  if (fs.existsSync(f) && fs.statSync(f).isDirectory()) { f = path.join(f, 'index.html'); }
  fs.readFile(f, function (e, isi) { if (e) { res.statusCode = 404; return res.end('tidak ada'); } res.setHeader('Content-Type', JENIS[path.extname(f)] || 'application/octet-stream'); res.end(isi); });
}).listen(process.env.PORT || 8000, function () { console.log('http://localhost:' + (process.env.PORT || 8000)); });
