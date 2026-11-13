/* Pusat asesmen: peta petualangan, tingkat pemain, rak lencana, dan identitas asesmen */
(function () {
  'use strict';
  var el = JP.el, d = JP.data, S = JP_SOAL, app = document.getElementById('app');
  function gambar() {
    app.textContent = '';
    var bintang = 0, selesai = 0, pk = JP.pangkat();
    S.POS.forEach(function (p) { var r = d.pos[p.no]; if (r) { bintang += r.bintang; if (r.bintang > 0) { selesai++; } } });
    var tuntas = d.ujian && d.ujian.nilai >= S.KKTP;
    /* simpul peta: Cek Bekal, 6 pos, Ujian Akhir */
    var simpul = [{ bul: 'B', jenis: 'Diagnostik · sebelum belajar', judul: 'Cek Bekal', ket: 'Enam pertanyaan pembuka, tanpa nilai. Jawab lalu pilih seberapa yakin kamu.', href: 'cek-bekal.html', done: !!d.diag,
      status: d.diag ? Object.keys(S.KATEGORI).map(function (k) { var n = d.diag.items.filter(function (i) { return i.kat === k; }).length; return n ? el('span', { 'class': 'badge ' + S.KATEGORI[k].warna, text: S.KATEGORI[k].n + ': ' + n }) : null; }) : null }];
    S.POS.forEach(function (p) { var r = d.pos[p.no]; simpul.push({ bul: String(p.no), jenis: 'Formatif · Pos ' + p.no + ' · ' + p.organ, judul: p.judul, ket: p.bentuk, href: 'pos.html?pos=' + p.no, done: !!(r && r.bintang > 0), status: [JP.bintang(r ? r.bintang : 0)] }); });
    simpul.push({ bul: '★', jenis: 'Sumatif · setelah belajar', judul: 'Ujian Akhir Penjelajah', ket: 'Lima belas soal, nilai 0 sampai 100. Raih ' + S.KKTP + ' ke atas untuk mendapat sertifikat.', href: 'ujian.html', done: !!d.ujian, bos: true,
      status: d.ujian ? [el('span', { 'class': 'badge ' + (tuntas ? 'good' : 'sun'), text: 'Nilai terbaik ' + d.ujian.nilai + ' · ' + S.predikat(d.ujian.nilai) })] : null });
    var berikut = -1; simpul.some(function (s, i) { if (!s.done) { berikut = i; return true; } return false; });
    var namaForm = el('form', { 'class': 'row', onsubmit: function (e) { e.preventDefault(); var v = e.target.elements.nama.value.trim(); if (v) { d.nama = v.slice(0, 30); JP.simpan(); JP.bunyi.benar(); gambar(); } } }, [
      el('div', { 'class': 'bob' }, JP.nasi(64)),
      el('label', { 'class': 'stack', style: 'gap:4px;flex:1 1 220px' }, [el('span', { 'class': 'ucap', style: 'align-self:flex-start', text: 'Halo! Siapa namamu, Penjelajah?' }), el('input', { type: 'text', name: 'nama', maxlength: 30, autocomplete: 'off', placeholder: 'Tulis namamu di sini' })]),
      el('button', { 'class': 'btn primary', type: 'submit', text: 'Mulai' })
    ]);
    app.appendChild(el('div', { 'class': 'wrap' }, [
      JP.kepala('asesmen'),
      el('section', { 'class': 'stack' }, [
        el('p', { 'class': 'kicker', text: 'Asesmen · Sistem Pencernaan Manusia' }),
        el('h1', { text: d.nama ? 'Halo, ' + d.nama + '!' : 'Peta Petualangan' }),
        el('p', { 'class': 'lead', text: 'Ikuti peta ini dari atas ke bawah. Setiap titik adalah satu permainan. Kumpulkan bintang, raih lencana, dan naikkan tingkatmu.' })
      ]),
      d.nama ? el('section', { 'class': 'panel stack' }, [
        el('div', { 'class': 'level' }, [
          el('span', { 'class': 'lv', 'aria-hidden': 'true', text: String(pk.tingkat) }),
          el('div', { 'class': 'stack', style: 'gap:6px;flex:1 1 220px;min-width:0' }, [
            el('div', { 'class': 'row', style: 'justify-content:space-between' }, [el('b', { text: 'Tingkat ' + pk.tingkat + ' · ' + pk.nama }), el('span', { 'class': 'small muted', text: pk.xp + ' poin' + (pk.berikut ? ' · ' + (pk.berikut[0] - pk.xp) + ' lagi ke ' + pk.berikut[1] : ' · tingkat tertinggi') })]),
            el('div', { 'class': 'meter', role: 'img', 'aria-label': 'Kemajuan tingkat ' + Math.round(pk.maju * 100) + '%' }, el('i', { style: 'width:' + (pk.maju * 100) + '%' }))
          ]),
          el('button', { 'class': 'btn small', type: 'button', text: 'Ganti pemain', onclick: function () { if (confirm('Mulai dari awal untuk pemain baru? Hasil sebelumnya tetap tersimpan di rekap guru.')) { JP.gantiPemain(); gambar(); } } })
        ]),
        el('div', { 'class': 'statbar' }, [
          el('div', { 'class': 'stat' }, [el('b', { text: bintang + '/18' }), el('span', { text: 'Bintang terkumpul' })]),
          el('div', { 'class': 'stat' }, [el('b', { text: selesai + '/6' }), el('span', { text: 'Pos selesai' })]),
          el('div', { 'class': 'stat' }, [el('b', { text: d.ujian ? String(d.ujian.nilai) : '–' }), el('span', { text: 'Nilai ujian terbaik' })])
        ])
      ]) : el('section', { 'class': 'panel' }, namaForm),
      el('section', { 'class': 'stack' }, [
        el('h2', { text: 'Peta petualangan' }),
        el('ol', { 'class': 'trail' }, simpul.map(function (s, i) {
          return el('li', {}, el('a', { 'class': 'node' + (s.done ? ' done' : '') + (i === berikut ? ' next' : '') + (s.bos ? ' bos' : ''), href: s.href }, [
            el('span', { 'class': 'bul', 'aria-hidden': 'true', text: s.done && !s.bos ? '✓' : s.bul }),
            el('span', { 'class': 'stack', style: 'gap:3px;min-width:0' }, [el('span', { 'class': 'kicker', style: 'font-size:11px', text: s.jenis }), el('h3', { text: s.judul }), el('span', { 'class': 'small muted', text: s.ket }), s.status ? el('span', { 'class': 'row', style: 'gap:6px' }, s.status) : null]),
            el('span', { 'class': 'go', text: (s.done ? 'Main lagi' : i === berikut ? 'Mulai' : 'Buka') + ' →' })
          ]));
        }))
      ]),
      el('section', { 'class': 'panel stack' }, [
        el('h2', { text: 'Rak lencana' }),
        el('div', { 'class': 'row', style: 'gap:12px;justify-content:center' }, S.POS.map(function (p) { var r = d.pos[p.no]; return JP.medali(p.no, JP.LENCANA[p.no - 1], !(r && r.bintang > 0)); }).concat([JP.medali('A', 'Ahli Pencernaan', !tuntas, '#c98a2b')])),
        el('p', { 'class': 'small muted', style: 'text-align:center', text: 'Lencana pos diraih dengan minimal 1 bintang. Lencana Ahli Pencernaan diraih dengan nilai ujian ' + S.KKTP + ' ke atas.' })
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
