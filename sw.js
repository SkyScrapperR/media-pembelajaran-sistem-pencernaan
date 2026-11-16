/* Pekerja layanan Jelajah Pencernaan.
   Saat ada internet selalu mengambil versi terbaru, lalu menyimpannya. Saat internet putus memakai simpanan. */
var NAMA = 'jelajah-pencernaan-v2';
var INTI = ['./', 'index.html', 'beranda.js', 'manifest.webmanifest',
  'assets/tema.css', 'assets/inti.js', 'assets/akun.js', 'assets/tokoh.js', 'assets/audio.js', 'assets/soal.js', 'assets/peta.js', 'assets/pandu.js', 'assets/kamus-data.js', 'assets/ikon-192.png',
  'asesmen/', 'asesmen/hub.js', 'asesmen/cek-bekal.html', 'asesmen/cek-bekal.js', 'asesmen/pos.html', 'asesmen/pos.js', 'asesmen/ujian.html', 'asesmen/ujian.js', 'asesmen/bonus.html', 'asesmen/bonus.js', 'asesmen/guru.html', 'asesmen/guru.js',
  'kamus/', 'kamus/kamus.js',
  'belajar/', 'belajar/gaya.css', 'belajar/data.js', 'belajar/tubuh.js', 'belajar/app.js', 'belajar/pandu-belajar.js'];
self.addEventListener('install', function (e) {
  self.skipWaiting();
  e.waitUntil(caches.open(NAMA).then(function (c) { return Promise.all(INTI.map(function (u) { return c.add(u).catch(function () { /* lewati yang gagal */ }); })); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (k) { return Promise.all(k.filter(function (n) { return n !== NAMA; }).map(function (n) { return caches.delete(n); })); }).then(function () { return self.clients.claim(); }));
});
function simpan(req, res) {
  if (res && res.status === 200 && (res.type === 'basic' || res.type === 'cors')) { var salin = res.clone(); caches.open(NAMA).then(function (c) { c.put(req, salin); }); }
  return res;
}
self.addEventListener('fetch', function (e) {
  var req = e.request; if (req.method !== 'GET') { return; }
  var u = new URL(req.url), sendiri = u.origin === location.origin;
  var luar = /(^|\.)cdnjs\.cloudflare\.com$|(^|\.)fonts\.googleapis\.com$|(^|\.)fonts\.gstatic\.com$/.test(u.hostname);
  if (!sendiri && !luar) { return; }
  if (sendiri && u.pathname.indexOf('/api/') === 0) { return; } /* data kelas selalu langsung dari server */
  /* permintaan sebagian (audio) dijawab dari berkas utuh di simpanan */
  var kunci = req.headers.get('range') ? new Request(req.url) : req;
  if (luar) { e.respondWith(caches.match(kunci).then(function (ada) { return ada || fetch(req).then(function (r) { return simpan(kunci, r); }); })); return; }
  e.respondWith(fetch(req.headers.get('range') ? kunci : req).then(function (r) { return simpan(kunci, r); }).catch(function () {
    return caches.match(kunci, { ignoreSearch: true }).then(function (ada) { return ada || (req.mode === 'navigate' ? caches.match('./') : Response.error()); });
  }));
});
