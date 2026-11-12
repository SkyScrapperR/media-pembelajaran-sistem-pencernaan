/* Beranda: pintu masuk ke media belajar (Proyek 1) dan asesmen (Proyek 2) */
(function () {
  'use strict';
  var el = JP.el, d = JP.data;
  var posSelesai = Object.keys(d.pos).filter(function (k) { return d.pos[k].bintang > 0; }).length;
  function ico(path) { return el('span', { 'class': 'ico', html: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + path + '</svg>' }); }
  var langkah = [
    ['Cek Bekal', 'Jawab 6 pertanyaan pembuka supaya tahu apa yang sudah dan belum kamu pahami.', 'asesmen/cek-bekal.html', d.diag ? 'Sudah dikerjakan' : 'Belum dikerjakan'],
    ['Belajar', 'Jelajahi tubuh 3D dan ikuti perjalanan sesuap nasi melewati 6 organ.', 'belajar/', 'Media 3D'],
    ['Pos Pemeriksaan', 'Mainkan 6 permainan pendek untuk menguji pemahamanmu sambil belajar.', 'asesmen/', posSelesai + ' dari 6 pos selesai'],
    ['Ujian Akhir', 'Tuntaskan 15 soal dan raih sertifikat Penjelajah Pencernaan.', 'asesmen/ujian.html', d.ujian ? 'Nilai terbaik ' + d.ujian.nilai : 'Belum dikerjakan']
  ];
  document.getElementById('app').appendChild(el('div', { 'class': 'wrap' }, [
    JP.kepala('beranda', ''),
    el('section', { 'class': 'row', style: 'gap:24px;align-items:center;padding-block:12px' }, [
      el('div', { 'class': 'stack', style: 'flex:1 1 320px' }, [
        el('p', { 'class': 'kicker', text: 'IPAS Kelas 5 SD · Fase C · Sistem Pencernaan Manusia' }),
        el('h1', { text: 'Jelajah Pencernaan' }),
        el('p', { 'class': 'lead', text: 'Lihat ke dalam tubuh manusia, ikuti perjalanan sesuap nasi, lalu buktikan pemahamanmu lewat permainan.' }),
        el('div', { 'class': 'row' }, [
          el('a', { 'class': 'btn primary', href: 'belajar/', text: 'Mulai belajar' }),
          el('a', { 'class': 'btn teal', href: 'asesmen/', text: 'Buka asesmen' })
        ])
      ]),
      el('div', { 'class': 'bob', style: 'flex:0 0 auto;margin-inline:auto' }, JP.nasi(130))
    ]),
    el('section', { 'class': 'grid2' }, [
      el('a', { 'class': 'tile hot', href: 'belajar/' }, [
        ico('<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z"/><path d="M12 12l8-4.5M12 12v9M12 12L4 7.5"/>'),
        el('h2', { text: 'Belajar' }),
        el('p', { 'class': 'muted', text: 'Media pembelajaran 3D interaktif: Organ apa ini?, Jelajah Tubuh, dan Perjalanan Nasi dengan narasi suara.' }),
        el('span', { 'class': 'badge', text: 'Media Pembelajaran Digital Interaktif' })
      ]),
      el('a', { 'class': 'tile', href: 'asesmen/' }, [
        ico('<path d="M9 11l2 2 4-4"/><rect x="4" y="4" width="16" height="16" rx="3"/>'),
        el('h2', { text: 'Asesmen' }),
        el('p', { 'class': 'muted', text: 'Tiga asesmen berbentuk permainan: Cek Bekal (diagnostik), Pos Pemeriksaan (formatif), dan Ujian Akhir (sumatif).' }),
        el('span', { 'class': 'badge', text: 'Aplikasi Asesmen Digital' })
      ])
    ]),
    el('section', { 'class': 'panel stack' }, [
      el('h2', { text: 'Alur penjelajahan' }),
      el('ol', { 'class': 'stack', style: 'margin:0;padding:0;list-style:none' }, langkah.map(function (l, i) {
        return el('li', {}, el('a', { href: l[2], 'class': 'row', style: 'text-decoration:none;color:inherit;align-items:flex-start;flex-wrap:nowrap' }, [
          el('span', { 'class': 'logo', style: 'box-shadow:none;font-family:var(--font-display);font-weight:700;color:#fff', text: String(i + 1) }),
          el('span', { 'class': 'stack', style: 'gap:2px;min-width:0' }, [el('b', { text: l[0] }), el('span', { 'class': 'muted small', text: l[1] }), el('span', { 'class': 'badge', style: 'align-self:flex-start', text: l[3] })])
        ]));
      }))
    ]),
    el('footer', { 'class': 'stack small muted' }, [
      el('p', { text: 'Dikembangkan oleh I Wayan Bagus Somabawa, PGSD Universitas Pendidikan Ganesha, untuk mata kuliah Teknologi Baru dalam Pengajaran dan Pembelajaran.' }),
      el('p', {}, [el('a', { href: 'asesmen/guru.html', text: 'Halaman guru: kisi-kisi, kunci jawaban, dan rekap hasil' })])
    ])
  ]));
})();
