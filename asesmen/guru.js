/* Halaman guru: dasbor kelas dari database, identitas, kisi-kisi, kunci jawaban, pedoman penskoran, dan rekap di perangkat ini */
(function () {
  'use strict';
  var el = JP.el, S = JP_SOAL, app = document.getElementById('app');
  var TOKEN = null, SISWA = [], WAKTU = '', kelasPilih = 'Semua';
  try { TOKEN = sessionStorage.getItem('jp-guru-token'); } catch (e) { /* abaikan */ }
  JP.audio.halaman('tenang', 'fokus');
  var MATERI = ['Organ pencernaan dan letaknya', 'Fungsi organ pencernaan dan organ tambahan', 'Urutan dan proses perjalanan makanan', 'Pencernaan mekanik dan kimiawi', 'Menjaga kesehatan pencernaan'];
  var BENTUK = { pg: 'Pilihan ganda', pgk: 'Pilihan ganda kompleks', jodoh: 'Menjodohkan', urut: 'Mengurutkan', isian: 'Isian singkat' };
  function tabel(kepala, baris) {
    return el('div', { 'class': 'scroll' }, el('table', {}, [el('thead', {}, el('tr', {}, kepala.map(function (h) { return el('th', { scope: 'col', text: h }); }))), el('tbody', {}, baris.map(function (r) { return el('tr', {}, r.map(function (c) { return el('td', {}, c instanceof Node ? c : String(c)); })); }))]));
  }
  function bagian(judul, isi) { return el('section', { 'class': 'panel stack' }, [el('h2', { text: judul })].concat(isi)); }
  function kunciUjian(q) {
    if (q.tipe === 'pg') { return q.opsi[q.kunci]; }
    if (q.tipe === 'pgk') { return q.kunci.map(function (o) { return q.opsi[o]; }).join('; '); }
    if (q.tipe === 'jodoh') { return q.pasangan.map(function (p) { return p[0] + ' → ' + p[1]; }).join('; '); }
    if (q.tipe === 'urut') { return q.urutan.join(', '); }
    return q.kunci;
  }
  function kunciPos(p) {
    if (p.jenis === 'pilah') { return p.kartu.map(function (k) { return k.t + ' → ' + (k.k === 'kiri' ? p.kiri : p.kanan); }).join('; '); }
    if (p.jenis === 'rute') { return p.urutan.join(', ') + '. Pengecoh: ' + Object.keys(p.pengecoh).join(', ') + ' (tidak dilewati makanan).'; }
    if (p.jenis === 'tebak') { return p.teka.map(function (t) { return t.j; }).join('; ') + ' (urutan diacak).'; }
    if (p.jenis === 'jodoh') { return p.pasangan.map(function (x) { return x[0] + ' → ' + x[1]; }).join('; '); }
    return p.tanya.map(function (t) { return t.t + ' → ' + S.NAMA_ORGAN[t.j]; }).join('; ');
  }
  function rekap() {
    var r = JP.data.riwayat.slice().reverse();
    function csv() {
      var baris = [['Nama', 'Jenis asesmen', 'Keterangan', 'Nilai', 'Waktu']].concat(JP.data.riwayat.map(function (x) { return [x.nama, x.jenis, x.ringkas, x.nilai === null ? '' : x.nilai, x.waktu]; }));
      var teks = baris.map(function (b) { return b.map(function (c) { return '"' + String(c).replace(/"/g, '""') + '"'; }).join(','); }).join('\r\n');
      var a = el('a', { href: URL.createObjectURL(new Blob(['﻿' + teks], { type: 'text/csv' })), download: 'rekap-asesmen-pencernaan.csv' });
      document.body.appendChild(a); a.click(); a.remove();
    }
    return bagian('Cadangan: rekap di perangkat ini', [
      el('p', { 'class': 'muted small', text: 'Daftar ini hanya berisi hasil yang dikerjakan di perangkat ini, termasuk yang dikerjakan tanpa masuk kelas. Data kelas yang lengkap ada di dasbor di bagian atas.' }),
      r.length ? tabel(['Nama', 'Jenis', 'Keterangan', 'Nilai', 'Waktu'], r.map(function (x) { return [x.nama, x.jenis, x.ringkas, x.nilai === null ? 'tidak dinilai' : x.nilai, new Date(x.waktu).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })]; })) : el('p', { text: 'Belum ada hasil yang tersimpan.' }),
      el('div', { 'class': 'row noprint' }, [
        el('button', { 'class': 'btn small', type: 'button', disabled: !r.length, text: 'Unduh rekap (CSV)', onclick: csv }),
        el('button', { 'class': 'btn small', type: 'button', disabled: !r.length, text: 'Hapus rekap', onclick: function () { if (confirm('Hapus semua rekap hasil di perangkat ini?')) { JP.hapusRiwayat(); isi(); } } })
      ])
    ]);
  }
  function isi() {
    app.textContent = '';
    var no = 0;
    app.appendChild(el('div', { 'class': 'wrap', style: 'width:min(1040px,100%)' }, [
      JP.kepala('asesmen'),
      el('header', { 'class': 'stack' }, [el('p', { 'class': 'kicker', text: 'Halaman guru' }), el('h1', { text: 'Kisi-kisi, kunci, dan rekap asesmen' }),
        el('div', { 'class': 'row noprint' }, el('button', { 'class': 'btn small teal', type: 'button', text: 'Cetak atau simpan PDF', onclick: function () { window.print(); } }))]),
      dasbor(),
      bagian('Identitas asesmen', [tabel(['Komponen', 'Keterangan'], S.IDENTITAS), el('h3', { text: 'Tujuan pembelajaran' }), el('ol', { style: 'margin:0;padding-left:20px' }, S.TP.map(function (t) { return el('li', { text: t }); }))]),
      bagian('Kisi-kisi asesmen diagnostik (Cek Bekal)', [
        tabel(['No', 'TP', 'Materi', 'Indikator', 'Level', 'Bentuk soal', 'Miskonsepsi yang diperiksa', 'Skor'], S.DIAG.map(function (q, k) { return [k + 1, q.tp, MATERI[q.tp - 1], q.indikator, q.kog, 'Pilihan ganda + tingkat keyakinan', q.mis, 'Tidak dinilai']; })),
        el('p', { 'class': 'small muted', text: 'Jumlah butir: 6. Hasil tidak berupa angka, tetapi peta pemahaman empat kategori.' })
      ]),
      bagian('Kisi-kisi asesmen formatif (Pos Pemeriksaan)', [
        tabel(['Pos', 'TP', 'Materi', 'Indikator', 'Level', 'Bentuk aktivitas', 'Jumlah butir', 'Skor'], S.POS.map(function (p) { return [p.no + '. ' + p.judul, p.tp, MATERI[p.tp - 1], p.indikator, p.kog, p.bentuk, p.butir, '0 sampai 100 (persen ketepatan), 0 sampai 3 bintang']; })),
        el('p', { 'class': 'small muted', text: 'Jumlah aktivitas: 6 pos dengan 36 butir. Setiap jawaban langsung diberi umpan balik, dan siswa boleh mengulang.' })
      ]),
      bagian('Kisi-kisi asesmen sumatif (Ujian Akhir Penjelajah)', [
        tabel(['No', 'TP', 'Materi', 'Indikator', 'Level', 'Bentuk soal', 'Skor'], S.UJIAN.map(function (q, k) { return [k + 1, q.tp, MATERI[q.tp - 1], q.indikator, q.kog, BENTUK[q.tipe], q.skor]; })),
        el('p', { 'class': 'small muted', text: 'Jumlah butir: 15. Skor maksimum: ' + S.UJIAN.reduce(function (a, q) { return a + q.skor; }, 0) + '. Nilai akhir sama dengan jumlah skor.' })
      ]),
      bagian('Kunci jawaban', [
        el('h3', { text: 'Diagnostik' }), tabel(['No', 'Pertanyaan', 'Kunci'], S.DIAG.map(function (q, k) { return [k + 1, q.q, q.opsi[q.kunci]]; })),
        el('h3', { text: 'Formatif' }), tabel(['Pos', 'Kunci'], S.POS.map(function (p) { return [p.no + '. ' + p.judul, kunciPos(p)]; })),
        el('h3', { text: 'Sumatif' }), tabel(['No', 'Soal', 'Kunci', 'Skor'], S.UJIAN.map(function (q, k) { return [k + 1, q.q, kunciUjian(q), q.skor]; })),
        el('p', { 'class': 'small muted', text: 'Di aplikasi, urutan pilihan jawaban diacak setiap kali soal ditampilkan.' })
      ]),
      bagian('Pedoman penskoran dan rubrik', [
        el('h3', { text: 'Diagnostik: rubrik pemetaan' }),
        tabel(['Kategori', 'Ciri jawaban', 'Tindak lanjut'], [
          ['Sudah paham', 'Benar dan yakin', 'Lanjut ke materi; dapat menjadi tutor sebaya.'],
          ['Perlu dimantapkan', 'Benar tetapi ragu', 'Beri penguatan lewat kegiatan Jelajah Tubuh.'],
          ['Belum tahu', 'Salah dan ragu', 'Dampingi saat mengikuti Perjalanan Nasi.'],
          ['Miskonsepsi', 'Salah tetapi yakin', 'Bahas secara khusus; minta siswa membandingkan dugaannya dengan model 3D.']
        ]),
        el('h3', { text: 'Formatif' }),
        tabel(['Permainan', 'Cara menghitung ketepatan'], [
          ['Pilah Pencernaan; Sehat atau Bermasalah?', 'Jumlah kartu benar dibagi jumlah kartu.'],
          ['Susun Rute Nasi', '100% dikurangi 12% untuk setiap ketukan yang salah.'],
          ['Siapa Aku?', 'Benar dengan 1 petunjuk 3 poin, 2 petunjuk 2 poin, 3 petunjuk 1 poin. Jumlah poin dibagi 12.'],
          ['Jodohkan Tugasnya', '100% dikurangi 15% untuk setiap pasangan yang salah.'],
          ['Tunjuk Organnya', 'Benar pada ketukan pertama 2 poin, ketukan kedua 1 poin. Jumlah poin dibagi 12.']
        ]),
        el('p', { 'class': 'small', text: 'Bintang: 3 bintang untuk ketepatan 90% ke atas, 2 bintang untuk 70% ke atas, 1 bintang untuk 50% ke atas. Di bawah 50% siswa diminta mengulang.' }),
        el('h3', { text: 'Sumatif' }),
        tabel(['Bentuk soal', 'Nomor', 'Pedoman'], Object.keys(BENTUK).map(function (t) { return [BENTUK[t], S.UJIAN.map(function (q, k) { return q.tipe === t ? k + 1 : null; }).filter(Boolean).join(', '), S.PEDOMAN[t]]; })),
        tabel(['Nilai', 'Predikat', 'Keterangan'], [['90 sampai 100', 'Sangat baik', 'Tuntas'], [S.KKTP + ' sampai 89', 'Baik', 'Tuntas'], ['60 sampai ' + (S.KKTP - 1), 'Cukup', 'Belum tuntas, remedial pada tujuan yang lemah'], ['Di bawah 60', 'Perlu bimbingan', 'Belum tuntas, belajar ulang dengan pendampingan']])
      ]),
      rekap()
    ]));
  }
  /* ---------- dasbor kelas: data dari database ---------- */
  function persen(a, b) { return b ? Math.round(a / b * 100) : 0; }
  function tgl(w) { return w ? new Date(w).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) : '–'; }
  function bintangSiswa(x) { var n = 0, pos = 0; Object.keys(x.data.pos || {}).forEach(function (k) { var b = x.data.pos[k].bintang || 0; n += b; if (b > 0) { pos++; } }); return { bintang: n, pos: pos }; }
  function batang(baris) {
    return el('div', { 'class': 'batang' }, baris.map(function (b) {
      return el('div', { 'class': 'brs' }, [el('span', { text: b[0] }), el('div', { 'class': 'jalur', role: 'img', 'aria-label': b[0] + ': ' + b[1] + '%' }, el('i', { 'class': b[1] < 60 ? 'rendah' : b[1] < 75 ? 'sedang' : null, style: 'width:' + b[1] + '%' })), el('span', { text: b[1] + '%' })]);
    }));
  }
  function aksiGuru(badan, pesanSukses) {
    return JP.akun.kirim(Object.assign({ token: TOKEN }, badan)).then(function () { if (pesanSukses) { JP.toast(pesanSukses); } return muat(); }, function (e) { if (e.kode === 'guru') { keluarGuru(); } else { JP.toast(e.kode ? e.message : 'Tidak ada sambungan internet.', 3600); } });
  }
  function keluarGuru() { TOKEN = null; try { sessionStorage.removeItem('jp-guru-token'); } catch (e) { /* abaikan */ } gerbang(); }
  function dasbor() {
    var daftar = SISWA.filter(function (x) { return kelasPilih === 'Semua' || x.kelas === kelasPilih; }).sort(function (a, b) { return a.kelas === b.kelas ? a.nama.localeCompare(b.nama, 'id') : (a.kelas < b.kelas ? -1 : 1); });
    var ujian = daftar.filter(function (x) { return x.data.ujian; }), tuntas = ujian.filter(function (x) { return x.data.ujian.nilai >= S.KKTP; });
    var rata = ujian.length ? Math.round(ujian.reduce(function (a, x) { return a + x.data.ujian.nilai; }, 0) / ujian.length) : null;
    /* ketercapaian tiap tujuan pembelajaran dari ujian terakhir setiap siswa */
    var tp = S.TP.map(function (_, t) { var d = 0, m = 0; ujian.forEach(function (x) { var r = (x.data.ujian.perTP || [])[t]; if (r) { d += r.dapat; m += r.maks; } }); return ['TP ' + (t + 1) + ' · ' + MATERI[t], persen(d, m)]; });
    /* butir ujian yang paling sulit bagi kelas */
    var butir = {}; ujian.forEach(function (x) { (x.data.ujian.butir || []).forEach(function (b) { var o = butir[b.id] || (butir[b.id] = { d: 0, m: 0, n: 0 }); o.d += b.dapat; o.m += b.maks; o.n++; }); });
    var sulit = Object.keys(butir).map(function (id) { var q = null, no = 0; S.UJIAN.forEach(function (u, k) { if (u.id === id) { q = u; no = k + 1; } }); return q ? { no: no, q: q, p: persen(butir[id].d, butir[id].m), n: butir[id].n } : null; }).filter(Boolean).sort(function (a, b) { return a.p - b.p; }).slice(0, 5);
    /* peta miskonsepsi dari Cek Bekal */
    var diag = daftar.filter(function (x) { return x.data.diag; });
    var mis = S.DIAG.map(function (q, k) {
      var hit = { paham: 0, ragu: 0, belum: 0, mis: 0 }, siapa = [];
      diag.forEach(function (x) { var it = null; x.data.diag.items.forEach(function (i) { if (i.id === q.id) { it = i; } }); if (it && hit[it.kat] !== undefined) { hit[it.kat]++; if (it.kat === 'mis') { siapa.push(x.nama); } } });
      return [k + 1, q.q, q.mis, hit.paham, hit.ragu, hit.belum, hit.mis, siapa.join(', ') || '–'];
    });
    function csv() {
      var kepala = ['Kelas', 'Nama', 'Cek Bekal: sudah paham (dari 6)', 'Cek Bekal: miskonsepsi'].concat(S.POS.map(function (p) { return 'Pos ' + p.no + ' (bintang)'; })).concat(['Jumlah bintang', 'Nilai ujian terbaik', 'Nilai ujian terakhir', 'Predikat', 'Percobaan ujian']).concat(S.TP.map(function (_, t) { return 'TP ' + (t + 1) + ' (%)'; })).concat(['Terakhir aktif']);
      var baris = [kepala].concat(daftar.map(function (x) {
        var b = bintangSiswa(x), u = x.data.ujian, dg = x.data.diag, hit = function (k) { return dg ? dg.items.filter(function (i) { return i.kat === k; }).length : ''; };
        return [x.kelas, x.nama, hit('paham'), hit('mis')].concat(S.POS.map(function (p) { var r = x.data.pos[p.no]; return r ? r.bintang : ''; })).concat([b.bintang, u ? u.nilai : '', u ? u.terakhir : '', u ? S.predikat(u.nilai) : '', u ? u.coba : '']).concat(S.TP.map(function (_, t) { var r = u && (u.perTP || [])[t]; return r ? persen(r.dapat, r.maks) : ''; })).concat([x.diubah]);
      }));
      var teks = baris.map(function (r) { return r.map(function (c) { return '"' + String(c).replace(/"/g, '""') + '"'; }).join(','); }).join('\r\n');
      var a = el('a', { href: URL.createObjectURL(new Blob(['﻿' + teks], { type: 'text/csv' })), download: 'rekap-kelas-' + kelasPilih.toLowerCase() + '.csv' });
      document.body.appendChild(a); a.click(); a.remove();
    }
    var tab = el('div', { 'class': 'tab-kelas noprint', role: 'group', 'aria-label': 'Pilih kelas' }, ['Semua', 'A', 'B', 'C'].map(function (k) {
      var n = k === 'Semua' ? SISWA.length : SISWA.filter(function (x) { return x.kelas === k; }).length;
      return el('button', { type: 'button', 'aria-pressed': kelasPilih === k ? 'true' : 'false', text: (k === 'Semua' ? 'Semua kelas' : 'Kelas ' + k) + ' (' + n + ')', onclick: function () { kelasPilih = k; isi(); } });
    }));
    return bagian('Dasbor kelas' + (kelasPilih === 'Semua' ? '' : ' ' + kelasPilih), [
      el('div', { 'class': 'row', style: 'justify-content:space-between' }, [tab, el('span', { 'class': 'small muted', text: 'Data per ' + tgl(WAKTU) })]),
      el('div', { 'class': 'statbar' }, [
        el('div', { 'class': 'stat' }, [el('b', { text: String(daftar.length) }), el('span', { text: 'Siswa terdaftar' })]),
        el('div', { 'class': 'stat' }, [el('b', { text: diag.length + '/' + daftar.length }), el('span', { text: 'Sudah Cek Bekal' })]),
        el('div', { 'class': 'stat' }, [el('b', { text: ujian.length + '/' + daftar.length }), el('span', { text: 'Sudah ujian' })]),
        el('div', { 'class': 'stat' }, [el('b', { text: ujian.length ? tuntas.length + '/' + ujian.length : '–' }), el('span', { text: 'Tuntas (nilai ' + S.KKTP + ' ke atas)' })]),
        el('div', { 'class': 'stat' }, [el('b', { text: rata === null ? '–' : String(rata) }), el('span', { text: 'Rata-rata nilai ujian' })])
      ]),
      daftar.length ? tabel(['Kelas', 'Nama', 'Cek Bekal', 'Bintang pos', 'Nilai ujian', 'Predikat', 'Coba', 'Terakhir aktif', 'Kelola'], daftar.map(function (x) {
        var b = bintangSiswa(x), u = x.data.ujian, dg = x.data.diag;
        var kelola = el('span', { 'class': 'row noprint', style: 'gap:6px' }, [
          el('button', { 'class': 'btn small', type: 'button', text: x.terkunci ? 'Buka kunci' : 'Atur ulang gambar', title: 'Siswa memilih dua gambar rahasia baru saat masuk berikutnya', onclick: function () { if (confirm('Atur ulang gambar rahasia ' + x.nama + ' (kelas ' + x.kelas + ')? Saat masuk berikutnya ia memilih dua gambar baru. Nilainya tidak berubah.')) { aksiGuru({ aksi: 'guru-reset', kelas: x.kelas, slug: x.slug }, 'Gambar rahasia ' + x.nama + ' diatur ulang.'); } } }),
          el('button', { 'class': 'btn small', type: 'button', text: 'Hapus', onclick: function () { if (confirm('Hapus ' + x.nama + ' (kelas ' + x.kelas + ') beserta semua hasilnya? Tindakan ini tidak bisa dibatalkan.')) { aksiGuru({ aksi: 'guru-hapus', kelas: x.kelas, slug: x.slug }, x.nama + ' dihapus.'); } } })
        ]);
        return [x.kelas, x.nama + (x.terkunci ? ' (terkunci)' : ''), dg ? dg.items.filter(function (i) { return i.kat === 'paham'; }).length + '/6 paham' : '–', b.bintang + '/18 · ' + b.pos + ' pos', u ? u.nilai + (u.terakhir !== u.nilai ? ' (terakhir ' + u.terakhir + ')' : '') : '–', u ? S.predikat(u.nilai) : '–', u ? u.coba : '–', tgl(x.diubah), kelola];
      })) : el('p', { 'class': 'muted', text: 'Belum ada siswa yang masuk' + (kelasPilih === 'Semua' ? '.' : ' di kelas ' + kelasPilih + '.') + ' Minta siswa membuka Peta Petualangan lalu menekan Masuk kelas.' }),
      ujian.length ? el('h3', { text: 'Ketercapaian tujuan pembelajaran (ujian terakhir, ' + ujian.length + ' siswa)' }) : null,
      ujian.length ? batang(tp) : null,
      ujian.length ? el('p', { 'class': 'small muted', text: 'Batang jingga (di bawah 60%) menandai tujuan yang perlu diajarkan ulang; kuning (60 sampai 74%) perlu penguatan.' }) : null,
      sulit.length ? el('h3', { text: 'Lima butir ujian tersulit' }) : null,
      sulit.length ? tabel(['No', 'Soal', 'TP', 'Skor rata-rata', 'Dijawab'], sulit.map(function (x) { return [x.no, x.q.q, x.q.tp, x.p + '%', x.n + ' siswa']; })) : null,
      diag.length ? el('h3', { text: 'Peta miskonsepsi kelas (Cek Bekal, ' + diag.length + ' siswa)' }) : null,
      diag.length ? tabel(['No', 'Pertanyaan', 'Miskonsepsi yang diperiksa', 'Paham', 'Ragu', 'Belum tahu', 'Miskonsepsi', 'Siswa yang miskonsepsi'], mis) : null,
      el('div', { 'class': 'row noprint' }, [
        el('button', { 'class': 'btn small teal', type: 'button', text: 'Muat ulang data', onclick: function () { muat().then(function () { JP.toast('Data diperbarui.'); }); } }),
        el('button', { 'class': 'btn small', type: 'button', disabled: !daftar.length, text: 'Unduh rekap (CSV, bisa dibuka di Excel)', onclick: csv }),
        kelasPilih !== 'Semua' ? el('button', { 'class': 'btn small', type: 'button', disabled: !daftar.length, text: 'Hapus semua data kelas ' + kelasPilih, onclick: function () { if (prompt('Semua siswa kelas ' + kelasPilih + ' dan hasilnya akan dihapus dan tidak bisa dikembalikan. Ketik HAPUS untuk melanjutkan.') === 'HAPUS') { aksiGuru({ aksi: 'guru-hapus', kelas: kelasPilih, semuaKelas: true }, 'Data kelas ' + kelasPilih + ' dihapus.'); } } }) : null,
        el('button', { 'class': 'btn small', type: 'button', text: 'Keluar', onclick: keluarGuru })
      ]),
      el('p', { 'class': 'small muted', text: 'Yang disimpan hanya nama yang diketik siswa, kelas, dan hasil asesmennya. Hapus data kelas setelah pembelajaran selesai. Akun yang gambar rahasianya salah lima kali terkunci sampai Anda menekan Buka kunci.' })
    ]);
  }
  function muat() {
    return JP.akun.kirim({ aksi: 'guru-data', token: TOKEN }).then(function (j) { SISWA = j.siswa; WAKTU = j.waktu; isi(); }, function (e) {
      if (e.kode === 'guru') { keluarGuru(); return; }
      app.textContent = '';
      app.appendChild(el('div', { 'class': 'wrap', style: 'width:min(480px,100%)' }, [JP.kepala('asesmen'), el('section', { 'class': 'panel stack' }, [el('h1', { style: 'font-size:28px', text: 'Data kelas belum bisa dimuat' }), el('p', { 'class': 'muted', text: e.kode ? e.message : 'Tidak ada sambungan internet. Dasbor kelas memerlukan internet.' }), el('button', { 'class': 'btn primary', type: 'button', text: 'Coba lagi', onclick: muat })])]));
    });
  }
  function gerbang() {
    app.textContent = '';
    var pesan = el('p', { 'class': 'small', style: 'color:#ff9da0', role: 'alert', hidden: true }), tombol = el('button', { 'class': 'btn primary', type: 'submit', text: 'Buka' });
    app.appendChild(el('div', { 'class': 'wrap', style: 'width:min(480px,100%)' }, [JP.kepala('asesmen'),
      el('form', { 'class': 'panel stack', onsubmit: function (e) {
        e.preventDefault(); pesan.hidden = true; tombol.disabled = true; tombol.textContent = 'Memeriksa…';
        JP.akun.kirim({ aksi: 'guru-masuk', sandi: e.target.elements.pin.value }).then(function (j) { TOKEN = j.token; try { sessionStorage.setItem('jp-guru-token', TOKEN); } catch (x) { /* abaikan */ } return muat(); }, function (g) { tombol.disabled = false; tombol.textContent = 'Buka'; pesan.textContent = g.kode ? g.message : 'Tidak ada sambungan internet. Halaman guru memerlukan internet.'; pesan.hidden = false; });
      } }, [
        el('h1', { style: 'font-size:28px', text: 'Halaman guru' }),
        el('p', { 'class': 'muted', text: 'Halaman ini berisi data siswa dan kunci jawaban. Masukkan kata sandi guru untuk membukanya. Kata sandi diperiksa di server.' }),
        el('input', { type: 'password', name: 'pin', autocomplete: 'current-password', 'aria-label': 'Kata sandi guru' }), pesan, tombol
      ])]));
  }
  if (TOKEN) { muat(); } else { gerbang(); }
})();
