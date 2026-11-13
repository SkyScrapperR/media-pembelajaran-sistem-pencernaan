/* Halaman guru: identitas, kisi-kisi, kunci jawaban, pedoman penskoran, dan rekap hasil di perangkat ini */
(function () {
  'use strict';
  var el = JP.el, S = JP_SOAL, app = document.getElementById('app');
  var PIN = 'guru2026';
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
    return bagian('Rekap hasil di perangkat ini', [
      el('p', { 'class': 'muted small', text: 'Hasil tersimpan di peramban perangkat ini saja. Gunakan satu perangkat bergantian, lalu unduh rekapnya, atau minta siswa menunjukkan layar hasilnya.' }),
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
  function gerbang() {
    app.textContent = '';
    var pesan = el('p', { 'class': 'small', style: 'color:#ff9da0', hidden: true, text: 'Kata sandi belum tepat.' });
    app.appendChild(el('div', { 'class': 'wrap', style: 'width:min(480px,100%)' }, [JP.kepala('asesmen'),
      el('form', { 'class': 'panel stack', onsubmit: function (e) { e.preventDefault(); if (e.target.elements.pin.value.trim().toLowerCase() === PIN) { try { sessionStorage.setItem('jp-guru', '1'); } catch (x) { /* abaikan */ } isi(); } else { pesan.hidden = false; } } }, [
        el('h1', { style: 'font-size:28px', text: 'Halaman guru' }),
        el('p', { 'class': 'muted', text: 'Halaman ini berisi kunci jawaban. Masukkan kata sandi guru untuk membukanya.' }),
        el('input', { type: 'password', name: 'pin', autocomplete: 'off', 'aria-label': 'Kata sandi guru' }), pesan,
        el('button', { 'class': 'btn primary', type: 'submit', text: 'Buka' })
      ])]));
  }
  var buka = false; try { buka = sessionStorage.getItem('jp-guru') === '1'; } catch (e) { /* abaikan */ }
  if (buka) { isi(); } else { gerbang(); }
})();
