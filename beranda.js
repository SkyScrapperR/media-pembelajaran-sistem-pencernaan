/* Beranda: layar menu utama, pintu ke media belajar (Proyek 1) dan asesmen (Proyek 2) */
(function () {
  'use strict';
  var el = JP.el, d = JP.data, pk = JP.pangkat();
  var posSelesai = 0, bintang = 0;
  Object.keys(d.pos).forEach(function (k) { bintang += d.pos[k].bintang || 0; if (d.pos[k].bintang > 0) { posSelesai++; } });
  function hias(path) { return el('span', { 'class': 'hias', html: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + path + '</svg>' }); }
  var rute = [
    ['Cek Bekal', 'asesmen/cek-bekal.html', !!d.diag],
    ['Belajar', 'belajar/', false],
    ['Pos Pemeriksaan', 'asesmen/', posSelesai === 6],
    ['Ujian Akhir', 'asesmen/ujian.html', !!d.ujian]
  ];
  var sapa = d.nama ? 'Halo lagi, ' + d.nama + '! Kamu sudah Tingkat ' + pk.tingkat + '. Lanjut, yuk!' : 'Halo! Aku Si Nasi. Temani aku menjelajah perut, yuk!';
  document.getElementById('app').appendChild(el('main', { 'class': 'menu' }, [
    el('div', { 'class': 'atas' }, [
      el('span', { 'class': 'badge', text: 'IPAS Kelas 5 SD · Fase C' }),
      el('div', { 'class': 'nav' }, JP.tombolSuara())
    ]),
    el('div', { 'class': 'maskot' }, [el('span', { 'class': 'ucap', text: sapa }), el('div', { 'class': 'bob' }, JP.nasi(110))]),
    el('div', { 'class': 'stack', style: 'gap:10px;align-items:center' }, [
      el('h1', { 'class': 'judul', html: 'Jelajah <span>Pencernaan</span>' }),
      el('p', { 'class': 'lead', style: 'font-size:clamp(15px,2.4vw,19px);color:#d5e6ea', text: 'Lihat ke dalam tubuh, ikuti perjalanan sesuap nasi, lalu buktikan pemahamanmu lewat permainan.' })
    ]),
    el('div', { 'class': 'portal' }, [
      el('a', { 'class': 'pintu a', href: 'belajar/' }, [
        hias('<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z"/><path d="M12 12l8-4.5M12 12v9M12 12L4 7.5"/>'),
        el('span', { 'class': 'tag', text: 'Media 3D interaktif' }),
        el('h2', { text: 'Belajar' }),
        el('p', { text: 'Putar tubuh 3D, kenali 9 organ, dan ikuti Perjalanan Nasi dengan narasi suara.' }),
        el('span', { 'class': 'maju', text: 'Mulai belajar →' })
      ]),
      el('a', { 'class': 'pintu b', href: 'asesmen/' }, [
        hias('<path d="M12 2.6l2.9 6 6.6.8-4.9 4.6 1.3 6.5-5.9-3.3-5.9 3.3 1.3-6.5L2.5 9.4l6.6-.8z"/>'),
        el('span', { 'class': 'tag', text: 'Peta petualangan' }),
        el('h2', { text: 'Asesmen' }),
        el('p', { text: d.nama ? bintang + ' dari 18 bintang terkumpul' + (d.ujian ? ', nilai ujian terbaik ' + d.ujian.nilai : '') + '. Lanjutkan petualanganmu.' : 'Delapan permainan: Cek Bekal, enam Pos Pemeriksaan, dan Ujian Akhir.' }),
        el('span', { 'class': 'maju', text: (d.nama ? 'Lanjut bermain' : 'Mulai bermain') + ' →' })
      ])
    ]),
    el('ol', { 'class': 'rute', 'aria-label': 'Alur penjelajahan' }, rute.map(function (r, i) {
      return el('li', {}, el('a', { href: r[1] }, [el('span', { 'class': 'n' + (r[2] ? ' ok' : ''), text: r[2] ? '✓' : String(i + 1) }), r[0]]));
    })),
    el('footer', { 'class': 'stack small', style: 'gap:4px;color:#b9cdd2;margin-top:auto' }, [
      el('p', { text: 'Dikembangkan oleh I Wayan Bagus Somabawa · PGSD Universitas Pendidikan Ganesha' }),
      el('p', {}, el('a', { href: 'asesmen/guru.html', text: 'Halaman guru' }))
    ])
  ]));
})();
