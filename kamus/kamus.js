/* Halaman Kamus Pencernaan: cari istilah, saring kategori, dan dengarkan penjelasannya */
(function () {
  'use strict';
  var el = JP.el, K = JP_KAMUS, app = document.getElementById('app');
  JP.audio.halaman('gelembung', 'fokus');
  var kategori = ['Semua'].concat(K.map(function (k) { return k.kategori; }).filter(function (v, i, a) { return a.indexOf(v) === i; }));
  var pilih = 'Semua', cari = '';
  var daftar = el('div', { 'class': 'kamus' }), hitung = el('p', { 'class': 'small muted', 'aria-live': 'polite' });
  var input = el('input', { type: 'text', placeholder: 'Cari istilah, misalnya enzim', 'aria-label': 'Cari istilah', autocomplete: 'off', style: 'max-width:none' });
  input.addEventListener('input', function () { cari = input.value.trim().toLowerCase(); gambar(); });
  var saring = el('div', { 'class': 'chips', role: 'group', 'aria-label': 'Saring kategori' });
  function gambar() {
    saring.textContent = '';
    kategori.forEach(function (k) { saring.appendChild(el('button', { 'class': 'chip' + (k === pilih ? ' pick' : ''), type: 'button', 'aria-pressed': k === pilih ? 'true' : 'false', text: k, onclick: function () { pilih = k; JP.bunyi.ketuk(); gambar(); } })); });
    var hasil = K.filter(function (k) { return (pilih === 'Semua' || k.kategori === pilih) && (!cari || (k.istilah + ' ' + k.arti).toLowerCase().indexOf(cari) >= 0); });
    daftar.textContent = '';
    hasil.forEach(function (k) {
      daftar.appendChild(el('article', { 'class': 'kata' }, [
        el('div', { 'class': 'row', style: 'justify-content:space-between;flex-wrap:nowrap;align-items:flex-start' }, [
          el('div', { 'class': 'stack', style: 'gap:2px;min-width:0' }, [el('span', { 'class': 'kicker', style: 'font-size:11px', text: k.kategori }), el('h3', { style: 'font-size:20px', text: k.istilah })]),
          k.tokoh ? JP.tokoh(k.tokoh, 46) : null
        ]),
        el('p', { text: k.arti }),
        el('div', {}, JP.audio.tombolBaca('kamus-' + k.id, k.istilah + '. ' + k.arti, 'Dengarkan arti ' + k.istilah))
      ]));
    });
    hitung.textContent = hasil.length ? hasil.length + ' istilah' : 'Tidak ada istilah yang cocok. Coba kata lain.';
  }
  app.appendChild(el('div', { 'class': 'wrap' }, [
    JP.kepala('kamus'),
    el('section', { 'class': 'dialog' }, [el('div', { 'class': 'bob' }, JP.nasi(96, 'pikir')), el('div', { 'class': 'stack', style: 'flex:1;gap:6px' }, [
      el('p', { 'class': 'kicker', text: 'Kamus Pencernaan' }), el('h1', { text: 'Apa artinya, ya?' }),
      el('p', { 'class': 'lead', text: 'Ada ' + K.length + ' istilah tentang sistem pencernaan. Cari katanya, baca artinya, atau dengarkan.' })
    ])]),
    el('section', { 'class': 'panel stack' }, [input, saring, hitung]),
    daftar
  ]));
  gambar();
  JP.bantu = function () {
    JP_pandu.mulai('kamus', [
      { sel: 'input[type=text]', judul: 'Cari istilah', teks: 'Ketik kata yang ingin kamu cari. Daftarnya langsung menyesuaikan.' },
      { sel: '.chips', judul: 'Saring kategori', teks: 'Pilih kategori untuk melihat organ, enzim, proses, atau istilah kesehatan saja.' },
      { sel: '.kata', judul: 'Kartu istilah', teks: 'Setiap kartu berisi arti singkat. Ketuk Dengarkan supaya dibacakan.' }
    ], { paksa: true });
  };
  setTimeout(function () { JP_pandu.mulai('kamus', [
    { sel: 'input[type=text]', judul: 'Cari istilah', teks: 'Ketik kata yang ingin kamu cari. Daftarnya langsung menyesuaikan.' },
    { sel: '.chips', judul: 'Saring kategori', teks: 'Pilih kategori untuk melihat organ, enzim, proses, atau istilah kesehatan saja.' },
    { sel: '.kata', judul: 'Kartu istilah', teks: 'Setiap kartu berisi arti singkat. Ketuk Dengarkan supaya dibacakan.' }
  ]); }, 800);
})();
