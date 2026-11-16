/* Arena bonus Basmi Kuman: permainan ketangkasan, tidak dinilai. Kuman diketuk, makanan dibiarkan. */
(function () {
  'use strict';
  var el = JP.el, d = JP.data, app = document.getElementById('app');
  JP.audio.halaman('robot', 'ceria');
  var LAMA = 45, MAKANAN = {
    telur: '<path d="M30 6c14 0 22 20 22 32S42 56 30 56 8 50 8 38 16 6 30 6z" fill="#fffdf7" stroke="#12262d" stroke-width="2.6"/><circle cx="30" cy="38" r="10" fill="#ffc22e" stroke="#12262d" stroke-width="2.2"/>',
    ikan: '<path d="M6 30c8-14 28-16 38-4l12-10-2 14 2 14-12-10C34 46 14 44 6 30z" fill="#7fc8f8" stroke="#12262d" stroke-width="2.6" stroke-linejoin="round"/><circle cx="17" cy="28" r="2.6" fill="#12262d"/>',
    wortel: '<path d="M18 20l26-4-22 38z" fill="#f08a2c" stroke="#12262d" stroke-width="2.6" stroke-linejoin="round"/><path d="M40 16l8-10M42 17l12-4M38 15l2-11" stroke="#2e8b57" stroke-width="3.4" stroke-linecap="round"/>',
    roti: '<path d="M10 26C6 12 22 6 30 10c8-4 24 2 20 16l-2 26H12z" fill="#e9b467" stroke="#12262d" stroke-width="2.6" stroke-linejoin="round"/><path d="M16 26c-2-8 8-12 14-9 6-3 16 1 14 9l-1 21H17z" fill="#fff1d6"/>'
  };
  var JENIS = Object.keys(MAKANAN);
  function hati(n) { var s = el('span', { 'class': 'hati', role: 'img', 'aria-label': n + ' nyawa' }); for (var i = 0; i < 3; i++) { s.appendChild(el('span', { 'class': i < n ? '' : 'off', html: '<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path fill="currentColor" d="M12 21s-8-5.2-8-11a4.5 4.5 0 018-2.8A4.5 4.5 0 0120 10c0 5.8-8 11-8 11z"/></svg>' })); } return s; }
  function bingkai(isi) { app.textContent = ''; app.appendChild(el('div', { 'class': 'wrap' }, [JP.kepala('asesmen')].concat(isi))); }
  function kepalaGame() { return el('header', { 'class': 'stack', style: 'gap:4px' }, [el('p', { 'class': 'kicker', text: 'Arena bonus · tidak dinilai' }), el('h1', { style: 'font-size:clamp(28px,5vw,40px)', text: 'Basmi Kuman' })]); }
  function awal() {
    bingkai([kepalaGame(), el('section', { 'class': 'panel stack' }, [
      el('div', { 'class': 'dialog' }, [el('div', { 'class': 'bob' }, JP.tokoh('lambu', 104, 'kaget')), el('p', { 'class': 'ucap' }, [el('b', { text: 'Tolong aku! ' }), 'Kuman ikut masuk bersama makanan. Kamu jadi asam lambung, ya: ketuk kumannya, tetapi biarkan makanan lewat. Bertahanlah ' + LAMA + ' detik!'])]),
      el('div', { 'class': 'row', style: 'justify-content:center;gap:18px' }, [
        el('span', { 'class': 'stack', style: 'align-items:center;gap:0' }, [JP.tokoh('kuman', 54), el('b', { 'class': 'small', text: 'Ketuk!' })]),
        el('span', { 'class': 'stack', style: 'align-items:center;gap:0' }, [el('span', { html: '<svg viewBox="0 0 60 60" width="50" height="50">' + MAKANAN.telur + '</svg>' }), el('b', { 'class': 'small', text: 'Biarkan' })])
      ]),
      d.bonus ? el('p', { 'class': 'badge sun', style: 'align-self:center', text: 'Rekormu: ' + d.bonus + ' poin' }) : null,
      el('div', { 'class': 'row', style: 'justify-content:center' }, el('button', { 'class': 'btn primary', type: 'button', text: 'Mulai', onclick: main }))
    ])]);
  }
  function main() {
    var skor = 0, nyawa = 3, runtun = 0, sisa = LAMA, benda = [], id = 0, tambah = 0.5, lalu = 0, jalan = true, basmi = 0;
    var arena = el('div', { 'class': 'arena', role: 'application', 'aria-label': 'Arena lambung' }, el('div', { 'class': 'asam' }));
    var tSkor = el('b', { text: '0' }), tWaktu = el('b', { text: String(LAMA) }), tNyawa = el('span', {}, hati(3)), tKombo = el('span', {});
    bingkai([kepalaGame(), el('div', { 'class': 'hud' }, [tNyawa, el('span', {}, ['Skor ', tSkor]), tKombo, el('span', {}, ['Waktu ', tWaktu])]), arena]);
    function efek(x, y, teks, warna) { var e = el('span', { 'class': 'efek', style: 'left:' + x + '%;top:' + y + '%;color:' + warna, text: teks }); arena.appendChild(e); setTimeout(function () { e.remove(); }, 600); }
    function luka() { nyawa--; runtun = 0; tKombo.textContent = ''; tNyawa.textContent = ''; tNyawa.appendChild(hati(nyawa)); JP.bunyi.salah(); arena.classList.remove('shake'); void arena.offsetWidth; arena.classList.add('shake'); if (nyawa <= 0) { selesai(); } }
    function munculkan(tingkat) {
      var kuman = Math.random() < 0.62, jenis = kuman ? 'kuman' : JENIS[Math.floor(Math.random() * JENIS.length)];
      var b = { id: id++, kuman: kuman, x: 4 + Math.random() * 80, y: -14, v: (kuman ? 17 : 14) + tingkat * 20 + Math.random() * 6 };
      b.el = el('button', { 'class': 'jatuh', type: 'button', 'aria-label': kuman ? 'Kuman' : 'Makanan', style: 'left:' + b.x + '%;top:' + b.y + '%' }, kuman ? JP.tokoh('kuman', 50) : el('span', { html: '<svg viewBox="0 0 60 60" width="50" height="50">' + MAKANAN[jenis] + '</svg>' }));
      b.el.addEventListener('pointerdown', function (e) {
        e.preventDefault(); if (!jalan || b.mati) { return; } b.mati = true; b.el.remove();
        if (b.kuman) { runtun++; basmi++; var p = 10 + Math.min(runtun - 1, 5) * 2; skor += p; tSkor.textContent = String(skor); efek(b.x + 6, b.y + 6, '+' + p, '#e7ff9a'); if (runtun >= 3) { JP.bunyi.kombo(runtun); tKombo.textContent = ''; tKombo.appendChild(el('span', { 'class': 'kombo pop', text: 'x' + runtun })); } else { JP.bunyi.pop(); } }
        else { efek(b.x + 6, b.y + 6, 'Itu makanan!', '#ff9da0'); luka(); }
      });
      arena.appendChild(b.el); benda.push(b);
    }
    function selesai() {
      if (!jalan) { return; } jalan = false;
      var rekor = skor > (d.bonus || 0); if (rekor) { d.bonus = skor; JP.simpan(); }
      JP.catat('Bonus Basmi Kuman', basmi + ' kuman dibasmi', skor);
      if (nyawa > 0) { JP.bunyi.menang(); } if (rekor && skor > 0) { JP.konfeti(120); setTimeout(JP.bunyi.lencana, 500); }
      arena.appendChild(el('div', { 'class': 'tutup' }, el('div', { 'class': 'panel stack pop', style: 'align-items:center;text-align:center;max-width:380px' }, [
        el('div', { 'class': 'row', style: 'justify-content:center;align-items:flex-end' }, [JP.tokoh('lambu', 80, nyawa > 0 ? 'tawa' : 'sedih'), JP.nasi(64, nyawa > 0 ? 'bangga' : 'kaget')]),
        el('h2', { text: nyawa > 0 ? 'Lambung aman!' : 'Kumannya terlalu banyak!' }),
        el('p', { 'class': 'angka-besar', style: 'font-size:64px', text: String(skor) }),
        el('p', { text: basmi + ' kuman dibasmi.' + (rekor && skor > 0 ? ' Rekor baru!' : d.bonus ? ' Rekormu ' + d.bonus + '.' : '') }),
        el('p', { 'class': 'small muted', text: 'Ingat: asam lambung membunuh kuman yang ikut masuk bersama makanan. Cuci tangan sebelum makan supaya kumannya tidak ikut masuk.' }),
        el('div', { 'class': 'row', style: 'justify-content:center' }, [el('button', { 'class': 'btn primary', type: 'button', text: 'Main lagi', onclick: main }), el('a', { 'class': 'btn', href: './', text: 'Peta petualangan' })])
      ])));
    }
    function putar(t) {
      if (!jalan) { return; }
      var dt = Math.min(0.05, (t - (lalu || t)) / 1000); lalu = t;
      sisa -= dt; tWaktu.textContent = String(Math.max(0, Math.ceil(sisa)));
      var tingkat = 1 - Math.max(0, sisa) / LAMA;
      tambah += dt; if (tambah >= 0.95 - tingkat * 0.5) { tambah = 0; munculkan(tingkat); }
      benda = benda.filter(function (b) {
        if (b.mati) { return false; }
        b.y += b.v * dt; b.el.style.top = b.y + '%';
        if (b.y >= 92) { b.mati = true; b.el.remove(); if (b.kuman) { efek(b.x + 6, 88, 'Lolos!', '#ff9da0'); luka(); } else { skor += 2; tSkor.textContent = String(skor); efek(b.x + 6, 88, '+2', '#fff'); } return false; }
        return true;
      });
      if (sisa <= 0) { selesai(); return; }
      requestAnimationFrame(putar);
    }
    JP.bunyi.ketuk(); requestAnimationFrame(putar);
  }
  awal();
})();
