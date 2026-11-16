/* Server data Jelajah Pencernaan: akun siswa per kelas, sinkron progres, papan bintang, dan dasbor guru.
   Satu fungsi untuk semua aksi. Data disimpan sebagai satu berkas JSON per siswa di Vercel Blob (privat).
   Tanpa BLOB_READ_WRITE_TOKEN (saat dijalankan di laptop) data disimpan ke folder sementara. */
'use strict';
const crypto = require('crypto');

const KELAS = ['A', 'B', 'C'];
const RAHASIA = process.env.JP_RAHASIA || 'rahasia-lokal-untuk-uji';
const SANDI_GURU = process.env.GURU_SANDI || '';
const MAKS_GAGAL = 5;

/* ---------- penyimpanan ---------- */
function gudang() {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = require('@vercel/blob');
    const opsi = { access: 'private' };
    return {
      async baca(p) {
        const r = await blob.get(p, { access: 'private', useCache: false });
        if (!r || r.statusCode !== 200) { return null; }
        return JSON.parse(await new Response(r.stream).text());
      },
      async tulis(p, isi, baru) {
        await blob.put(p, JSON.stringify(isi), Object.assign({ addRandomSuffix: false, allowOverwrite: !baru, contentType: 'application/json' }, opsi));
      },
      async hapus(p) { try { await blob.del(p); } catch (e) { /* sudah tidak ada */ } },
      async daftar(awalan) {
        const hasil = []; let cursor;
        do { const r = await blob.list({ prefix: awalan, cursor: cursor, limit: 1000 }); r.blobs.forEach(function (b) { hasil.push(b.pathname); }); cursor = r.hasMore ? r.cursor : null; } while (cursor);
        return hasil;
      }
    };
  }
  const fs = require('fs'), path = require('path');
  const akar = process.env.JP_DATA_DIR || path.join(require('os').tmpdir(), 'jp-data');
  const jalur = function (p) { return path.join(akar, p); };
  return {
    async baca(p) { try { return JSON.parse(fs.readFileSync(jalur(p), 'utf8')); } catch (e) { return null; } },
    async tulis(p, isi, baru) {
      fs.mkdirSync(path.dirname(jalur(p)), { recursive: true });
      fs.writeFileSync(jalur(p), JSON.stringify(isi), { flag: baru ? 'wx' : 'w' });
    },
    async hapus(p) { try { fs.unlinkSync(jalur(p)); } catch (e) { /* sudah tidak ada */ } },
    async daftar(awalan) {
      const hasil = [], dir = jalur(awalan);
      (function jalan(d, rel) { let isi; try { isi = fs.readdirSync(d, { withFileTypes: true }); } catch (e) { return; } isi.forEach(function (f) { if (f.isDirectory()) { jalan(path.join(d, f.name), rel + f.name + '/'); } else { hasil.push(rel + f.name); } }); })(dir, awalan);
      return hasil;
    }
  };
}
let G = null;
function simpanan() { if (!G) { G = gudang(); } return G; }

/* ---------- alat kecil ---------- */
function sha(s) { return crypto.createHash('sha256').update(String(s)).digest('hex'); }
function tanda(s) { return crypto.createHmac('sha256', RAHASIA).update(String(s)).digest('hex'); }
function sama(a, b) { const x = Buffer.from(sha(a)), y = Buffer.from(sha(b)); return crypto.timingSafeEqual(x, y); }
function galat(kode, pesan, status) { const e = new Error(pesan); e.kode = kode; e.status = status || 400; return e; }
function rapikanNama(n) { return String(n || '').replace(/\s+/g, ' ').trim().slice(0, 24); }
/* dua nama dianggap sama bila huruf dan angkanya sama, tanpa membedakan besar kecil, spasi, atau tanda baca */
function siput(n) { return rapikanNama(n).toLowerCase().normalize('NFKD').replace(/[^a-z0-9]/g, '').slice(0, 24); }
function jalurSiswa(kelas, slug) { return 'siswa/' + kelas + '/' + slug + '.json'; }
function cekKelas(k) { k = String(k || '').toUpperCase(); if (KELAS.indexOf(k) < 0) { throw galat('kelas', 'Pilih kelas A, B, atau C.'); } return k; }
function cekRahasia(r) { r = String(r || ''); if (!/^\d{1,2}-\d{1,2}$/.test(r)) { throw galat('rahasia', 'Pilih dua gambar rahasia.'); } return r; }
function hashRahasia(kelas, slug, r) { return tanda('rh|' + kelas + '|' + slug + '|' + r); }

/* ---------- menggabungkan progres dari beberapa perangkat ---------- */
function angka(x, maks) { x = Number(x); return isFinite(x) ? Math.max(0, Math.min(maks, x)) : 0; }
function bersihkan(d) {
  d = d && typeof d === 'object' ? d : {};
  const o = { tingkat: angka(d.tingkat, 9), bonus: angka(d.bonus, 1e6), diag: null, pos: {}, ujian: null, rekor: {}, avatar: typeof d.avatar === 'string' ? d.avatar.slice(0, 20) : '' };
  if (d.diag && Array.isArray(d.diag.items)) {
    o.diag = { waktu: String(d.diag.waktu || '').slice(0, 30), items: d.diag.items.slice(0, 12).map(function (i) { i = i || {}; return { id: String(i.id || '').slice(0, 8), pilih: angka(i.pilih, 9), benar: !!i.benar, yakin: !!i.yakin, kat: String(i.kat || '').slice(0, 12) }; }) };
  }
  if (d.pos && typeof d.pos === 'object') { Object.keys(d.pos).slice(0, 12).forEach(function (k) { const p = d.pos[k] || {}; if (/^\d{1,2}$/.test(k)) { o.pos[k] = { bintang: angka(p.bintang, 3), skor: angka(p.skor, 100), coba: angka(p.coba, 9999) }; } }); }
  if (d.ujian && typeof d.ujian === 'object') {
    const u = d.ujian;
    const per = Array.isArray(u.perTP) ? u.perTP.slice(0, 9).map(function (t) { t = t || {}; return { dapat: angka(t.dapat, 100), maks: angka(t.maks, 100) }; }) : [];
    const butir = Array.isArray(u.butir) ? u.butir.slice(0, 40).map(function (b) { return { id: String(b && b.id || '').slice(0, 12), tp: angka(b && b.tp, 9), dapat: angka(b && b.dapat, 20), maks: angka(b && b.maks, 20) }; }) : [];
    o.ujian = { nilai: angka(u.nilai, 100), terakhir: angka(u.terakhir, 100), waktu: String(u.waktu || '').slice(0, 30), perTP: per, butir: butir, coba: angka(u.coba, 9999) };
  }
  if (d.rekor && typeof d.rekor === 'object') { Object.keys(d.rekor).slice(0, 12).forEach(function (k) { o.rekor[String(k).slice(0, 16)] = angka(d.rekor[k], 1e6); }); }
  return o;
}
function gabung(a, b) {
  a = bersihkan(a); b = bersihkan(b);
  const o = { tingkat: Math.max(a.tingkat, b.tingkat), bonus: Math.max(a.bonus, b.bonus), pos: {}, rekor: {}, avatar: b.avatar || a.avatar };
  o.diag = !a.diag ? b.diag : !b.diag ? a.diag : (b.diag.waktu >= a.diag.waktu ? b.diag : a.diag);
  Object.keys(a.pos).concat(Object.keys(b.pos)).forEach(function (k) { const x = a.pos[k] || { bintang: 0, skor: 0, coba: 0 }, y = b.pos[k] || { bintang: 0, skor: 0, coba: 0 }; o.pos[k] = { bintang: Math.max(x.bintang, y.bintang), skor: Math.max(x.skor, y.skor), coba: Math.max(x.coba, y.coba) }; });
  Object.keys(a.rekor).concat(Object.keys(b.rekor)).forEach(function (k) { o.rekor[k] = Math.max(a.rekor[k] || 0, b.rekor[k] || 0); });
  if (!a.ujian || !b.ujian) { o.ujian = a.ujian || b.ujian; } else {
    const baru = b.ujian.waktu >= a.ujian.waktu ? b.ujian : a.ujian;
    o.ujian = Object.assign({}, baru, { nilai: Math.max(a.ujian.nilai, b.ujian.nilai), coba: Math.max(a.ujian.coba, b.ujian.coba) });
  }
  return o;
}
function gabungRiwayat(a, b) {
  const lihat = {}, hasil = [];
  (a || []).concat(Array.isArray(b) ? b.slice(-300) : []).forEach(function (r) {
    if (!r || typeof r !== 'object') { return; }
    const x = { jenis: String(r.jenis || '').slice(0, 40), ringkas: String(r.ringkas || '').slice(0, 120), nilai: r.nilai === null || r.nilai === undefined ? null : angka(r.nilai, 1e6), waktu: String(r.waktu || '').slice(0, 30) };
    const k = x.waktu + '|' + x.jenis; if (!x.waktu || lihat[k]) { return; } lihat[k] = 1; hasil.push(x);
  });
  hasil.sort(function (p, q) { return p.waktu < q.waktu ? -1 : 1; });
  return hasil.slice(-200);
}
function ringkas(r) {
  let bintang = 0, pos = 0; Object.keys(r.data.pos || {}).forEach(function (k) { const b = r.data.pos[k].bintang || 0; bintang += b; if (b > 0) { pos++; } });
  return { nama: r.nama, bintang: bintang, pos: pos, tingkat: r.data.tingkat || 1, avatar: r.data.avatar || '' };
}

/* ---------- sesi ---------- */
function sesiBaru(r) { const t = crypto.randomBytes(18).toString('hex'); r.sesi = (r.sesi || []).concat(sha(t)).slice(-6); return r.kelas + '.' + r.slug + '.' + t; }
async function siswaDariToken(token) {
  const m = /^([ABC])\.([a-z0-9]{1,24})\.([a-f0-9]{36})$/.exec(String(token || ''));
  if (!m) { throw galat('sesi', 'Sesi tidak dikenal. Masuk lagi, ya.', 401); }
  const r = await simpanan().baca(jalurSiswa(m[1], m[2]));
  if (!r || (r.sesi || []).indexOf(sha(m[3])) < 0) { throw galat('sesi', 'Sesi sudah tidak berlaku. Masuk lagi, ya.', 401); }
  return r;
}
function tokenGuru() { const habis = Date.now() + 8 * 3600 * 1000; return habis + '.' + tanda('guru|' + habis); }
function cekGuru(t) {
  const m = /^(\d{13})\.([a-f0-9]{64})$/.exec(String(t || ''));
  if (!m || Number(m[1]) < Date.now() || !sama(m[2], tanda('guru|' + m[1]))) { throw galat('guru', 'Masuk sebagai guru dulu.', 401); }
}
const tunggu = function (ms) { return new Promise(function (ok) { setTimeout(ok, ms); }); };
async function semua(jalur, fn) { const hasil = []; for (let i = 0; i < jalur.length; i += 12) { (await Promise.all(jalur.slice(i, i + 12).map(fn))).forEach(function (x) { if (x) { hasil.push(x); } }); } return hasil; }
const papanCache = {};

/* ---------- aksi ---------- */
const AKSI = {
  /* apakah nama ini sudah dipakai di kelas itu */
  async cek(b) {
    const kelas = cekKelas(b.kelas), nama = rapikanNama(b.nama), slug = siput(nama);
    if (slug.length < 2) { throw galat('nama', 'Tulis namamu, minimal 2 huruf.'); }
    const r = await simpanan().baca(jalurSiswa(kelas, slug));
    return { ada: !!r, nama: r ? r.nama : nama, terkunci: !!(r && (r.gagal || 0) >= MAKS_GAGAL), perluRahasia: !!(r && !r.rh) };
  },
  async daftar(b) {
    const kelas = cekKelas(b.kelas), nama = rapikanNama(b.nama), slug = siput(nama), rh = cekRahasia(b.rahasia), S = simpanan(), p = jalurSiswa(kelas, slug);
    if (slug.length < 2) { throw galat('nama', 'Tulis namamu, minimal 2 huruf.'); }
    if (await S.baca(p)) { throw galat('dipakai', 'Nama ' + nama + ' sudah dipakai di kelas ' + kelas + '.', 409); }
    const kini = new Date().toISOString();
    const r = { v: 1, kelas: kelas, slug: slug, nama: nama, rh: hashRahasia(kelas, slug, rh), gagal: 0, dibuat: kini, diubah: kini, data: gabung({}, b.data), riwayat: gabungRiwayat([], b.riwayat) };
    const token = sesiBaru(r);
    try { await S.tulis(p, r, true); } catch (e) { throw galat('dipakai', 'Nama ' + nama + ' sudah dipakai di kelas ' + kelas + '.', 409); }
    return { token: token, nama: r.nama, kelas: kelas, data: r.data, riwayat: r.riwayat };
  },
  /* masuk lagi di perangkat lain dengan gambar rahasia */
  async masuk(b) {
    const kelas = cekKelas(b.kelas), slug = siput(b.nama), rh = cekRahasia(b.rahasia), S = simpanan(), p = jalurSiswa(kelas, slug);
    const r = await S.baca(p);
    if (!r) { throw galat('tidakada', 'Nama itu belum terdaftar di kelas ' + kelas + '.', 404); }
    if ((r.gagal || 0) >= MAKS_GAGAL) { throw galat('terkunci', 'Akun ini terkunci karena gambar rahasianya salah berkali-kali. Minta gurumu membukanya.', 423); }
    if (!r.rh) { r.rh = hashRahasia(kelas, slug, rh); } /* rahasia sudah diatur ulang oleh guru: gambar yang dipilih sekarang menjadi rahasia baru */
    else if (!sama(r.rh, hashRahasia(kelas, slug, rh))) {
      r.gagal = (r.gagal || 0) + 1; await S.tulis(p, r); await tunggu(400);
      throw galat('salah', 'Gambar rahasianya belum cocok. Sisa ' + Math.max(0, MAKS_GAGAL - r.gagal) + ' kali coba.', 403);
    }
    r.gagal = 0; r.data = gabung(r.data, b.data); r.riwayat = gabungRiwayat(r.riwayat, b.riwayat); r.diubah = new Date().toISOString();
    const token = sesiBaru(r); await S.tulis(p, r);
    return { token: token, nama: r.nama, kelas: kelas, data: r.data, riwayat: r.riwayat };
  },
  async simpan(b) {
    const r = await siswaDariToken(b.token);
    r.data = gabung(r.data, b.data); r.riwayat = gabungRiwayat(r.riwayat, b.riwayat); r.diubah = new Date().toISOString();
    await simpanan().tulis(jalurSiswa(r.kelas, r.slug), r); delete papanCache[r.kelas];
    return { nama: r.nama, kelas: r.kelas, data: r.data, riwayat: r.riwayat };
  },
  async keluar(b) {
    const r = await siswaDariToken(b.token), t = sha(String(b.token).split('.')[2]);
    r.sesi = (r.sesi || []).filter(function (s) { return s !== t; }); await simpanan().tulis(jalurSiswa(r.kelas, r.slug), r);
    return {};
  },
  /* papan bintang kelas: hanya nama, bintang, dan tingkat. Nilai ujian tidak ditampilkan. */
  async papan(b) {
    const r = await siswaDariToken(b.token), kelas = r.kelas, c = papanCache[kelas];
    if (c && Date.now() - c.t < 20000) { return { kelas: kelas, saya: r.nama, papan: c.v }; }
    const S = simpanan(), jalur = await S.daftar('siswa/' + kelas + '/');
    const v = (await semua(jalur, function (p) { return S.baca(p); })).map(ringkas).sort(function (x, y) { return y.bintang - x.bintang || y.tingkat - x.tingkat || (x.nama < y.nama ? -1 : 1); }).slice(0, 60);
    papanCache[kelas] = { t: Date.now(), v: v };
    return { kelas: kelas, saya: r.nama, papan: v };
  },
  async 'guru-masuk'(b) {
    await tunggu(500);
    if (!SANDI_GURU) { throw galat('belumsiap', 'Kata sandi guru belum dipasang di server.', 503); }
    if (!sama(String(b.sandi || ''), SANDI_GURU)) { throw galat('salah', 'Kata sandi salah.', 403); }
    return { token: tokenGuru() };
  },
  async 'guru-data'(b) {
    cekGuru(b.token);
    const S = simpanan(), jalur = await S.daftar('siswa/');
    const siswa = (await semua(jalur, function (p) { return S.baca(p); })).map(function (r) {
      return { kelas: r.kelas, slug: r.slug, nama: r.nama, dibuat: r.dibuat, diubah: r.diubah, terkunci: (r.gagal || 0) >= MAKS_GAGAL, data: r.data, riwayat: r.riwayat };
    });
    return { siswa: siswa, waktu: new Date().toISOString() };
  },
  /* guru membuka akun terkunci: siswa memilih gambar rahasia baru saat masuk berikutnya */
  async 'guru-reset'(b) {
    cekGuru(b.token);
    const kelas = cekKelas(b.kelas), slug = siput(b.slug), S = simpanan(), p = jalurSiswa(kelas, slug), r = await S.baca(p);
    if (!r) { throw galat('tidakada', 'Siswa tidak ditemukan.', 404); }
    r.rh = ''; r.gagal = 0; r.sesi = []; await S.tulis(p, r);
    return {};
  },
  async 'guru-hapus'(b) {
    cekGuru(b.token);
    const S = simpanan();
    if (b.slug) { await S.hapus(jalurSiswa(cekKelas(b.kelas), siput(b.slug))); delete papanCache[cekKelas(b.kelas)]; return { hapus: 1 }; }
    if (b.semuaKelas !== true) { throw galat('ragu', 'Sebutkan siswa yang dihapus.'); }
    const kelas = cekKelas(b.kelas), jalur = await S.daftar('siswa/' + kelas + '/');
    await semua(jalur, function (p) { return S.hapus(p); }); delete papanCache[kelas];
    return { hapus: jalur.length };
  },
  /* pemeriksaan: apakah penyimpanan bisa ditulis, dibaca, dan dihapus */
  async sehat() {
    const S = simpanan(), p = 'uji/sehat-' + crypto.randomBytes(4).toString('hex') + '.json';
    await S.tulis(p, { ok: 1 }, true); const r = await S.baca(p); await S.hapus(p);
    return { simpan: !!(r && r.ok === 1), blob: !!process.env.BLOB_READ_WRITE_TOKEN, sandiGuru: !!SANDI_GURU, rahasia: !!process.env.JP_RAHASIA };
  }
};

module.exports = async function (req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  try {
    let b = {};
    if (req.method === 'POST') {
      b = req.body;
      if (b === undefined) { const bagian = []; let n = 0; for await (const c of req) { n += c.length; if (n > 200000) { throw galat('besar', 'Kiriman terlalu besar.', 413); } bagian.push(c); } b = Buffer.concat(bagian).toString('utf8'); }
      if (typeof b === 'string') { b = b ? JSON.parse(b) : {}; }
      if (!b || typeof b !== 'object') { b = {}; }
    } else if (req.method === 'GET') {
      if (new URL(req.url, 'http://x').searchParams.get('aksi') !== 'sehat') { throw galat('metode', 'Gunakan POST.', 405); }
      b = { aksi: 'sehat' };
    } else { throw galat('metode', 'Gunakan POST.', 405); }
    const aksi = String(b.aksi || '');
    if (!Object.prototype.hasOwnProperty.call(AKSI, aksi)) { throw galat('aksi', 'Aksi tidak dikenal.', 404); }
    const hasil = await AKSI[aksi](b);
    res.statusCode = 200; res.end(JSON.stringify(Object.assign({ ok: true }, hasil)));
  } catch (e) {
    if (!e.kode) { console.error(e); }
    res.statusCode = e.status || 500; res.end(JSON.stringify({ ok: false, kode: e.kode || 'server', pesan: e.kode ? e.message : 'Server sedang bermasalah. Coba lagi sebentar.' }));
  }
};
module.exports._uji = { gabung: gabung, gabungRiwayat: gabungRiwayat, siput: siput };
