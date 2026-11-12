/* Pusat asesmen: identitas pemain, tiga jenis asesmen, dan kemajuan */
(function () {
  'use strict';
  var el = JP.el, d = JP.data, S = JP_SOAL, app = document.getElementById('app');
  var LENCANA = ['Pemilah Jitu', 'Navigator Nasi', 'Detektif Organ', 'Penjodoh Cermat', 'Sahabat Sehat', 'Penunjuk Tepat'];
  function gambar() {
    app.textContent = '';
    var bintang = 0, selesai = 0;
    S.POS.forEach(function (p) { var r = d.pos[p.no]; if (r) { bintang += r.bintang; if (r.bintang > 0) { selesai++; } } });
    var diagRingkas = d.diag ? Object.keys(S.KATEGORI).map(function (k) { var n = d.diag.items.filter(function (i) { return i.kat === k; }).length; return n ? el('span', { 'class': 'badge ' + S.KATEGORI[k].warna, text: S.KATEGORI[k].n + ': ' + n }) : null; }) : [el('span', { 'class': 'badge', text: 'Belum dikerjakan' })];
    var namaForm = el('form', { 'class': 'row', onsubmit: function (e) { e.preventDefault(); var v = e.target.elements.nama.value.trim(); if (v) { d.nama = v.slice(0, 30); JP.simpan(); gambar(); } } }, [
      el('label', { 'class': 'stack', style: 'gap:4px;flex:1 1 220px' }, [el('span', { 'class': 'small muted', text: 'Tulis namamu dulu, ya' }), el('input', { type: 'text', name: 'nama', maxlength: 30, autocomplete: 'off', placeholder: 'Nama penjelajah' })]),
      el('button', { 'class': 'btn primary', type: 'submit', text: 'Simpan' })
    ]);
    app.appendChild(el('div', { 'class': 'wrap' }, [
      JP.kepala('asesmen'),
      el('section', { 'class': 'stack' }, [
        el('p', { 'class': 'kicker', text: 'Asesmen · Sistem Pencernaan Manusia' }),
        el('h1', { text: d.nama ? 'Halo, ' + d.nama + '!' : 'Asesmen Penjelajah' }),
        el('p', { 'class': 'lead', text: 'Ada tiga asesmen. Semuanya berbentuk permainan. Kerjakan berurutan dari Cek Bekal sampai Ujian Akhir.' }),
        d.nama ? el('div', { 'class': 'row' }, [
          el('span', { 'class': 'badge sun' }, [JP.bintang(1, 1), bintang + ' dari 18 bintang']),
          el('button', { 'class': 'btn small', type: 'button', text: 'Ganti pemain', onclick: function () { if (confirm('Mulai dari awal untuk pemain baru? Hasil sebelumnya tetap tersimpan di rekap guru.')) { JP.gantiPemain(); gambar(); } } })
        ]) : el('div', { 'class': 'panel' }, namaForm)
      ]),
      el('section', { 'class': 'panel stack' }, [
        el('div', { 'class': 'row', style: 'justify-content:space-between' }, [el('h2', { text: '1. Cek Bekal' }), el('span', { 'class': 'badge', text: 'Diagnostik · sebelum belajar' })]),
        el('p', { 'class': 'muted', text: 'Enam pertanyaan pembuka. Tidak ada nilai. Jawab sejujurnya, lalu pilih seberapa yakin kamu.' }),
        el('div', { 'class': 'row' }, diagRingkas),
        el('div', { 'class': 'row' }, el('a', { 'class': 'btn ' + (d.diag ? '' : 'primary'), href: 'cek-bekal.html', text: d.diag ? 'Ulangi Cek Bekal' : 'Mulai Cek Bekal' }))
      ]),
      el('section', { 'class': 'panel stack' }, [
        el('div', { 'class': 'row', style: 'justify-content:space-between' }, [el('h2', { text: '2. Pos Pemeriksaan' }), el('span', { 'class': 'badge', text: 'Formatif · selama belajar' })]),
        el('p', { 'class': 'muted', text: 'Enam permainan pendek, satu untuk setiap tahap Perjalanan Nasi. Kamu langsung tahu benar atau salahnya, dan boleh mengulang.' }),
        el('div', { 'class': 'meter', role: 'img', 'aria-label': selesai + ' dari 6 pos selesai' }, el('i', { style: 'width:' + (selesai / 6 * 100) + '%' })),
        el('div', { 'class': 'grid2' }, S.POS.map(function (p) {
          var r = d.pos[p.no];
          return el('a', { 'class': 'tile', href: 'pos.html?pos=' + p.no, style: 'padding:14px;gap:6px' }, [
            el('span', { 'class': 'kicker', text: 'Pos ' + p.no + ' · ' + p.organ }),
            el('h3', { text: p.judul }),
            el('div', { 'class': 'row', style: 'justify-content:space-between' }, [JP.bintang(r ? r.bintang : 0), r && r.bintang > 0 ? el('span', { 'class': 'badge sun', text: LENCANA[p.no - 1] }) : el('span', { 'class': 'small muted', text: 'Belum dimainkan' })])
          ]);
        }))
      ]),
      el('section', { 'class': 'panel stack' }, [
        el('div', { 'class': 'row', style: 'justify-content:space-between' }, [el('h2', { text: '3. Ujian Akhir Penjelajah' }), el('span', { 'class': 'badge', text: 'Sumatif · setelah belajar' })]),
        el('p', { 'class': 'muted', text: 'Lima belas soal dengan nilai 0 sampai 100. Jawaban baru dibahas setelah semua soal selesai. Raih nilai ' + S.KKTP + ' ke atas untuk mendapat sertifikat.' }),
        el('div', { 'class': 'row' }, [
          d.ujian ? el('span', { 'class': 'badge ' + (d.ujian.nilai >= S.KKTP ? 'good' : 'sun'), text: 'Nilai terbaik: ' + d.ujian.nilai + ' (' + S.predikat(d.ujian.nilai) + ')' }) : el('span', { 'class': 'badge', text: 'Belum dikerjakan' }),
          selesai < 4 ? el('span', { 'class': 'small muted', text: 'Saran: selesaikan dulu minimal 4 pos pemeriksaan.' }) : null
        ]),
        el('div', { 'class': 'row' }, el('a', { 'class': 'btn ' + (selesai >= 4 && !d.ujian ? 'primary' : ''), href: 'ujian.html', text: d.ujian ? 'Ulangi ujian' : 'Mulai ujian' }))
      ]),
      el('details', { 'class': 'panel' }, [
        el('summary', { style: 'cursor:pointer;font-weight:600', text: 'Identitas asesmen dan tujuan pembelajaran' }),
        el('div', { 'class': 'stack', style: 'margin-top:12px' }, [
          el('div', { 'class': 'scroll' }, el('table', {}, S.IDENTITAS.map(function (r) { return el('tr', {}, [el('th', { scope: 'row', text: r[0] }), el('td', { text: r[1] })]); }))),
          el('ol', { style: 'margin:0;padding-left:20px' }, S.TP.map(function (t) { return el('li', { text: t }); })),
          el('p', {}, el('a', { href: 'guru.html', text: 'Halaman guru: kisi-kisi, kunci jawaban, pedoman penskoran, dan rekap hasil' }))
        ])
      ])
    ]));
  }
  gambar();
})();
