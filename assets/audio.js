/* Semua suara situs: efek bunyi, 5 lagu latar yang disusun Web Audio, suara Si Nasi, dan pembaca soal */
(function () {
  'use strict';
  var JP = window.JP, data = JP.data, el = JP.el;
  var dasar = (document.currentScript && document.currentScript.src || '').replace(/assets\/audio\.js.*$/, '') || './';
  var ctx = null, sfxOut = null, musOut = null, musLp = null, derau = null;

  function siapkan() {
    if (ctx) { if (ctx.state === 'suspended') { ctx.resume(); } return ctx; }
    try {
      var C = window.AudioContext || window.webkitAudioContext; if (!C) { return null; }
      ctx = new C();
      var komp = ctx.createDynamicsCompressor(); komp.threshold.value = -10; komp.ratio.value = 3; komp.knee.value = 12; komp.connect(ctx.destination);
      sfxOut = ctx.createGain(); sfxOut.gain.value = data.volume; sfxOut.connect(komp);
      musLp = ctx.createBiquadFilter(); musLp.type = 'lowpass'; musLp.frequency.value = 6000; musLp.connect(komp);
      musOut = ctx.createGain(); musOut.gain.value = 0.0001; musOut.connect(musLp);
      var n = ctx.sampleRate, b = ctx.createBuffer(1, n, n), d = b.getChannelData(0);
      for (var i = 0; i < n; i++) { d[i] = Math.random() * 2 - 1; }
      derau = b;
      if (ctx.state === 'suspended') { ctx.resume(); }
      return ctx;
    } catch (e) { return null; }
  }
  function hz(m) { return 440 * Math.pow(2, (m - 69) / 12); }

  /* ---------- alat bunyi dasar ---------- */
  function osc(out, f, t, d, g, tipe, ke, serang) {
    var o = ctx.createOscillator(), v = ctx.createGain();
    o.type = tipe || 'triangle'; o.frequency.setValueAtTime(f, t); if (ke) { o.frequency.exponentialRampToValueAtTime(ke, t + d); }
    v.gain.setValueAtTime(0.0001, t); v.gain.exponentialRampToValueAtTime(g, t + (serang || 0.012)); v.gain.exponentialRampToValueAtTime(0.0001, t + d);
    o.connect(v); v.connect(out); o.start(t); o.stop(t + d + 0.05);
  }
  function semprot(out, t, d, g, jenis, f, q, keF) {
    var s = ctx.createBufferSource(), fl = ctx.createBiquadFilter(), v = ctx.createGain();
    s.buffer = derau; s.loop = true; fl.type = jenis || 'bandpass'; fl.frequency.setValueAtTime(f || 1500, t); if (keF) { fl.frequency.exponentialRampToValueAtTime(keF, t + d); } fl.Q.value = q || 0.8;
    v.gain.setValueAtTime(0.0001, t); v.gain.exponentialRampToValueAtTime(g, t + 0.006); v.gain.exponentialRampToValueAtTime(0.0001, t + d);
    s.connect(fl); fl.connect(v); v.connect(out); s.start(t, Math.random() * 0.5); s.stop(t + d + 0.05);
  }

  /* ---------- efek bunyi ---------- */
  function sfx(fn) { return function () { if (!data.suara || !siapkan()) { return; } var a = arguments; try { fn.apply(null, [ctx.currentTime + 0.01].concat([].slice.call(a))); } catch (e) { /* abaikan */ } }; }
  var acakDari = function (a) { return a[Math.floor(Math.random() * a.length)]; };
  var bunyiBaru = {
    ketuk: sfx(function (t) { osc(sfxOut, 460 + Math.random() * 140, t, 0.06, 0.07); }),
    benar: sfx(function (t) { acakDari([[660, 990], [784, 1175], [587, 880, 1175]]).forEach(function (f, i) { osc(sfxOut, f, t + i * 0.075, 0.18, 0.1); }); }),
    salah: sfx(function (t) { if (Math.random() < 0.5) { osc(sfxOut, 300, t, 0.26, 0.07, 'triangle', 190); } else { osc(sfxOut, 330, t, 0.12, 0.05, 'square'); osc(sfxOut, 262, t + 0.11, 0.2, 0.05, 'square'); } }),
    balik: sfx(function (t) { osc(sfxOut, 420, t, 0.05, 0.04, 'square'); }),
    menang: sfx(function (t) { [523, 659, 784, 1047].forEach(function (f, i) { osc(sfxOut, f, t + i * 0.1, 0.25, 0.1); }); [1047, 1319, 1568].forEach(function (f) { osc(sfxOut, f, t + 0.42, 0.9, 0.04, 'sine'); }); }),
    wus: sfx(function (t) { semprot(sfxOut, t, 0.24, 0.07, 'bandpass', 300, 1.2, 2600); }),
    koin: sfx(function (t) { osc(sfxOut, 988, t, 0.07, 0.05, 'square'); osc(sfxOut, 1319, t + 0.07, 0.28, 0.05, 'square'); }),
    kombo: sfx(function (t, n) { var b = 523 * Math.pow(2, Math.min(n || 3, 10) / 12); [1, 1.26, 1.5, 2].forEach(function (k, i) { osc(sfxOut, b * k, t + i * 0.055, 0.16, 0.07); }); }),
    naik: sfx(function (t, i) { osc(sfxOut, [523, 587, 659, 784, 880, 1047, 1175, 1319][(i || 0) % 8], t, 0.2, 0.11); }),
    lencana: sfx(function (t) { [1568, 2093, 2637, 3136, 4186].forEach(function (f, i) { osc(sfxOut, f, t + i * 0.05, 0.4, 0.045, 'sine'); }); [523, 784].forEach(function (f) { osc(sfxOut, f, t, 0.7, 0.05); }); }),
    naikLevel: sfx(function (t) {
      [[523, 0], [659, 0.12], [784, 0.24], [1047, 0.36]].forEach(function (p) { osc(sfxOut, p[0], t + p[1], 0.2, 0.1); osc(sfxOut, p[0] / 2, t + p[1], 0.2, 0.04, 'square'); });
      [1047, 1319, 1568].forEach(function (f) { osc(sfxOut, f, t + 0.5, 1.2, 0.06); }); semprot(sfxOut, t + 0.5, 1.1, 0.05, 'highpass', 6000);
    }),
    pop: sfx(function (t) { osc(sfxOut, 520 + Math.random() * 200, t, 0.08, 0.13, 'sine', 1500); semprot(sfxOut, t, 0.04, 0.04, 'highpass', 4000); }),
    blip: sfx(function (t) { osc(sfxOut, 800 + Math.random() * 400, t, 0.035, 0.02, 'square'); }),
    detak: sfx(function (t) { osc(sfxOut, 1200, t, 0.03, 0.04, 'square'); }),
    drumroll: sfx(function (t, lama) { lama = lama || 1.4; for (var k = 0; k * 0.045 < lama; k++) { semprot(sfxOut, t + k * 0.045, 0.06, 0.02 + 0.06 * (k * 0.045 / lama), 'bandpass', 1800, 0.7); } }),
    cring: sfx(function (t) { semprot(sfxOut, t, 1.3, 0.09, 'highpass', 6500); osc(sfxOut, 1568, t, 0.8, 0.05); osc(sfxOut, 2093, t, 0.8, 0.035, 'sine'); }),
    bintang: sfx(function (t, i) { osc(sfxOut, 700 + (i || 0) * 180, t, 0.16, 0.09); osc(sfxOut, (700 + (i || 0) * 180) * 2, t + 0.02, 0.3, 0.025, 'sine'); })
  };
  Object.keys(bunyiBaru).forEach(function (k) { JP.bunyi[k] = bunyiBaru[k]; });

  /* ---------- lagu ---------- */
  function A(b, n) { return { b: b, n: n }; }
  var LAGU = [
    { id: 'petualangan', nama: 'Petualangan Si Nasi', ket: 'Ceria dan santai', bpm: 92,
      akor: [A(36, [60, 64, 67, 72]), A(33, [57, 60, 64, 69]), A(29, [57, 60, 65, 69]), A(31, [55, 59, 62, 67])],
      arp: [0, 1, 2, 3, 2, 1, 3, 1], arpAlat: 'tri', arpG: 0.1, bass: 'r...r...', bassAlat: 'sin', bassG: 0.16, pad: 0.03,
      kilau: { p: 0.75, langkah: [2, 6], skala: [72, 74, 76, 79, 81, 84], ganjil: true, alat: 'bell' }, drum: { k: 'x.......', h: 'x.x.x.x.' }, drumG: 0.6 },
    { id: 'riang', nama: 'Riang Ceria', ket: 'Bersemangat, cocok untuk bermain', bpm: 120,
      akor: [A(29, [60, 65, 69, 72]), A(36, [60, 64, 67, 72]), A(26, [62, 65, 69, 74]), A(34, [62, 65, 70, 74])],
      lead: [72, 0, 69, 72, 74, 0, 72, 69, 67, 0, 64, 67, 69, 0, 67, 0, 69, 0, 65, 69, 72, 0, 74, 72, 70, 0, 69, 67, 65, 0, 0, 0], leadAlat: 'tri', leadG: 0.1, leadTiap: 2,
      arp: [0, 1, 2, 3, 2, 1, 2, 3], arpAlat: 'tri', arpG: 0.07, arpSaatLead: false, skank: '.x.x.x.x', bass: 'r.f.r.f.', bassAlat: 'tri', bassG: 0.15,
      drum: { k: 'x...x...', s: '..x...x.', h: 'xxxxxxxx' }, drumG: 1 },
    { id: 'tenang', nama: 'Tenang Berpikir', ket: 'Lembut, cocok saat mengerjakan soal', bpm: 70,
      akor: [A(33, [57, 60, 64, 67]), A(29, [53, 57, 60, 64]), A(36, [55, 60, 64, 71]), A(31, [55, 59, 62, 64])],
      arp: [0, null, 2, null, 1, null, 3, null], arpAlat: 'ep', arpG: 0.07, bass: 'r.......', bassAlat: 'sin', bassG: 0.13, bassLama: 2.2, pad: 0.035,
      kilau: { p: 0.3, langkah: [3, 7], skala: [69, 72, 74, 76, 79], alat: 'ep' }, drum: { k: 'x.....x.', h: '..x...x.' }, drumG: 0.45 },
    { id: 'gelembung', nama: 'Gelembung Mimpi', ket: 'Tenang seperti melayang', bpm: 84,
      akor: [A(27, [63, 67, 70, 75]), A(24, [60, 63, 67, 72]), A(32, [60, 63, 68, 72]), A(34, [62, 65, 70, 74])],
      arp: [0, 2, 1, 3, 2, 0, 3, 1], arpAlat: 'bell', arpG: 0.06, arpOkt: 12, bass: 'r...f...', bassAlat: 'sin', bassG: 0.14, pad: 0.04,
      kilau: { p: 0.35, langkah: [1, 3, 5, 7], skala: [75, 77, 79, 82, 84, 87], alat: 'bell' } },
    { id: 'pantai', nama: 'Pantai Tropis', ket: 'Santai dengan bunyi kalimba', bpm: 100,
      akor: [A(31, [62, 67, 71, 74]), A(28, [64, 67, 71, 76]), A(24, [64, 67, 72, 76]), A(26, [62, 66, 69, 74])],
      lead: [79, 0, 76, 0, 74, 76, 0, 0, 76, 0, 74, 0, 71, 0, 0, 0, 72, 0, 74, 76, 0, 74, 72, 0, 74, 0, 0, 0, 0, 0, 0, 0], leadAlat: 'bell', leadG: 0.08, leadTiap: 2,
      arp: [0, 2, 1, 3, null, 2, 1, 0], arpAlat: 'bell', arpG: 0.05, arpOkt: 12, skank: '..x...x.', bass: 'r..r.f..', bassAlat: 'tri', bassG: 0.15,
      drum: { k: 'x.....x.', s: '....x...', h: '.x.x.x.x' }, drumG: 0.8 },
    { id: 'jalan', nama: 'Jalan-jalan Santai', ket: 'Jazz ringan untuk bersantai', bpm: 104,
      akor: [A(26, [60, 62, 65, 69]), A(31, [59, 62, 65, 67]), A(24, [59, 60, 64, 67]), A(33, [61, 64, 67, 69])],
      bassPola: [0, null, 7, null, 12, null, 7, null], bassAlat: 'tri', bassG: 0.15, komp: '.x...x..',
      kilau: { p: 0.45, langkah: [1, 3, 6], skala: [69, 72, 74, 75, 76, 79], alat: 'ep' }, drum: { k: 'x.......', s: '......x.', h: 'x.xxx.xx' }, drumG: 0.6 },
    { id: 'robot', nama: 'Robot 8-bit', ket: 'Seperti game jadul, cepat dan seru', bpm: 140,
      akor: [A(33, [57, 60, 64, 69]), A(29, [57, 60, 65, 69]), A(36, [60, 64, 67, 72]), A(31, [59, 62, 67, 71])],
      lead: [76, 0, 76, 79, 0, 76, 74, 72, 72, 0, 0, 74, 76, 0, 72, 0, 74, 0, 74, 76, 0, 74, 72, 71, 71, 0, 0, 0, 67, 0, 71, 0], leadAlat: 'sq', leadG: 0.04, leadTiap: 1,
      arp: [0, 1, 2, 3, 2, 1, 0, 1], arpAlat: 'sq', arpG: 0.02, arpOkt: 12, bass: 'r.r.r.r.', bassAlat: 'sq', bassG: 0.045,
      drum: { k: 'x...x...', s: '..x...x.', h: 'x.x.x.x.' }, drumG: 0.9 },
    { id: 'juara', nama: 'Pesta Juara', ket: 'Meriah untuk merayakan kemenangan', bpm: 132,
      akor: [A(31, [62, 67, 71, 74]), A(26, [62, 66, 69, 74]), A(28, [64, 67, 71, 76]), A(24, [64, 67, 72, 76])],
      lead: [74, 0, 74, 76, 79, 0, 76, 74, 74, 0, 72, 74, 78, 0, 0, 0, 76, 0, 74, 76, 79, 0, 83, 81, 79, 0, 76, 74, 72, 0, 74, 0], leadAlat: 'tri', leadG: 0.1, leadTiap: 1,
      arp: [0, 1, 2, 3, 0, 1, 2, 3], arpAlat: 'sq', arpG: 0.018, bass: 'r.r.f.r.', bassAlat: 'tri', bassG: 0.15,
      drum: { k: 'x...x.x.', s: '..x...x.', h: 'xxxxxxxx' }, drumG: 1.1 }
  ];
  var LAGU_ID = {}; LAGU.forEach(function (l) { LAGU_ID[l.id] = l; });
  var KERAS = 1.6; /* penguat semua alat musik */
  function alat(nama, m, t, d, g) {
    var f = hz(m); g = g * KERAS;
    if (nama === 'sin') { osc(musOut, f, t, d, g, 'sine'); osc(musOut, f * 2, t, d * 0.8, g * 0.35, 'triangle'); }
    else if (nama === 'sq') { osc(musOut, f, t, d, g, 'square'); }
    else if (nama === 'bell') { osc(musOut, f, t, d * 2.2, g, 'sine'); osc(musOut, f * 2.01, t, d * 1.1, g * 0.35, 'sine'); }
    else if (nama === 'ep') { osc(musOut, f, t, d * 2.4, g, 'sine', null, 0.008); osc(musOut, f * 2.003, t, d * 0.9, g * 0.3, 'sine'); osc(musOut, f * 0.998, t, d * 2.4, g * 0.4, 'triangle'); }
    else { osc(musOut, f, t, d, g, 'triangle'); }
  }
  function kick(t, g) { osc(musOut, 150, t, 0.28, 0.55 * g, 'sine', 45); osc(musOut, 300, t, 0.03, 0.12 * g, 'triangle', 120); }
  function snare(t, g) { semprot(musOut, t, 0.14, 0.16 * g, 'bandpass', 1900, 0.7); osc(musOut, 190, t, 0.08, 0.09 * g, 'triangle'); }
  function hat(t, g) { semprot(musOut, t, 0.035, 0.06 * g, 'highpass', 7500); }

  var DAFTAR = { ceria: ['petualangan', 'riang', 'pantai', 'robot', 'jalan', 'gelembung', 'juara'], fokus: ['tenang', 'gelembung', 'jalan', 'pantai'] };
  var MUS = { lagu: null, jalan: false, timer: null, langkah: 0, waktu: 0, halaman: 'petualangan', daftar: 'ceria', otomatis: null, sementara: null, durasi: 70 };
  function langkahMusik() {
    if (!ctx || !MUS.jalan) { return; }
    var L = MUS.lagu, det = 60 / L.bpm / 2, bars = L.akor.length;
    while (MUS.waktu < ctx.currentTime + 0.3) {
      var n = MUS.langkah, bar = Math.floor(n / 8) % bars, k = n % 8, siklus = Math.floor(n / (8 * bars)), ak = L.akor[bar], t = MUS.waktu;
      var bc = L.bass && L.bass[k];
      if (bc && bc !== '.') { alat(L.bassAlat, ak.b + (bc === 'f' ? 19 : bc === 'o' ? 24 : 12), t, L.bassLama || 0.45, L.bassG); }
      if (k === 0 && L.pad) { ak.n.forEach(function (m) { osc(musOut, hz(m), t, det * 8, L.pad * KERAS, 'sine', null, 0.25); }); }
      var leadAktif = L.lead && siklus % L.leadTiap === 0;
      if (leadAktif) { var m = L.lead[(bar * 8 + k) % L.lead.length]; if (m) { alat(L.leadAlat, m, t, det * 1.8, L.leadG); } }
      if (L.arp && !(leadAktif && L.arpSaatLead === false)) { var ix = L.arp[k]; if (ix !== null && ix !== undefined) { alat(L.arpAlat, ak.n[ix] + (L.arpOkt || 0), t, 0.5, L.arpG); } }
      if (L.skank && L.skank[k] === 'x') { ak.n.slice(0, 3).forEach(function (m) { osc(musOut, hz(m), t, 0.11, 0.022 * KERAS, 'square'); }); }
      if (L.komp && L.komp[k] === 'x') { ak.n.forEach(function (m) { alat('ep', m, t, 0.35, 0.03); }); }
      if (L.bassPola) { var bo = L.bassPola[k]; if (bo !== null && bo !== undefined) { alat(L.bassAlat, ak.b + 12 + bo, t, det * 1.8, L.bassG); } }
      if (L.kilau && L.kilau.langkah.indexOf(k) >= 0 && (!L.kilau.ganjil || siklus % 2 === 1) && Math.random() < L.kilau.p) { alat(L.kilau.alat, acakDari(L.kilau.skala), t, 0.6, 0.06); }
      if (L.drum) {
        var g = L.drumG || 1;
        if (L.drum.k && L.drum.k[k] === 'x') { kick(t, g); }
        if (L.drum.s && L.drum.s[k] === 'x') { snare(t, g); }
        if (L.drum.h && L.drum.h[k] === 'x') { hat(t, g * (k % 2 ? 0.6 : 1)); }
        if (bar === bars - 1 && siklus % 2 === 1 && k >= 4) { snare(t, g * 0.35 * (k - 3)); snare(t + det / 2, g * 0.3 * (k - 3)); }
      }
      /* mode otomatis: ganti lagu di awal putaran setelah sekitar satu menit */
      if (k === 7 && bar === bars - 1 && !MUS.sementara && data.lagu === 'auto' && (n + 1) * det >= MUS.durasi) { setTimeout(laguBerikut, 0); MUS.waktu += det; MUS.langkah++; break; }
      MUS.waktu += det; MUS.langkah++;
    }
  }
  function laguAktif() { return MUS.sementara || (data.lagu !== 'auto' && LAGU_ID[data.lagu] ? data.lagu : MUS.otomatis || MUS.halaman); }
  function laguBerikut() {
    var d = DAFTAR[MUS.daftar], i = d.indexOf(MUS.lagu ? MUS.lagu.id : MUS.halaman);
    MUS.otomatis = d[(i + 1) % d.length];
    musikMulai(true);
    JP.toast('♪ ' + LAGU_ID[MUS.otomatis].nama, 1800);
  }
  function targetVolume() { return 1.25 * data.volume * (MUS.redam ? 0.25 : 1); }
  function musikMulai(paksa) {
    if (!data.musik || !siapkan()) { return; }
    var id = laguAktif();
    if (MUS.jalan && MUS.lagu && MUS.lagu.id === id && !paksa) { return; }
    var lanjut = 0;
    try {
      var s = JSON.parse(sessionStorage.getItem('jp-musik') || 'null');
      if (s && !MUS.lagu && !MUS.sementara && data.lagu === 'auto' && DAFTAR[MUS.daftar].indexOf(s.id) >= 0) { MUS.otomatis = s.id; id = s.id; }
      if (s && s.id === id && !MUS.lagu) { lanjut = s.langkah; }
    } catch (e) { /* abaikan */ }
    var mulai = function () {
      MUS.lagu = LAGU_ID[id]; MUS.langkah = lanjut; MUS.waktu = ctx.currentTime + 0.06; MUS.jalan = true;
      clearInterval(MUS.timer); MUS.timer = setInterval(langkahMusik, 90); langkahMusik();
      musOut.gain.cancelScheduledValues(ctx.currentTime); musOut.gain.setValueAtTime(Math.max(0.0001, musOut.gain.value), ctx.currentTime); musOut.gain.exponentialRampToValueAtTime(targetVolume(), ctx.currentTime + 1.2);
      perbaruiIkon();
    };
    if (MUS.jalan) { musOut.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.12); MUS.jalan = false; clearInterval(MUS.timer); setTimeout(mulai, 450); } else { mulai(); }
  }
  function musikHenti() {
    if (!MUS.jalan) { return; } MUS.jalan = false; clearInterval(MUS.timer);
    try { musOut.gain.cancelScheduledValues(ctx.currentTime); musOut.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.15); } catch (e) { /* abaikan */ }
    perbaruiIkon();
  }
  function redam(ya) { MUS.redam = ya; if (ctx && MUS.jalan) { musOut.gain.setTargetAtTime(targetVolume(), ctx.currentTime, 0.2); } }
  function simpanPosisi() { try { sessionStorage.setItem('jp-musik', JSON.stringify({ id: MUS.lagu ? MUS.lagu.id : null, langkah: MUS.langkah, main: MUS.jalan })); } catch (e) { /* abaikan */ } }

  /* ---------- suara Si Nasi dan pembaca soal (rekaman MP3 bila ada, cadangan suara peramban) ---------- */
  var VOK = { files: null, el: null, tombol: null };
  try { fetch(dasar + 'audio/asesmen/manifest.json', { cache: 'no-cache' }).then(function (r) { return r.ok ? r.json() : null; }).then(function (m) { VOK.files = m && m.files || {}; }).catch(function () { VOK.files = {}; }); } catch (e) { VOK.files = {}; }
  function hentiVokal() {
    if (VOK.el) { try { VOK.el.pause(); } catch (e) { /* abaikan */ } VOK.el = null; }
    try { if (window.speechSynthesis) { speechSynthesis.cancel(); } } catch (e) { /* abaikan */ }
    if (VOK.tombol) { VOK.tombol.classList.remove('aktif'); VOK.tombol.setAttribute('aria-pressed', 'false'); VOK.tombol = null; }
    redam(false);
  }
  function suaraPeramban() { try { return (speechSynthesis.getVoices() || []).filter(function (v) { return /^id/i.test(v.lang); })[0] || null; } catch (e) { return null; } }
  function putarVokal(kunci, teks, tombol, nada) {
    hentiVokal();
    var file = VOK.files && VOK.files[kunci];
    var selesai = function () { if (VOK.tombol === tombol) { hentiVokal(); } else { redam(false); } };
    if (tombol) { VOK.tombol = tombol; tombol.classList.add('aktif'); tombol.setAttribute('aria-pressed', 'true'); }
    redam(true);
    if (file) {
      var a = new Audio(dasar + 'audio/asesmen/' + file); a.volume = Math.min(1, data.volume + 0.2); VOK.el = a;
      a.onended = selesai; a.onerror = function () { VOK.el = null; bacaPeramban(teks, selesai, nada); };
      var p = a.play(); if (p && p.catch) { p.catch(function () { if (VOK.el === a) { selesai(); } }); }
      return true;
    }
    return bacaPeramban(teks, selesai, nada);
  }
  function bacaPeramban(teks, selesai, nada) {
    var v = suaraPeramban();
    if (!v || !teks) { selesai(); return false; }
    try { var u = new SpeechSynthesisUtterance(teks); u.voice = v; u.lang = v.lang; u.rate = 0.95; u.pitch = nada || 1; u.onend = selesai; u.onerror = selesai; speechSynthesis.speak(u); return true; } catch (e) { selesai(); return false; }
  }
  /* tombol Dengarkan untuk membacakan soal atau petunjuk */
  function tombolBaca(kunci, teks, label) {
    var b = el('button', { 'class': 'baca', type: 'button', 'aria-pressed': 'false', 'aria-label': label || 'Dengarkan', title: label || 'Dengarkan',
      html: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16 9a4 4 0 010 6M18.5 6.5a7.5 7.5 0 010 11"/></svg><span>Dengarkan</span>',
      onclick: function () { if (VOK.tombol === b) { hentiVokal(); return; } siapkan(); if (!putarVokal(kunci, teks, b)) { JP.toast('Suara belum tersedia di perangkat ini.'); } } });
    return b;
  }
  /* Si Nasi berbicara: kelompok kalimat dipilih acak */
  function nasiBicara(kelompok) {
    if (!data.vokal) { return; }
    var daftar = (window.JP_SOAL && JP_SOAL.NASI && JP_SOAL.NASI[kelompok]) || [];
    if (!daftar.length) { return; }
    var i = Math.floor(Math.random() * daftar.length);
    setTimeout(function () { putarVokal('nasi-' + kelompok + '-' + (i + 1), daftar[i], null, 1.35); }, 350);
    return daftar[i];
  }

  /* ---------- panel suara dan musik ---------- */
  var IKON_EQ = '<span class="eq" aria-hidden="true"><i></i><i></i><i></i></span>';
  var tombolTerdaftar = [];
  function perbaruiIkon() { tombolTerdaftar.forEach(function (b) { b.classList.toggle('main', MUS.jalan); b.setAttribute('aria-label', 'Suara dan musik' + (MUS.jalan ? ', sedang memutar ' + MUS.lagu.nama : '')); }); }
  var panel = null;
  function saklar(label, nilai, ubah) {
    var c = el('input', { type: 'checkbox', role: 'switch' }); c.checked = !!nilai;
    c.addEventListener('change', function () { ubah(c.checked); });
    return el('label', { 'class': 'saklar' }, [el('span', { text: label }), c]);
  }
  function bukaPanel(pemicu) {
    if (panel) { tutupPanel(); return; }
    siapkan();
    var daftar = el('div', { 'class': 'stack', style: 'gap:6px', role: 'radiogroup', 'aria-label': 'Pilih lagu' });
    function isiDaftar() {
      daftar.textContent = '';
      [{ id: 'auto', nama: 'Otomatis', ket: 'Berganti-ganti lagu sendiri' }].concat(LAGU).forEach(function (l) {
        var pilih = data.lagu === l.id;
        daftar.appendChild(el('button', { 'class': 'lagu' + (pilih ? ' pilih' : ''), type: 'button', role: 'radio', 'aria-checked': pilih ? 'true' : 'false', onclick: function () {
          data.lagu = l.id; data.musik = true; MUS.sementara = null; MUS.otomatis = null; JP.simpan(); isiDaftar(); cekMusik.checked = true; musikMulai(true);
          JP.toast(l.id === 'auto' ? 'Otomatis: lagu berganti sendiri sekitar setiap satu menit' : 'Lagu: ' + l.nama + ' (diulang terus)');
        } }, [el('b', { text: l.nama }), el('span', { 'class': 'small muted', text: l.ket })]));
      });
    }
    isiDaftar();
    var cekMusik;
    var vol = el('input', { type: 'range', min: '0', max: '1', step: '0.05', value: String(data.volume), 'aria-label': 'Volume' });
    vol.addEventListener('input', function () { data.volume = parseFloat(vol.value); JP.simpan(); if (sfxOut) { sfxOut.gain.value = data.volume; } redam(MUS.redam); });
    vol.addEventListener('change', function () { JP.bunyi.ketuk(); });
    var sMusik = saklar('Musik latar', data.musik, function (v) { data.musik = v; JP.simpan(); if (v) { musikMulai(true); } else { musikHenti(); } });
    cekMusik = sMusik.querySelector('input');
    panel = el('div', { 'class': 'popsuara', role: 'dialog', 'aria-label': 'Suara dan musik' }, [
      el('div', { 'class': 'row', style: 'justify-content:space-between' }, [el('h3', { text: 'Suara dan musik' }), el('button', { 'class': 'pill', type: 'button', 'aria-label': 'Tutup', text: '✕', onclick: tutupPanel })]),
      sMusik,
      daftar,
      el('label', { 'class': 'stack', style: 'gap:4px' }, [el('span', { 'class': 'small muted', text: 'Volume' }), vol]),
      saklar('Efek bunyi', data.suara, function (v) { data.suara = v; JP.simpan(); if (v) { JP.bunyi.benar(); } }),
      saklar('Suara Si Nasi', data.vokal, function (v) { data.vokal = v; JP.simpan(); if (v) { nasiBicara('halo'); } })
    ]);
    document.body.appendChild(panel);
    var r = pemicu.getBoundingClientRect();
    panel.style.top = Math.round(r.bottom + 8) + 'px';
    panel.style.right = Math.max(12, Math.round(innerWidth - r.right)) + 'px';
    setTimeout(function () { document.addEventListener('pointerdown', luar); document.addEventListener('keydown', esc); }, 0);
    panel.querySelector('input').focus();
  }
  function luar(e) { if (panel && !panel.contains(e.target) && !e.target.closest('.tsuara')) { tutupPanel(); } }
  function esc(e) { if (e.key === 'Escape') { tutupPanel(); } }
  function tutupPanel() { if (!panel) { return; } panel.remove(); panel = null; document.removeEventListener('pointerdown', luar); document.removeEventListener('keydown', esc); }
  function tombolSuara() {
    var b = el('button', { 'class': 'pill tsuara', type: 'button', 'aria-haspopup': 'dialog', html: IKON_EQ + '<svg class="not" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18V5l11-2v13"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="17.5" cy="16" r="2.5"/></svg>',
      onclick: function () { bukaPanel(b); } });
    tombolTerdaftar.push(b); perbaruiIkon();
    return [b];
  }

  /* ---------- mulai ---------- */
  if (!JP.embed) {
    var picu = function () { removeEventListener('pointerdown', picu, true); removeEventListener('keydown', picu, true); siapkan(); musikMulai(); };
    addEventListener('pointerdown', picu, true); addEventListener('keydown', picu, true);
    document.addEventListener('visibilitychange', function () { if (document.hidden) { simpanPosisi(); musikHenti(); hentiVokal(); } else if (data.musik && ctx) { musikMulai(); } });
    addEventListener('pagehide', simpanPosisi);
    /* bila musik sudah berjalan di halaman sebelumnya, coba lanjutkan langsung */
    try { var lalu = JSON.parse(sessionStorage.getItem('jp-musik') || 'null'); if (lalu && lalu.main && data.musik) { setTimeout(function () { musikMulai(); }, 60); } } catch (e) { /* abaikan */ }
  }
  JP.tombolSuara = tombolSuara;
  JP.audio = {
    LAGU: LAGU, aturDurasi: function (d) { MUS.durasi = d; }, status: function () { return { jalan: MUS.jalan, lagu: MUS.lagu && MUS.lagu.id, langkah: MUS.langkah, ctx: ctx && ctx.state }; }, tombolBaca: tombolBaca, nasi: nasiBicara, henti: hentiVokal,
    halaman: function (id, daftar) { if (LAGU_ID[id]) { MUS.halaman = id; MUS.daftar = DAFTAR[daftar] ? daftar : 'ceria'; if (MUS.jalan) { musikMulai(); } } },
    rayakan: function (id) { MUS.sementara = id; if (data.musik && ctx) { musikMulai(true); } },
    selesaiRayakan: function () { MUS.sementara = null; if (MUS.jalan) { musikMulai(true); } }
  };
})();
