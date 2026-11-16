/* Akun siswa: masuk dengan kelas + nama + dua gambar rahasia, lalu progres disimpan ke database kelas.
   Tanpa internet, permainan tetap berjalan dan hasilnya dikirim saat internet kembali. */
(function () {
  'use strict';
  var el = JP.el, d = JP.data, KEY = 'jelajah-pencernaan:akun', KOTOR = 'jelajah-pencernaan:kotor', API = JP.dasar + 'api/jp';
  var GAMBAR = ['🍎', '🍌', '🥕', '🍞', '🐟', '🥚', '🥛', '🍇', '🌽', '🍊', '🥦', '🍉'];
  var NAMA_GAMBAR = ['apel', 'pisang', 'wortel', 'roti', 'ikan', 'telur', 'susu', 'anggur', 'jagung', 'jeruk', 'brokoli', 'semangka'];
  var BIDANG = ['tingkat', 'bonus', 'diag', 'pos', 'ujian', 'rekor', 'avatar'];
  var info = null; try { info = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { /* penyimpanan tidak tersedia */ }
  var versi = 0, jam = null, sedang = false;

  function kirim(b, lepas) {
    return fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(b), keepalive: !!lepas }).then(function (r) {
      return r.json().then(function (j) { if (!j.ok) { var e = new Error(j.pesan || 'Gagal'); e.kode = j.kode || 'server'; throw e; } return j; }, function () { var e = new Error('Server sedang bermasalah. Coba lagi sebentar.'); e.kode = 'server'; throw e; });
    });
  }
  function progres() { var o = {}; BIDANG.forEach(function (k) { o[k] = d[k]; }); return o; }
  function riwayatKu(nama) { return d.riwayat.filter(function (r) { return r.nama === nama; }).map(function (r) { return { jenis: r.jenis, ringkas: r.ringkas, nilai: r.nilai, waktu: r.waktu }; }); }
  function kotor(v) { try { if (v) { localStorage.setItem(KOTOR, '1'); } else { localStorage.removeItem(KOTOR); } } catch (e) { /* abaikan */ } }
  function adaKotor() { try { return localStorage.getItem(KOTOR) === '1'; } catch (e) { return false; } }
  function simpanInfo() { try { if (info) { localStorage.setItem(KEY, JSON.stringify(info)); } else { localStorage.removeItem(KEY); } } catch (e) { /* abaikan */ } }
  /* memasang jawaban server ke data di perangkat; mengembalikan true bila ada yang berubah */
  function terapkan(j) {
    var lama = JSON.stringify(progres());
    BIDANG.forEach(function (k) { if (j.data[k] !== undefined) { d[k] = j.data[k]; } });
    d.nama = j.nama;
    d.riwayat = d.riwayat.filter(function (r) { return r.nama !== j.nama; }).concat((j.riwayat || []).map(function (r) { return { nama: j.nama, jenis: r.jenis, ringkas: r.ringkas, nilai: r.nilai, waktu: r.waktu }; }));
    JP.simpan(true);
    return lama !== JSON.stringify(progres());
  }
  function kabar(berubah) { try { document.dispatchEvent(new CustomEvent('jp-sinkron', { detail: { berubah: !!berubah } })); } catch (e) { /* abaikan */ } }
  function sinkron(lepas) {
    if (!info || sedang) { return Promise.resolve(false); }
    sedang = true; var v = versi;
    return kirim({ aksi: 'simpan', token: info.token, data: progres(), riwayat: riwayatKu(info.nama) }, lepas).then(function (j) {
      sedang = false;
      if (v !== versi) { return sinkron(); } /* ada hasil baru saat menunggu: kirim ulang, jangan timpa */
      kotor(false); var berubah = terapkan(j); kabar(berubah); return true;
    }, function (e) {
      sedang = false;
      if (e.kode === 'sesi') { info = null; simpanInfo(); kotor(false); JP.toast('Kamu perlu masuk lagi supaya hasilmu tersimpan.', 4200); kabar(true); }
      return false;
    });
  }
  function jadwal() {
    if (!info) { return; }
    versi++; kotor(true); clearTimeout(jam); jam = setTimeout(function () { jam = null; sinkron(); }, 1200);
  }
  addEventListener('pagehide', function () { if (jam && info) { clearTimeout(jam); jam = null; sedang = false; sinkron(true); } });
  addEventListener('online', function () { if (adaKotor()) { sinkron(); } });

  /* ---------- jendela masuk ---------- */
  function buka(selesai) {
    var lama = document.querySelector('.akun-latar'); if (lama) { lama.remove(); }
    var kelas = '', nama = '', kotak = el('div', { 'class': 'akun-kotak panel stack', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Masuk kelas' });
    var latar = el('div', { 'class': 'akun-latar' }, kotak);
    function tutup() { latar.remove(); document.removeEventListener('keydown', esc); }
    function esc(e) { if (e.key === 'Escape') { tutup(); } }
    document.addEventListener('keydown', esc);
    latar.addEventListener('pointerdown', function (e) { if (e.target === latar) { tutup(); } });
    function isi(anak) { kotak.textContent = ''; [].concat(anak).forEach(function (a) { if (a) { kotak.appendChild(a); } }); var f = kotak.querySelector('[data-fokus]'); if (f) { setTimeout(function () { f.focus(); }, 60); } }
    function kepala(judul, teks) { return el('div', { 'class': 'row', style: 'flex-wrap:nowrap;align-items:flex-start;gap:12px' }, [JP.nasi(54), el('div', { 'class': 'stack', style: 'gap:4px;min-width:0' }, [el('h2', { text: judul }), teks ? el('p', { 'class': 'muted small', text: teks }) : null])]); }
    function galat() { return el('p', { 'class': 'small akun-galat', role: 'alert', hidden: true }); }
    function tampilGalat(p, e) { p.textContent = e && e.kode ? e.message : 'Tidak ada sambungan internet. Untuk masuk pertama kali perlu internet.'; p.hidden = false; JP.bunyi.salah(); }
    function masukBerhasil(j) {
      info = { kelas: j.kelas, nama: j.nama, token: j.token }; simpanInfo(); kotor(false); terapkan(j);
      JP.bunyi.koin(); JP.konfeti(50); JP.toast('Selamat datang, ' + j.nama + ' dari kelas ' + j.kelas + '!', 3200);
      tutup(); kabar(true); if (selesai) { selesai(); }
    }
    /* progres yang sudah dibuat sebelum masuk ikut dibawa bila belum bernama atau namanya sama */
    function bawaan() { var boleh = !d.nama || d.nama.toLowerCase() === nama.toLowerCase(); return boleh ? { data: progres(), riwayat: riwayatKu(d.nama || 'Tanpa nama') } : { data: {}, riwayat: [] }; }

    function langkahNama() {
      var pesan = galat(), tKelas = ['A', 'B', 'C'].map(function (k) {
        return el('button', { 'class': 'akun-kelas' + (kelas === k ? ' pilih' : ''), type: 'button', 'aria-pressed': kelas === k ? 'true' : 'false', text: k, 'aria-label': 'Kelas ' + k, onclick: function () { kelas = k; JP.bunyi.ketuk(); tKelas.forEach(function (b) { var on = b.textContent === k; b.classList.toggle('pilih', on); b.setAttribute('aria-pressed', on ? 'true' : 'false'); }); } });
      });
      var input = el('input', { type: 'text', maxlength: 24, autocomplete: 'off', placeholder: 'Tulis namamu', value: nama, 'data-fokus': kelas ? '' : null, style: 'max-width:none' });
      var lanjut = el('button', { 'class': 'btn primary', type: 'submit', text: 'Lanjut' });
      isi([kepala('Masuk kelas', 'Pilih kelasmu, lalu tulis namamu. Satu nama hanya bisa dipakai satu anak di tiap kelas.'),
        el('form', { 'class': 'stack', onsubmit: function (e) {
          e.preventDefault(); nama = input.value.replace(/\s+/g, ' ').trim(); pesan.hidden = true;
          if (!kelas) { pesan.textContent = 'Pilih dulu kelasmu: A, B, atau C.'; pesan.hidden = false; return; }
          if (nama.replace(/[^a-zA-Z0-9]/g, '').length < 2) { pesan.textContent = 'Tulis namamu, minimal 2 huruf.'; pesan.hidden = false; return; }
          lanjut.disabled = true; lanjut.textContent = 'Memeriksa…';
          kirim({ aksi: 'cek', kelas: kelas, nama: nama }).then(function (j) { if (j.ada) { nama = j.nama; langkahRahasia('lama', j); } else { langkahRahasia('baru', j); } }, function (e) { lanjut.disabled = false; lanjut.textContent = 'Lanjut'; tampilGalat(pesan, e); });
        } }, [
          el('div', { 'class': 'stack', style: 'gap:6px' }, [el('span', { 'class': 'kicker', text: 'Kelasku' }), el('div', { 'class': 'row', role: 'group', 'aria-label': 'Pilih kelas' }, tKelas)]),
          el('label', { 'class': 'stack', style: 'gap:6px' }, [el('span', { 'class': 'kicker', text: 'Namaku' }), input]),
          pesan,
          el('div', { 'class': 'row', style: 'justify-content:space-between' }, [el('button', { 'class': 'btn small', type: 'button', text: 'Nanti saja', onclick: tutup }), lanjut])
        ])]);
    }
    function langkahRahasia(mode, cek) {
      var pilih = [], pesan = galat(), slot = el('div', { 'class': 'akun-slot', 'aria-live': 'polite' });
      var kirimB = el('button', { 'class': 'btn primary', type: 'button', disabled: true, text: mode === 'baru' ? 'Daftar' : 'Masuk' });
      function segar() {
        slot.textContent = '';
        [0, 1].forEach(function (k) { slot.appendChild(el('span', { 'class': 'akun-isi' + (pilih[k] !== undefined ? ' ada' : ''), text: pilih[k] !== undefined ? GAMBAR[pilih[k]] : String(k + 1) })); });
        if (pilih.length) { slot.appendChild(el('button', { 'class': 'btn small', type: 'button', text: 'Ulangi', onclick: function () { pilih = []; segar(); } })); }
        kirimB.disabled = pilih.length < 2;
      }
      var kisi = el('div', { 'class': 'akun-gambar', role: 'group', 'aria-label': 'Pilih dua gambar' }, GAMBAR.map(function (g, k) {
        return el('button', { type: 'button', 'aria-label': NAMA_GAMBAR[k], text: g, 'data-fokus': k === 0 ? '' : null, onclick: function () { if (pilih.length < 2) { pilih.push(k); JP.bunyi.pop(); segar(); } } });
      }));
      kirimB.addEventListener('click', function () {
        pesan.hidden = true; kirimB.disabled = true;
        var b = bawaan(), badan = { aksi: mode === 'baru' ? 'daftar' : 'masuk', kelas: kelas, nama: nama, rahasia: pilih.join('-'), data: b.data, riwayat: b.riwayat };
        kirim(badan).then(masukBerhasil, function (e) {
          if (e.kode === 'dipakai') { langkahNama(); var p = kotak.querySelector('.akun-galat'); p.textContent = e.message + ' Baru saja ada yang memakainya. Coba tambahkan nama belakangmu.'; p.hidden = false; return; }
          pilih = []; segar(); tampilGalat(pesan, e);
        });
      });
      var judul, teks;
      if (mode === 'baru') { judul = 'Halo, ' + nama + '!'; teks = 'Pilih dua gambar rahasiamu, misalnya apel lalu ikan. Ingat baik-baik, ya. Gambar ini dipakai kalau kamu masuk dari HP atau laptop lain.'; }
      else if (cek.terkunci) { judul = 'Akun terkunci'; teks = 'Gambar rahasia untuk nama ' + nama + ' salah berkali-kali. Minta gurumu membukanya di halaman guru.'; }
      else if (cek.perluRahasia) { judul = 'Halo lagi, ' + nama + '!'; teks = 'Gurumu sudah membuka akunmu. Pilih dua gambar rahasia yang baru.'; }
      else { judul = 'Nama ' + nama + ' sudah dipakai'; teks = 'Kalau itu memang kamu, ketuk dua gambar rahasiamu. Kalau bukan, kembali lalu pakai nama lain, misalnya tambahkan nama belakangmu.'; }
      segar();
      isi([kepala(judul, teks), cek.terkunci ? null : slot, cek.terkunci ? null : kisi, pesan,
        el('div', { 'class': 'row', style: 'justify-content:space-between' }, [el('button', { 'class': 'btn small', type: 'button', text: '← Ganti nama', onclick: langkahNama }), cek.terkunci ? null : kirimB])]);
    }
    document.body.appendChild(latar); langkahNama();
  }
  function keluar() {
    var t = info; if (!t) { return Promise.resolve(); }
    var beres = function () { info = null; simpanInfo(); kotor(false); JP.gantiPemain(); kabar(true); };
    /* kirim hasil terakhir dulu supaya tidak ada yang tertinggal di perangkat ini */
    return kirim({ aksi: 'simpan', token: t.token, data: progres(), riwayat: riwayatKu(t.nama) }).then(function () { return kirim({ aksi: 'keluar', token: t.token }); }).then(beres, function (e) {
      if (e.kode || confirm('Internet sedang putus. Hasil yang belum terkirim akan hilang kalau kamu keluar sekarang. Tetap keluar?')) { beres(); }
    });
  }
  function papan() { return info ? kirim({ aksi: 'papan', token: info.token }) : Promise.reject(new Error('belum masuk')); }

  JP.akun = { get info() { return info; }, buka: buka, keluar: keluar, sinkron: sinkron, jadwal: jadwal, papan: papan, kirim: kirim, belumTerkirim: adaKotor };
  /* setiap halaman dibuka: ambil hasil dari perangkat lain dan kirim yang tertunda */
  if (info && !JP.embed) { setTimeout(function () { sinkron(); }, 300); }
  if (!info && !JP.embed && /\/asesmen\/(pos|ujian|cek-bekal)\.html/.test(location.pathname)) { setTimeout(function () { JP.toast('Kamu belum masuk kelas. Hasilmu baru terlihat oleh guru setelah kamu masuk kelas dari Peta Petualangan.', 5200); }, 1600); }
})();
