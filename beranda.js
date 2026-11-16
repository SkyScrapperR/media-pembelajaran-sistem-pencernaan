/* Beranda: layar pembuka, lalu menu utama dengan tiga pintu dan perkenalan tokoh */
(function () {
  'use strict';
  var el = JP.el, d = JP.data, pk = JP.pangkat();
  JP.audio.halaman('petualangan', 'ceria');
  var posSelesai = 0, bintang = 0;
  Object.keys(d.pos).forEach(function (k) { bintang += d.pos[k].bintang || 0; if (d.pos[k].bintang > 0) { posSelesai++; } });
  var rute = [
    ['Cek Bekal', 'asesmen/cek-bekal.html', !!d.diag],
    ['Belajar', 'belajar/', false],
    ['Pos Pemeriksaan', 'asesmen/', posSelesai === 6],
    ['Ujian Akhir', 'asesmen/ujian.html', !!d.ujian]
  ];
  var ucap = el('span', { 'class': 'ucap', 'aria-live': 'polite' });
  /* kalimat muncul huruf demi huruf */
  var ketikan = null;
  function ketik(teks, bunyi) {
    clearInterval(ketikan); var i = 0; ucap.textContent = '';
    ketikan = setInterval(function () { i += 1; ucap.textContent = teks.slice(0, i); if (bunyi && i % 3 === 0) { JP.bunyi.blip(); } if (i >= teks.length) { clearInterval(ketikan); } }, 28);
  }
  var tombolNasi = el('button', { 'class': 'nasi-klik', type: 'button', 'aria-label': 'Ketuk Si Nasi untuk mendengar ucapannya', onclick: function () {
    var n = tombolNasi.firstChild; n.classList.remove('lompat'); void n.offsetWidth; n.classList.add('lompat'); JP.bunyi.pop();
    var t = JP.audio.nasi('halo'); if (t) { ketik(t, !d.vokal); } else { ketik(JP_SOAL.NASI.halo[Math.floor(Math.random() * 4)], true); }
  } }, JP.nasi(120, 'tawa'));
  var sapa = d.nama ? 'Halo lagi, ' + d.nama + '! Kamu sudah Tingkat ' + pk.tingkat + '. Lanjut, yuk!' : 'Halo! Aku Si Nasi. Temani aku menjelajah perut, yuk!';
  function pintu(kelas, href, tag, judul, teks, ajak, tk) {
    return el('a', { 'class': 'pintu ' + kelas, href: href }, [
      el('span', { 'class': 'tag', text: tag }), el('h2', { text: judul }), el('p', { text: teks }), el('span', { 'class': 'maju', text: ajak + ' →' }), tk
    ]);
  }
  document.getElementById('app').appendChild(el('main', { 'class': 'menu' }, [
    el('div', { 'class': 'atas' }, [
      el('span', { 'class': 'badge', text: 'IPAS Kelas 5 SD · Fase C' }),
      el('div', { 'class': 'nav' }, JP.tombolSuara().concat([JP_pandu.tombol(function () { pandu(true); }, 'Tampilkan panduan')]))
    ]),
    el('div', { 'class': 'maskot' }, [ucap, el('div', { 'class': 'bob' }, tombolNasi)]),
    el('div', { 'class': 'stack', style: 'gap:10px;align-items:center' }, [
      el('h1', { 'class': 'judul', html: 'Jelajah <span>Pencernaan</span>' }),
      el('p', { 'class': 'lead', style: 'font-size:clamp(15px,2.4vw,19px);color:#d5e6ea', text: 'Lihat ke dalam tubuh, ikuti perjalanan sesuap nasi, lalu buktikan pemahamanmu lewat permainan.' })
    ]),
    el('div', { 'class': 'portal' }, [
      pintu('a', 'belajar/', 'Media 3D interaktif', 'Belajar', 'Putar tubuh 3D, kenali 9 organ, dan ikuti Perjalanan Nasi.', 'Mulai belajar', JP.tokoh('lambu', 84, 'senang')),
      pintu('b', 'asesmen/', 'Peta petualangan', 'Asesmen', d.nama ? bintang + ' dari 18 bintang' + (d.ujian ? ', nilai ujian ' + d.ujian.nilai : '') + '. Lanjutkan!' : 'Cek Bekal, enam Pos Pemeriksaan, dan Ujian Akhir.', d.nama ? 'Lanjut bermain' : 'Mulai bermain', JP.tokoh('gigo', 84, 'tawa')),
      pintu('c', 'asesmen/bonus.html', 'Arena bonus', 'Basmi Kuman', d.bonus ? 'Rekormu ' + d.bonus + ' poin. Bisa lebih tinggi?' : 'Jadilah asam lambung dan basmi kuman yang menyerbu!', 'Main sekarang', JP.tokoh('kuman', 84, 'marah'))
    ]),
    el('section', { 'class': 'stack', style: 'gap:8px;align-items:center;width:100%' }, [
      el('h2', { style: 'font-size:clamp(20px,3.6vw,26px)', text: 'Kenalan dengan para penjaga pos' }),
      el('div', { 'class': 'parade' }, JP.TOKOH_POS.concat(['kuman']).map(function (id) { return JP.kartuTokoh(id, 66); })),
      el('p', { 'class': 'small', style: 'color:#b9cdd2', text: 'Ketuk tokohnya untuk berkenalan.' })
    ]),
    el('ol', { 'class': 'rute', 'aria-label': 'Alur penjelajahan' }, rute.map(function (r, i) {
      return el('li', {}, el('a', { href: r[1] }, [el('span', { 'class': 'n' + (r[2] ? ' ok' : ''), text: r[2] ? '✓' : String(i + 1) }), r[0]]));
    })),
    el('footer', { 'class': 'stack small', style: 'gap:4px;color:#b9cdd2;margin-top:auto' }, [
      el('p', { text: 'Dikembangkan oleh I Wayan Bagus Somabawa · PGSD Universitas Pendidikan Ganesha' }),
      el('p', {}, el('a', { href: 'asesmen/guru.html', text: 'Halaman guru' }))
    ])
  ]));

  /* panduan pengenalan: otomatis untuk pengunjung baru, bisa diulang lewat tombol tanda tanya */
  function pandu(paksa) {
    JP_pandu.mulai('beranda', [
      { judul: 'Selamat datang!', teks: 'Aku Si Nasi. Sebentar saja, aku tunjukkan cara memakai Jelajah Pencernaan, ya.' },
      { sel: '.nasi-klik', judul: 'Ini aku!', teks: 'Ketuk aku kapan saja. Aku akan melompat dan mengatakan sesuatu.', bulat: true },
      { sel: '.pintu.a', judul: 'Pintu Belajar', teks: 'Mulai dari sini. Kamu bisa memutar tubuh 3D, mengenal 9 organ, dan mengikuti Perjalanan Nasi.' },
      { sel: '.pintu.b', judul: 'Pintu Asesmen', teks: 'Di sini ada peta petualangan: Cek Bekal, enam Pos Pemeriksaan, dan Ujian Akhir.' },
      { sel: '.pintu.c', judul: 'Arena bonus', teks: 'Mau bersantai? Mainkan Basmi Kuman. Permainan ini tidak dinilai.' },
      { sel: '.parade', judul: 'Para penjaga pos', teks: 'Ketuk tokohnya untuk berkenalan. Mereka menunggumu di setiap pos.' },
      { sel: '.rute', judul: 'Urutan yang disarankan', teks: 'Cek Bekal dulu, lalu Belajar, lanjut Pos Pemeriksaan, dan terakhir Ujian Akhir.' },
      { sel: '.tsuara', judul: 'Suara dan musik', teks: 'Ganti lagu, atur volume, atau matikan suara lewat tombol ini.', bulat: true },
      { sel: '.pd-bantu', judul: 'Butuh bantuan lagi?', teks: 'Ketuk tanda tanya ini kapan saja untuk mengulang panduan. Selamat menjelajah!', bulat: true }
    ], { paksa: paksa, akhir: 'Ayo mulai!' });
  }
  JP.bantu = function () { pandu(true); };
  /* layar pembuka: tampil sekali setiap kunjungan, sentuhan pertama juga menyalakan musik */
  var sudah = false; try { sudah = sessionStorage.getItem('jp-pembuka') === '1'; } catch (e) { /* abaikan */ }
  if (sudah) { setTimeout(function () { ketik(sapa); pandu(false); }, 700); return; }
  function huruf(kata, mulai) { return kata.split('').map(function (h, i) { return '<i style="animation-delay:' + (mulai + i * 0.06).toFixed(2) + 's">' + h + '</i>'; }).join(''); }
  var baris = el('div', { 'class': 'baris-tokoh' }, ['gigo', 'kero', 'lambu'].map(function (id, i) { var t = JP.tokoh(id, 62); t.style.animationDelay = (1.2 + i * 0.12) + 's, ' + (-i * 0.5) + 's'; return t; })
    .concat([el('span', { 'class': 'bintang-utama' }, JP.nasi(150, 'tawa'))])
    .concat(['hali', 'kolo', 'tiha'].map(function (id, i) { var t = JP.tokoh(id, 62); t.style.animationDelay = (1.5 + i * 0.12) + 's, ' + (-i * 0.7) + 's'; return t; })));
  var pembuka = el('button', { 'class': 'pembuka', type: 'button', 'aria-label': 'Jelajah Pencernaan. Ketuk untuk mulai.' }, [
    baris,
    el('h1', { html: '<span>' + huruf('Jelajah', 0.7) + '</span><br><span class="w2">' + huruf('Pencernaan', 1.1) + '</span>' }),
    el('p', { style: 'font-size:clamp(14px,2.6vw,19px);color:#d5e6ea;animation:naik .6s 1.7s both', text: 'Petualangan sesuap nasi di dalam tubuhmu' }),
    el('span', { 'class': 'ajak', text: 'Ketuk untuk mulai' })
  ]);
  pembuka.addEventListener('click', function () {
    try { sessionStorage.setItem('jp-pembuka', '1'); } catch (e) { /* abaikan */ }
    JP.bunyi.menang(); JP.konfeti(70); pembuka.classList.add('hilang');
    setTimeout(function () { pembuka.remove(); ketik(sapa); }, 650);
    setTimeout(function () { pandu(false); }, 2300);
  });
  document.body.appendChild(pembuka); pembuka.focus();
})();
