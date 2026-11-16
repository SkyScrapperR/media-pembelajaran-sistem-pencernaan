/* Pusat asesmen: peta petualangan, tingkat pemain, rak lencana, dan identitas asesmen */
(function () {
  'use strict';
  var el = JP.el, d = JP.data, S = JP_SOAL, app = document.getElementById('app');
  JP.audio.halaman('pantai', 'ceria');
  JP.cekNaik();
  function gambar() {
    app.textContent = '';
    var bintang = 0, selesai = 0, pk = JP.pangkat();
    S.POS.forEach(function (p) { var r = d.pos[p.no]; if (r) { bintang += r.bintang; if (r.bintang > 0) { selesai++; } } });
    var tuntas = d.ujian && d.ujian.nilai >= S.KKTP;
    /* simpul peta: Cek Bekal, 6 pos, Ujian Akhir */
    var simpul = [{ tk: 'nasi', bul: 'B', jenis: 'Diagnostik · sebelum belajar', judul: 'Cek Bekal', ket: 'Enam pertanyaan pembuka, tanpa nilai. Jawab lalu pilih seberapa yakin kamu.', href: 'cek-bekal.html', done: !!d.diag,
      status: d.diag ? Object.keys(S.KATEGORI).map(function (k) { var n = d.diag.items.filter(function (i) { return i.kat === k; }).length; return n ? el('span', { 'class': 'badge ' + S.KATEGORI[k].warna, text: S.KATEGORI[k].n + ': ' + n }) : null; }) : null }];
    S.POS.forEach(function (p) { var r = d.pos[p.no]; simpul.push({ tk: JP.TOKOH_POS[p.no - 1], bul: String(p.no), jenis: 'Formatif · Pos ' + p.no + ' · ' + p.organ, judul: p.judul, ket: p.bentuk, href: 'pos.html?pos=' + p.no, done: !!(r && r.bintang > 0), status: [JP.bintang(r ? r.bintang : 0)] }); });
    simpul.push({ tk: 'nasi', mood: 'bangga', bul: '★', jenis: 'Sumatif · setelah belajar', judul: 'Ujian Akhir Penjelajah', ket: 'Lima belas soal, nilai 0 sampai 100. Raih ' + S.KKTP + ' ke atas untuk mendapat sertifikat.', href: 'ujian.html', done: !!d.ujian, bos: true,
      status: d.ujian ? [el('span', { 'class': 'badge ' + (tuntas ? 'good' : 'sun'), text: 'Nilai terbaik ' + d.ujian.nilai + ' · ' + S.predikat(d.ujian.nilai) })] : null });
    var berikut = -1; simpul.some(function (s, i) { if (!s.done) { berikut = i; return true; } return false; });
    var akun = JP.akun.info;
    var namaForm = el('div', { 'class': 'row masuk-kelas' }, [
      el('button', { 'class': 'nasi-klik bob', type: 'button', 'aria-label': 'Ketuk Si Nasi', onclick: function (e) { var n = e.currentTarget.firstChild; n.classList.remove('lompat'); void n.offsetWidth; n.classList.add('lompat'); JP.bunyi.pop(); JP.audio.nasi('halo'); } }, JP.nasi(64)),
      el('div', { 'class': 'stack', style: 'gap:4px;flex:1 1 220px' }, [el('span', { 'class': 'ucap', style: 'align-self:flex-start', text: 'Halo! Masuk ke kelasmu dulu, yuk.' }), el('span', { 'class': 'small muted', text: 'Bintang, lencana, dan nilaimu tersimpan di kelas dan bisa dilanjutkan dari perangkat mana pun.' })]),
      el('button', { 'class': 'btn primary', type: 'button', text: 'Masuk kelas', onclick: function () { JP.akun.buka(); } })
    ]);
    var wadahPapan = el('section', { 'class': 'panel stack', hidden: true });
    if (akun) { muatPapan(wadahPapan, akun); }
    app.appendChild(el('div', { 'class': 'wrap' }, [
      JP.kepala('asesmen'),
      el('section', { 'class': 'stack' }, [
        el('p', { 'class': 'kicker', text: 'Asesmen · Sistem Pencernaan Manusia' }),
        el('h1', { text: akun ? 'Halo, ' + akun.nama + '!' : 'Peta Petualangan' }),
        el('p', { 'class': 'lead', text: 'Ikuti peta ini dari atas ke bawah. Setiap titik adalah satu permainan. Kumpulkan bintang, raih lencana, dan naikkan tingkatmu.' })
      ]),
      akun ? el('section', { 'class': 'panel stack' }, [
        el('div', { 'class': 'row', style: 'justify-content:space-between' }, [el('span', { 'class': 'lencana-kelas' }, [el('b', { text: akun.kelas }), 'Kelas ' + akun.kelas]), el('span', { 'class': 'awan' + (JP.akun.belumTerkirim() ? ' tunda' : '') }, [el('i'), JP.akun.belumTerkirim() ? 'Menunggu internet untuk menyimpan' : 'Tersimpan di kelas'])]),
        el('div', { 'class': 'level' }, [
          el('span', { 'class': 'lv', 'aria-hidden': 'true', text: String(pk.tingkat) }),
          el('div', { 'class': 'stack', style: 'gap:6px;flex:1 1 220px;min-width:0' }, [
            el('div', { 'class': 'row', style: 'justify-content:space-between' }, [el('b', { text: 'Tingkat ' + pk.tingkat + ' · ' + pk.nama }), el('span', { 'class': 'small muted', text: pk.xp + ' poin' + (pk.berikut ? ' · ' + (pk.berikut[0] - pk.xp) + ' lagi ke ' + pk.berikut[1] : ' · tingkat tertinggi') })]),
            el('div', { 'class': 'meter', role: 'img', 'aria-label': 'Kemajuan tingkat ' + Math.round(pk.maju * 100) + '%' }, el('i', { style: 'width:' + (pk.maju * 100) + '%' }))
          ]),
          el('button', { 'class': 'btn small', type: 'button', text: 'Keluar', onclick: function () { if (confirm('Keluar dari akun ' + akun.nama + '? Hasilmu aman tersimpan di kelas dan bisa dibuka lagi dengan gambar rahasiamu.')) { JP.akun.keluar(); } } })
        ]),
        el('div', { 'class': 'statbar' }, [
          el('div', { 'class': 'stat' }, [el('b', { text: bintang + '/18' }), el('span', { text: 'Bintang terkumpul' })]),
          el('div', { 'class': 'stat' }, [el('b', { text: selesai + '/6' }), el('span', { text: 'Pos selesai' })]),
          el('div', { 'class': 'stat' }, [el('b', { text: d.ujian ? String(d.ujian.nilai) : '–' }), el('span', { text: 'Nilai ujian terbaik' })])
        ])
      ]) : el('section', { 'class': 'panel' }, namaForm),
      wadahPapan,
      el('section', { 'class': 'stack' }, [
        el('h2', { text: 'Peta petualangan' }),
        el('ol', { 'class': 'trail' }, simpul.map(function (s, i) {
          return el('li', {}, el('a', { 'class': 'node' + (s.done ? ' done' : '') + (i === berikut ? ' next' : '') + (s.bos ? ' bos' : ''), href: s.href }, [
            el('span', { 'class': 'tk', 'aria-hidden': 'true' }, [JP.tokoh(s.tk, 56, s.mood || (s.done ? 'tawa' : 'senang')), s.done ? el('span', { 'class': 'cek', text: '✓' }) : null]),
            el('span', { 'class': 'stack', style: 'gap:3px;min-width:0' }, [el('span', { 'class': 'kicker', style: 'font-size:11px', text: s.jenis }), el('h3', { text: s.judul }), el('span', { 'class': 'small muted', text: s.ket }), s.status ? el('span', { 'class': 'row', style: 'gap:6px' }, s.status) : null]),
            el('span', { 'class': 'go', text: (s.done ? 'Main lagi' : i === berikut ? 'Mulai' : 'Buka') + ' →' })
          ]));
        }))
      ]),
      el('a', { 'class': 'pintu c', href: 'bonus.html', style: 'min-height:0' }, [
        el('span', { 'class': 'tag', text: 'Arena bonus · tidak dinilai' }), el('h2', { style: 'font-size:28px', text: 'Basmi Kuman' }),
        el('p', { text: d.bonus ? 'Rekormu ' + d.bonus + ' poin. Bisa lebih tinggi?' : 'Jadilah asam lambung dan basmi kuman yang menyerbu!' }),
        el('span', { 'class': 'maju', text: 'Main sekarang →' }), JP.tokoh('kuman', 78, 'marah')
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
  /* papan bintang kelas: urut menurut bintang pos, nilai ujian tidak ditampilkan */
  function muatPapan(wadah, akun) {
    JP.akun.papan().then(function (j) {
      if (!j.papan.length) { return; }
      var urutKu = -1; j.papan.forEach(function (x, k) { if (x.nama === j.saya) { urutKu = k; } });
      var tampil = j.papan.slice(0, 10).map(function (x, k) { return [x, k]; }); if (urutKu >= 10) { tampil.push([j.papan[urutKu], urutKu]); }
      wadah.textContent = '';
      [el('div', { 'class': 'row', style: 'justify-content:space-between' }, [el('h2', { text: 'Papan bintang kelas ' + j.kelas }), el('span', { 'class': 'small muted', text: j.papan.length + ' penjelajah' })]),
        el('ol', { 'class': 'papan' }, tampil.map(function (t, n) { var x = t[0]; return el('li', { 'class': x.nama === j.saya ? 'saya' : null, style: 'animation-delay:' + (n * 0.05) + 's' }, [el('span', { 'class': 'urut', text: String(t[1] + 1) }), el('span', { 'class': 'nm', text: x.nama + (x.nama === j.saya ? ' (kamu)' : '') }), el('span', { 'class': 'bt' }, [el('span', { html: JP.IKON.bintang }), x.bintang + '/18'])]); })),
        el('p', { 'class': 'small muted', text: 'Urutan berdasarkan bintang dari enam pos. Main lagi untuk menambah bintangmu.' })].forEach(function (a) { wadah.appendChild(a); });
      wadah.hidden = false;
    }, function () { /* tanpa internet papan tidak ditampilkan */ });
  }
  gambar();
  document.addEventListener('jp-sinkron', function (e) { if (e.detail && e.detail.berubah) { gambar(); JP.cekNaik(); } });
  function pandu(paksa) {
    JP_pandu.mulai('peta', [
      { judul: 'Ini peta petualanganmu', teks: 'Semua permainan asesmen ada di halaman ini. Yuk, aku tunjukkan satu per satu.' },
      { sel: '.masuk-kelas', judul: 'Masuk kelas', teks: 'Pilih kelasmu, tulis namamu, lalu pilih dua gambar rahasia. Hasilmu tersimpan di kelas dan terlihat oleh gurumu.' },
      { sel: '.level', judul: 'Tingkatmu', teks: 'Setiap bintang dan nilai menambah poin. Kumpulkan poin untuk naik tingkat sampai jadi Profesor Pencernaan.' },
      { sel: '.trail li:nth-child(1) .node', judul: '1. Cek Bekal', teks: 'Mulai dari sini. Enam pertanyaan pembuka tanpa nilai, supaya tahu apa yang perlu kamu pelajari.' },
      { sel: '.trail li:nth-child(2) .node', judul: '2. Pos Pemeriksaan', teks: 'Ada enam pos, masing-masing satu permainan. Kamu langsung tahu benar atau salah, dan boleh mengulang.' },
      { sel: '.node.bos', judul: '3. Ujian Akhir', teks: 'Lima belas soal dengan nilai 0 sampai 100. Raih 75 ke atas untuk mendapat sertifikat.' },
      { sel: '.pintu.c', judul: 'Arena bonus', teks: 'Basmi Kuman untuk bersenang-senang. Tidak memengaruhi nilai.' },
      { sel: '.medali', judul: 'Rak lencana', teks: 'Setiap pos yang selesai memberi satu lencana. Bisakah kamu mengumpulkan semuanya?' },
      { sel: '.pd-bantu', judul: 'Ulangi panduan', teks: 'Ketuk tanda tanya ini kalau ingin melihat panduan lagi.', bulat: true }
    ], { paksa: paksa, akhir: 'Mengerti!' });
  }
  JP.bantu = function () { pandu(true); };
  setTimeout(function () { pandu(false); }, 900);
})();
