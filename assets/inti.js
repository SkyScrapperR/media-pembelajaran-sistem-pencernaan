/* Fungsi bersama: pembuat elemen, penyimpan progres, efek bunyi, dan ikon */
(function () {
  'use strict';
  var KEY = 'jelajah-pencernaan:v1';
  var KOSONG = { nama: '', suara: true, diag: null, pos: {}, ujian: null, riwayat: [] };
  function muat() {
    try { var r = JSON.parse(localStorage.getItem(KEY) || 'null'); if (r) { var d = {}; for (var k in KOSONG) { d[k] = r[k] !== undefined ? r[k] : KOSONG[k]; } return d; } } catch (e) { /* penyimpanan tidak tersedia */ }
    return JSON.parse(JSON.stringify(KOSONG));
  }
  var data = muat();
  function simpan() { try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) { /* hanya tersimpan selama halaman terbuka */ } }
  function catat(jenis, ringkas, nilai) {
    data.riwayat.push({ nama: data.nama || 'Tanpa nama', jenis: jenis, ringkas: ringkas, nilai: nilai, waktu: new Date().toISOString() });
    if (data.riwayat.length > 300) { data.riwayat = data.riwayat.slice(-300); }
    simpan();
  }
  function el(tag, attrs, kids) {
    var e = document.createElement(tag), k;
    if (attrs) { for (k in attrs) { if (attrs[k] === null || attrs[k] === undefined || attrs[k] === false) { continue; }
      if (k === 'class') { e.className = attrs[k]; } else if (k === 'text') { e.textContent = attrs[k]; } else if (k === 'html') { e.innerHTML = attrs[k]; }
      else if (k.slice(0, 2) === 'on') { e.addEventListener(k.slice(2), attrs[k]); } else { e.setAttribute(k, attrs[k] === true ? '' : attrs[k]); } } }
    [].concat(kids || []).forEach(function (c) { if (c === null || c === undefined || c === false) { return; } e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return e;
  }
  function acak(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  /* ---------- efek bunyi (Web Audio, tanpa file) ---------- */
  var ctx = null;
  function ac() {
    if (!data.suara) { return null; }
    try { if (!ctx) { var C = window.AudioContext || window.webkitAudioContext; if (!C) { return null; } ctx = new C(); } if (ctx.state === 'suspended') { ctx.resume(); } return ctx; } catch (e) { return null; }
  }
  function nada(f, d, tipe, kapan, g, ke) {
    var a = ac(); if (!a) { return; }
    var t = a.currentTime + (kapan || 0), o = a.createOscillator(), v = a.createGain();
    o.type = tipe || 'triangle'; o.frequency.setValueAtTime(f, t); if (ke) { o.frequency.exponentialRampToValueAtTime(ke, t + d); }
    v.gain.setValueAtTime(0.0001, t); v.gain.exponentialRampToValueAtTime(g || 0.1, t + 0.012); v.gain.exponentialRampToValueAtTime(0.0001, t + d);
    o.connect(v); v.connect(a.destination); o.start(t); o.stop(t + d + 0.03);
  }
  var bunyi = {
    ketuk: function () { nada(520, 0.06, 'triangle', 0, 0.07); },
    benar: function () { nada(660, 0.1); nada(990, 0.16, 'triangle', 0.08); },
    salah: function () { nada(220, 0.24, 'sawtooth', 0, 0.05, 140); },
    balik: function () { nada(420, 0.05, 'square', 0, 0.035); },
    menang: function () { [523, 659, 784, 1047].forEach(function (f, i) { nada(f, 0.22, 'triangle', i * 0.11, 0.11); }); }
  };
  var IKON = {
    logo: '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M9 3c0 2 1 3 1 5s-3 2-3 5 3 4 6 4 4 1 4 3" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/><circle cx="15.5" cy="9" r="3" fill="#fff"/></svg>',
    bintang: '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="currentColor" d="M12 2.6l2.9 6 6.6.8-4.9 4.6 1.3 6.5-5.9-3.3-5.9 3.3 1.3-6.5L2.5 9.4l6.6-.8z"/></svg>'
  };
  function bintang(n, maks) {
    var s = el('span', { 'class': 'stars', role: 'img', 'aria-label': n + ' dari ' + (maks || 3) + ' bintang' });
    for (var i = 0; i < (maks || 3); i++) { s.appendChild(el('span', { 'class': i < n ? '' : 'off', html: IKON.bintang })); }
    return s;
  }
  /* Si Nasi, maskot kecil */
  function nasi(ukuran, suasana) {
    var mulut = suasana === 'sedih' ? '<path d="M42 80q8-8 16 0" fill="none" stroke="#12262d" stroke-width="3" stroke-linecap="round"/>' : suasana === 'kaget' ? '<ellipse cx="50" cy="77" rx="4.5" ry="5.5" fill="#12262d"/>' : '<path d="M41 73q9 10 18 0" fill="none" stroke="#12262d" stroke-width="3" stroke-linecap="round"/>';
    return el('span', { 'aria-hidden': 'true', html: '<svg viewBox="0 0 100 124" width="' + ukuran + '" height="' + Math.round(ukuran * 1.24) + '"><path d="M15 68Q5 64 4 52M85 68q10-6 11-18M40 110l-3 9M60 110l3 9" fill="none" stroke="#12262d" stroke-width="3.5" stroke-linecap="round"/><path d="M50 8c24 0 36 26 36 54 0 30-16 50-36 50S14 92 14 62C14 34 26 8 50 8z" fill="#fffdf7" stroke="#12262d" stroke-width="3.5"/><ellipse cx="38" cy="58" rx="4.2" ry="5.5" fill="#12262d"/><ellipse cx="62" cy="58" rx="4.2" ry="5.5" fill="#12262d"/><circle cx="39.5" cy="56" r="1.4" fill="#fff"/><circle cx="63.5" cy="56" r="1.4" fill="#fff"/><ellipse cx="28" cy="71" rx="6" ry="3.4" fill="#ff6a4d" opacity=".5"/><ellipse cx="72" cy="71" rx="6" ry="3.4" fill="#ff6a4d" opacity=".5"/>' + mulut + '</svg>' });
  }
  var LENCANA = ['Pemilah Jitu', 'Navigator Nasi', 'Detektif Organ', 'Penjodoh Cermat', 'Sahabat Sehat', 'Penunjuk Tepat'];
  var PANGKAT = [[0, 'Penjelajah Pemula'], [60, 'Penjelajah Muda'], [140, 'Penjelajah Tangguh'], [220, 'Penjelajah Ahli'], [290, 'Profesor Pencernaan']];
  /* poin pengalaman: 20 untuk Cek Bekal, 10 per bintang pos, nilai ujian terbaik (maksimum 300) */
  function xp() { var n = data.diag ? 20 : 0; for (var k in data.pos) { n += (data.pos[k].bintang || 0) * 10; } if (data.ujian) { n += data.ujian.nilai; } return n; }
  function pangkat() {
    var x = xp(), i = 0; while (i + 1 < PANGKAT.length && x >= PANGKAT[i + 1][0]) { i++; }
    var bawah = PANGKAT[i][0], atas = i + 1 < PANGKAT.length ? PANGKAT[i + 1][0] : 300;
    return { xp: x, tingkat: i + 1, nama: PANGKAT[i][1], maju: Math.min(1, (x - bawah) / (atas - bawah)), berikut: i + 1 < PANGKAT.length ? PANGKAT[i + 1] : null };
  }
  /* medali lencana: no bisa angka atau huruf, warna mengikuti jenis */
  function medali(isi, label, terkunci, warna) {
    warna = warna || '#ff6a4d';
    return el('span', { 'class': 'medali' + (terkunci ? ' kunci' : ''), role: 'img', 'aria-label': label + (terkunci ? ' (belum diraih)' : '') }, [
      el('span', { html: '<svg viewBox="0 0 100 112" width="64" height="72" aria-hidden="true"><path d="M30 62L18 106l16-8 8 12 8-40zM70 62l12 44-16-8-8 12-8-40z" fill="' + (terkunci ? '#3a4f57' : '#6fd6cf') + '" stroke="#0c1a1f" stroke-width="2.4" stroke-linejoin="round"/><circle cx="50" cy="44" r="38" fill="' + (terkunci ? '#2b4048' : warna) + '" stroke="#0c1a1f" stroke-width="2.6"/><circle cx="50" cy="44" r="29" fill="none" stroke="' + (terkunci ? '#4a626b' : '#fff') + '" stroke-width="2" stroke-dasharray="3 5" opacity=".8"/><text x="50" y="55" text-anchor="middle" font-family="Fredoka, sans-serif" font-weight="700" font-size="30" fill="' + (terkunci ? '#5d757e' : '#fff') + '">' + isi + '</text></svg>' }),
      el('span', { 'class': 'small', text: label })
    ]);
  }
  /* hujan konfeti singkat untuk merayakan keberhasilan */
  function konfeti(banyak) {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) { return; }
    var c = el('canvas', { 'class': 'konfeti', 'aria-hidden': 'true' }); document.body.appendChild(c);
    var g = c.getContext('2d'), W = c.width = innerWidth, H = c.height = innerHeight, warna = ['#ff6a4d', '#6fd6cf', '#ffc857', '#ff93ae', '#ffffff'], p = [], t0 = performance.now();
    for (var i = 0; i < (banyak || 110); i++) { p.push({ x: W / 2 + (Math.random() - 0.5) * W * 0.5, y: H * 0.35, vx: (Math.random() - 0.5) * 13, vy: -Math.random() * 13 - 3, r: 4 + Math.random() * 5, a: Math.random() * 6.28, va: (Math.random() - 0.5) * 0.4, c: warna[i % warna.length] }); }
    (function langkah(t) {
      var umur = (t - t0) / 1000; g.clearRect(0, 0, W, H);
      p.forEach(function (q) { q.vy += 0.32; q.vx *= 0.99; q.x += q.vx; q.y += q.vy; q.a += q.va; g.save(); g.translate(q.x, q.y); g.rotate(q.a); g.globalAlpha = Math.max(0, 1 - umur / 2.6); g.fillStyle = q.c; g.fillRect(-q.r, -q.r * 0.5, q.r * 2, q.r); g.restore(); });
      if (umur < 2.6) { requestAnimationFrame(langkah); } else { c.remove(); }
    })(t0);
  }
  /* bintang muncul satu per satu dengan bunyi */
  function bintangMuncul(n, maks) {
    var s = bintang(n, maks); s.classList.add('besar');
    [].forEach.call(s.children, function (b, i) { if (i < n) { b.style.animationDelay = (0.25 + i * 0.3) + 's'; b.classList.add('muncul'); setTimeout(function () { nada(700 + i * 180, 0.14, 'triangle', 0, 0.09); }, 250 + i * 300); } });
    return s;
  }
  var IKON_SUARA = ['<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16.5 8.5a5 5 0 010 7"/></svg>', '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9z"/><path d="M17 9l5 6M22 9l-5 6"/></svg>'];
  function kepala(aktif, dasar) {
    dasar = dasar || '../';
    var ts = el('button', { 'class': 'pill', type: 'button', 'aria-pressed': data.suara ? 'true' : 'false', 'aria-label': 'Efek bunyi', html: IKON_SUARA[data.suara ? 0 : 1], onclick: function () { data.suara = !data.suara; simpan(); ts.innerHTML = IKON_SUARA[data.suara ? 0 : 1]; ts.setAttribute('aria-pressed', data.suara ? 'true' : 'false'); if (data.suara) { bunyi.ketuk(); } } });
    var link = function (h, t, id) { return el('a', { href: dasar + h, text: t, 'aria-current': aktif === id ? 'page' : null }); };
    return el('header', { 'class': 'bar noprint' }, [
      el('a', { 'class': 'brand', href: dasar }, [el('span', { 'class': 'logo', html: IKON.logo }), 'Jelajah Pencernaan']),
      el('nav', { 'class': 'nav', 'aria-label': 'Navigasi situs' }, [link('', 'Beranda', 'beranda'), link('belajar/', 'Belajar', 'belajar'), link('asesmen/', 'Asesmen', 'asesmen'), ts])
    ]);
  }
  window.JP = { data: data, simpan: simpan, catat: catat, el: el, acak: acak, bunyi: bunyi, bintang: bintang, bintangMuncul: bintangMuncul, konfeti: konfeti, medali: medali, pangkat: pangkat, LENCANA: LENCANA, nasi: nasi, kepala: kepala, IKON: IKON,
    embed: /[?&]embed=1/.test(location.search),
    /* pemain baru: progres dikosongkan, riwayat untuk rekap guru tetap ada */
    gantiPemain: function () { data.nama = ''; data.diag = null; data.pos = {}; data.ujian = null; simpan(); },
    hapusRiwayat: function () { data.riwayat = []; simpan(); } };
})();
