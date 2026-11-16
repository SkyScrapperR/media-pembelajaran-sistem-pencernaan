/* Panduan pengenalan untuk media 3D: menu awal, lalu tiap kegiatan saat pertama kali dibuka */
(function () {
  'use strict';
  var P = window.JP_pandu; if (!P) { return; }
  var T = {
    menu: [
      { judul: 'Selamat datang di tubuh 3D!', teks: 'Aku Si Nasi. Sebentar, aku tunjukkan apa saja yang bisa kamu lakukan di sini.' },
      { sel: '[data-m="intro"]', judul: 'Organ apa ini?', teks: 'Pemanasan dulu: tebak nama organ dari bentuknya.' },
      { sel: '[data-m="explore"]', judul: 'Jelajah Tubuh', teks: 'Putar tubuh 3D dan ketuk organ untuk membaca serta mendengar penjelasannya.' },
      { sel: '[data-m="journey"]', judul: 'Perjalanan Nasi', teks: 'Ikuti sesuap nasi melewati enam tahap, dari mulut sampai anus, lengkap dengan narasi.' },
      { sel: '.hlinks', judul: 'Tujuan dan petunjuk', teks: 'Buka tujuan pembelajaran, petunjuk penggunaan, dan sumber materi di sini.' },
      { sel: '.hlinks.site', judul: 'Pindah halaman', teks: 'Kembali ke Beranda atau lanjut ke Asesmen untuk bermain.' }
    ],
    intro: [
      { judul: 'Organ apa ini?', teks: 'Perhatikan organ yang menyala pada tubuh 3D, lalu tebak namanya.' },
      { sel: '#opts', judul: 'Tebak organnya', teks: 'Pilih nama organ yang menurutmu benar. Salah tidak apa-apa, ini baru pemanasan.' },
      { sel: '#clueBtn', judul: 'Butuh petunjuk?', teks: 'Ketuk tombol ini untuk membaca petunjuk tentang organ itu.', bulat: true },
      { sel: '#introTop', judul: 'Skor tebakan', teks: 'Jumlah tebakanmu yang benar muncul di sini.' }
    ],
    explore: [
      { judul: 'Putar dan perbesar', teks: 'Geser layar untuk memutar tubuh. Cubit layar atau gulir roda tetikus untuk memperbesar.' },
      { sel: '#chips', judul: 'Pilih organ', teks: 'Ketuk nama organ di sini, atau ketuk langsung organnya pada model 3D.' },
      { sel: '#exploreTop', judul: 'Atur tampilan', teks: 'Tampilkan atau sembunyikan tubuh, rangka, dan label. Tombol terakhir mengembalikan sudut pandang.' },
      { sel: '#voiceBtn', judul: 'Suara narasi', teks: 'Atur suara pembaca dan kecepatannya di sini.', bulat: true }
    ],
    journey: [
      { sel: '#jCard', judul: 'Kartu tahap', teks: 'Setiap tahap menjelaskan apa yang terjadi pada makanan dan berapa lama.' },
      { sel: '#jNext', judul: 'Mulai dan lanjut', teks: 'Tekan untuk memulai. Tombol Lanjut baru aktif setelah animasi dan narasi tahap itu selesai.', bulat: true },
      { sel: '#jSpeak', judul: 'Dengarkan lagi', teks: 'Ulangi narasi tahap ini kapan saja.', bulat: true },
      { sel: '#steps', judul: 'Enam tahap', teks: 'Titik ini menunjukkan tahap yang sedang berjalan. Tahap yang sudah selesai bisa dibuka lagi.' },
      { judul: 'Pos Pemeriksaan', teks: 'Setelah tiap tahap selesai, muncul tombol Pos Pemeriksaan. Ketuk untuk menguji pemahamanmu lewat permainan.' }
    ]
  };
  function kegiatan() {
    var home = document.getElementById('home');
    if (home && !home.hidden && home.offsetParent !== null) { return 'menu'; }
    var j = document.getElementById('journeyUI'), i = document.getElementById('introUI');
    if (j && !j.hidden && j.offsetParent !== null) { return 'journey'; }
    if (i && !i.hidden && i.offsetParent !== null) { return 'intro'; }
    return 'explore';
  }
  function buka(nama, paksa) { P.mulai('belajar-' + nama, T[nama], { paksa: paksa, akhir: nama === 'menu' ? 'Ayo mulai!' : 'Mengerti!' }); }
  /* tombol tanda tanya di bilah atas dan di menu awal */
  var info = document.getElementById('infoBtn');
  if (info) { var b = P.tombol(function () { buka(kegiatan(), true); }, 'Tampilkan panduan'); b.classList.add('round'); info.parentNode.insertBefore(b, info); }
  var site = document.querySelector('.hlinks.site');
  if (site) { var a = document.createElement('a'); a.href = '#'; a.textContent = 'Panduan'; a.addEventListener('click', function (e) { e.preventDefault(); buka('menu', true); }); site.appendChild(a); }
  /* panduan menu awal muncul setelah model 3D siap */
  var tombol = document.querySelector('[data-m="journey"]');
  function siap() { setTimeout(function () { if (kegiatan() === 'menu') { buka('menu', false); } }, 900); }
  if (tombol && tombol.disabled) { new MutationObserver(function (m, o) { if (!tombol.disabled) { o.disconnect(); siap(); } }).observe(tombol, { attributes: true }); } else { siap(); }
  /* panduan tiap kegiatan saat pertama kali dibuka */
  document.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('[data-m], #tabIntro, #tabExplore, #tabJourney');
    if (!t) { return; }
    setTimeout(function () { var k = kegiatan(); if (k !== 'menu') { buka(k, false); } }, 1600);
  });
})();
