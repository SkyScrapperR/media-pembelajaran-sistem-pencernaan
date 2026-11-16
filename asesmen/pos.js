/* Pos Pemeriksaan: asesmen formatif berupa 6 permainan pendek dengan umpan balik langsung */
(function () {
  'use strict';
  var el = JP.el, S = JP_SOAL, app = document.getElementById('app');
  var LENCANA = JP.LENCANA;
  var no = Math.max(1, Math.min(6, parseInt((location.search.match(/pos=(\d)/) || [])[1], 10) || 1));
  var pos = S.POS[no - 1], arena;
  JP.audio.halaman('riang', 'ceria');

  function bingkai(isi) {
    app.textContent = '';
    app.appendChild(el('div', { 'class': 'wrap' }, [JP.embed ? null : JP.kepala('asesmen')].concat(isi)));
    window.scrollTo(0, 0);
  }
  function judul() {
    return el('header', { 'class': 'stack', style: 'gap:4px' + (JP.embed ? ';padding-right:52px' : '') }, [
      el('p', { 'class': 'kicker', text: 'Pos ' + pos.no + ' · ' + pos.organ + ' · Asesmen formatif' }),
      el('h1', { style: 'font-size:clamp(26px,5vw,36px)', text: pos.judul })
    ]);
  }
  function awal() {
    var tk = JP.TOKOH[JP.TOKOH_POS[no - 1]];
    bingkai([judul(), el('section', { 'class': 'panel stack' }, [
      el('div', { 'class': 'dialog' }, [el('div', { 'class': 'bob' }, JP.tokoh(JP.TOKOH_POS[no - 1], 104, 'tawa')), el('p', { 'class': 'ucap' }, [el('b', { text: 'Halo, aku ' + tk.nama + ', penjaga Pos ' + no + '! ' }), pos.petunjuk])]),
      el('div', { 'class': 'row' }, JP.audio.tombolBaca('pos-' + pos.no, S.teksPos(pos), 'Dengarkan petunjuk')),
      el('p', { 'class': 'small muted', text: 'Kamu langsung tahu benar atau salahnya. Kalau belum berhasil, boleh mencoba lagi.' }),
      el('div', { 'class': 'row' }, el('button', { 'class': 'btn primary', type: 'button', text: 'Mulai', onclick: function () { JP.audio.henti(); JP.bunyi.ketuk(); main(); } }))
    ])]);
  }
  var PETUNJUK_MAIN = {
    pilah: [{ sel: '.card-big', judul: 'Geser kartunya', teks: 'Seret kartu ini ke kiri atau ke kanan. Kalau lebih suka, pakai dua tombol di bawahnya.' }, { sel: '.hud', judul: 'Pantau hasilmu', teks: 'Di sini terlihat kartu ke berapa dan berapa yang sudah tepat. Jawaban beruntun memberi bunyi kombo!' }],
    rute: [{ sel: '.chips', judul: 'Ketuk sesuai urutan', teks: 'Ketuk nama organ mulai dari yang pertama dilewati makanan. Awas, ada organ jebakan.' }, { sel: '.slot.next', judul: 'Rute tersusun di sini', teks: 'Organ yang benar akan mengisi kotak ini satu per satu.' }],
    tebak: [{ sel: '.panel ol', judul: 'Baca petunjuknya', teks: 'Tebak dari petunjuk pertama untuk 3 poin. Membuka petunjuk lain mengurangi poin.' }, { sel: '.chips', judul: 'Pilih jawabanmu', teks: 'Ketuk nama organ yang menurutmu benar.' }],
    jodoh: [{ sel: '.panel > div:nth-of-type(2)', judul: 'Pasangkan', teks: 'Ketuk satu nama di kiri, lalu ketuk tugasnya di kanan. Pasangan yang cocok berubah hijau.' }],
    tunjuk: [{ sel: '.panel h2', judul: 'Baca peristiwanya', teks: 'Setiap soal menceritakan apa yang terjadi di satu organ.' }, { sel: '.peta', judul: 'Ketuk organnya', teks: 'Ketuk organ yang tepat pada gambar tubuh. Benar di ketukan pertama memberi 2 poin.' }]
  };
  function main() {
    arena = el('section', { 'class': 'panel stack' });
    bingkai([judul(), arena]);
    MAIN[pos.jenis]();
    setTimeout(function () { JP_pandu.mulai('main-' + pos.jenis, PETUNJUK_MAIN[pos.jenis], { akhir: 'Main!' }); }, 450);
  }
  JP.bantu = function () {
    if (document.querySelector('.dialog')) { JP_pandu.mulai('pos-awal', PANDU_AWAL, { paksa: true }); }
    else if (arena && arena.isConnected) { JP_pandu.mulai('main-' + pos.jenis, PETUNJUK_MAIN[pos.jenis], { paksa: true, akhir: 'Main!' }); }
  };
  var PANDU_AWAL = [
    { sel: '.dialog', judul: 'Penjaga pos', teks: 'Setiap pos punya penjaga yang menjelaskan cara bermainnya. Baca dulu, ya.' },
    { sel: '.baca', judul: 'Bisa didengarkan', teks: 'Ketuk tombol ini kalau ingin petunjuknya dibacakan.', bulat: true },
    { sel: '.btn.primary', judul: 'Siap bermain?', teks: 'Ketuk Mulai. Kamu boleh mengulang permainan kapan saja untuk menambah bintang.', bulat: true }
  ];
  /* skor: 0..1, pesan: catatan singkat untuk siswa */
  function selesai(skor, pesan) {
    var persen = Math.round(skor * 100), b = persen >= 90 ? 3 : persen >= 70 ? 2 : persen >= 50 ? 1 : 0;
    var lama = JP.data.pos[no] || { bintang: 0, skor: 0, coba: 0 };
    JP.data.pos[no] = { bintang: Math.max(lama.bintang, b), skor: Math.max(lama.skor, persen), coba: lama.coba + 1 }; JP.simpan();
    JP.catat('Formatif Pos ' + no, pos.judul, persen);
    var baru = b > 0 && lama.bintang === 0;
    if (b > 0) { JP.bunyi.menang(); if (b === 3 || baru) { JP.konfeti(b === 3 ? 130 : 70); } if (baru) { setTimeout(JP.bunyi.lencana, 950); } } else { JP.bunyi.salah(); }
    JP.audio.nasi(b === 3 ? 'sempurna' : b > 0 ? 'bagus' : 'coba'); JP.cekNaik();
    var lanjut = JP.embed
      ? el('button', { 'class': 'btn primary', type: 'button', text: 'Kembali ke Perjalanan Nasi', onclick: function () { parent.postMessage('jp-pos-tutup', location.origin); } })
      : (no < 6 ? el('a', { 'class': 'btn primary', href: 'pos.html?pos=' + (no + 1), text: 'Pos berikutnya' }) : el('a', { 'class': 'btn primary', href: 'ujian.html', text: 'Lanjut ke Ujian Akhir' }));
    bingkai([judul(), el('section', { 'class': 'panel stack pop', style: 'align-items:center;text-align:center' }, [
      el('div', { 'class': 'row', style: 'justify-content:center;align-items:flex-end;gap:14px' }, [el('div', { 'class': 'bob' }, JP.nasi(84, b === 3 ? 'bangga' : b > 0 ? 'tawa' : 'sedih')), el('div', { 'class': 'bob', style: 'animation-delay:-1.2s' }, JP.tokoh(JP.TOKOH_POS[no - 1], 72, b > 0 ? 'tawa' : 'pikir')), b > 0 ? el('div', { 'class': 'pop', style: 'animation-delay:.9s' }, JP.medali(no, LENCANA[no - 1])) : null]),
      el('h2', { text: b === 3 ? 'Sempurna!' : b === 2 ? 'Hebat!' : b === 1 ? 'Berhasil!' : 'Hampir!' }),
      JP.bintangMuncul(b),
      el('p', { text: 'Ketepatanmu ' + persen + '%.' + (baru ? ' Lencana baru: ' + LENCANA[no - 1] + '!' : '') }),
      el('p', { 'class': 'muted', text: b === 3 ? pesan || 'Kamu sudah menguasai bagian ini.' : b > 0 ? 'Sudah bagus. Coba lagi untuk meraih 3 bintang.' : 'Belum cukup untuk mendapat bintang. Baca lagi penjelasannya di media belajar, lalu coba sekali lagi.' }),
      el('div', { 'class': 'row', style: 'justify-content:center' }, [
        b > 0 ? lanjut : null,
        el('button', { 'class': 'btn' + (b > 0 ? '' : ' primary'), type: 'button', text: 'Coba lagi', onclick: main }),
        JP.embed ? (b > 0 ? null : lanjut) : el('a', { 'class': 'btn', href: './', text: 'Daftar pos' })
      ])
    ])]);
  }
  function hud(kiri, kanan) { return el('div', { 'class': 'hud' }, [el('span', { text: kiri }), el('span', { 'class': 'muted', text: kanan })]); }

  var MAIN = {
    /* Geser kartu ke kiri atau kanan */
    pilah: function () {
      var kartu = JP.acak(pos.kartu), i = 0, benar = 0, runtun = 0;
      function tampil() {
        var k = kartu[i], dijawab = false, sx = 0, dx = 0, seret = false;
        var kotak = el('div', { 'class': 'card-big pop', text: k.t });
        var fb = el('div', { hidden: true });
        var tb = [el('button', { 'class': 'btn teal', type: 'button', text: '← ' + pos.kiri, onclick: function () { putus('kiri'); } }), el('button', { 'class': 'btn', type: 'button', style: 'border-color:var(--sun);color:var(--sun)', text: pos.kanan + ' →', onclick: function () { putus('kanan'); } })];
        function putus(arah) {
          if (dijawab) { return; } dijawab = true;
          var ok = k.k === arah; JP.bunyi.wus(); if (ok) { benar++; runtun++; if (runtun >= 3) { JP.bunyi.kombo(runtun); } else { JP.bunyi.benar(); } } else { runtun = 0; JP.bunyi.salah(); }
          kotak.style.transform = 'translateX(' + (arah === 'kiri' ? -40 : 40) + 'px) rotate(' + (arah === 'kiri' ? -4 : 4) + 'deg)'; kotak.style.opacity = '.55';
          tb.forEach(function (b) { b.disabled = true; });
          fb.className = 'fb pop stack ' + (ok ? 'good' : 'bad'); fb.hidden = false; fb.textContent = '';
          if (ok && runtun >= 3) { fb.appendChild(el('span', { 'class': 'kombo pop', style: 'align-self:flex-start', text: runtun + ' benar beruntun!' })); }
          fb.appendChild(el('b', { text: (ok ? 'Tepat! ' : 'Belum tepat. ') + 'Ini termasuk ' + (k.k === 'kiri' ? pos.kiri : pos.kanan).toLowerCase() + '.' }));
          fb.appendChild(el('span', { text: k.why }));
          var nx = el('button', { 'class': 'btn primary small', type: 'button', style: 'align-self:flex-start', text: i + 1 < kartu.length ? 'Kartu berikutnya' : 'Lihat hasil', onclick: function () { i++; if (i < kartu.length) { tampil(); } else { selesai(benar / kartu.length); } } });
          fb.appendChild(nx); nx.focus();
        }
        kotak.addEventListener('pointerdown', function (e) { if (dijawab) { return; } seret = true; sx = e.clientX; kotak.setPointerCapture(e.pointerId); kotak.classList.add('drag'); });
        kotak.addEventListener('pointermove', function (e) { if (!seret) { return; } dx = e.clientX - sx; kotak.style.transform = 'translateX(' + dx + 'px) rotate(' + dx / 22 + 'deg)'; kotak.classList.toggle('l', dx < -30); kotak.classList.toggle('r', dx > 30); });
        function lepas() { if (!seret) { return; } seret = false; kotak.classList.remove('drag', 'l', 'r'); if (dx < -80) { putus('kiri'); } else if (dx > 80) { putus('kanan'); } else { kotak.style.transform = ''; } dx = 0; }
        kotak.addEventListener('pointerup', lepas); kotak.addEventListener('pointercancel', lepas);
        arena.textContent = '';
        arena.appendChild(hud('Kartu ' + (i + 1) + ' dari ' + kartu.length, 'Tepat: ' + benar));
        arena.appendChild(el('div', { 'class': 'row small', style: 'justify-content:space-between;font-weight:600' }, [el('span', { style: 'color:var(--teal)', text: '← ' + pos.kiri }), el('span', { style: 'color:var(--sun)', text: pos.kanan + ' →' })]));
        arena.appendChild(el('div', { style: 'overflow:hidden;padding:6px 0' }, kotak));
        arena.appendChild(el('div', { 'class': 'row', style: 'justify-content:space-between' }, tb));
        arena.appendChild(fb);
      }
      tampil();
    },
    /* Ketuk organ sesuai urutan, ada pengecoh */
    rute: function () {
      var urut = pos.urutan, isi = [], salah = 0;
      var keping = JP.acak(urut.concat(Object.keys(pos.pengecoh)));
      var daftar = el('ol', { 'class': 'stack', style: 'margin:0;padding:0;list-style:none;gap:6px' });
      var pesan = el('div', { 'class': 'fb', hidden: true, 'aria-live': 'polite' });
      var info = hud('', '');
      var tb = keping.map(function (nm) {
        return el('button', { 'class': 'chip', type: 'button', text: nm, onclick: function () {
          var b = this;
          if (pos.pengecoh[nm]) { salah++; JP.bunyi.salah(); b.classList.add('wrong', 'shake'); b.disabled = true; pesan.hidden = false; pesan.className = 'fb bad pop'; pesan.textContent = pos.pengecoh[nm]; segar(); return; }
          if (nm === urut[isi.length]) {
            JP.bunyi.naik(isi.length); isi.push(nm); b.disabled = true; pesan.hidden = true; segar();
            if (isi.length === urut.length) { setTimeout(function () { selesai(Math.max(0, 1 - salah * 0.12), 'Kamu hafal seluruh rute perjalanan makanan.'); }, 700); }
          } else {
            salah++; JP.bunyi.salah(); b.classList.remove('shake'); void b.offsetWidth; b.classList.add('shake');
            pesan.hidden = false; pesan.className = 'fb bad pop';
            pesan.textContent = isi.length === 0 ? 'Belum tepat. Perjalanan dimulai dari tempat makanan pertama kali masuk.' : 'Belum tepat. Setelah ' + isi[isi.length - 1].toLowerCase() + ', makanan menuju ke mana?';
            segar();
          }
        } });
      });
      function segar() {
        info.firstChild.textContent = 'Organ tersusun ' + isi.length + ' dari ' + urut.length; info.lastChild.textContent = 'Salah: ' + salah;
        daftar.textContent = '';
        urut.forEach(function (_, k) { daftar.appendChild(el('li', { 'class': 'slot' + (isi[k] ? ' fill' : k === isi.length ? ' next' : '') }, [el('span', { 'class': 'n', text: String(k + 1) }), isi[k] || (k === isi.length ? 'Organ berikutnya?' : '')])); });
      }
      arena.textContent = ''; arena.appendChild(info); arena.appendChild(daftar); arena.appendChild(pesan); arena.appendChild(el('div', { 'class': 'chips' }, tb)); segar();
    },
    /* Teka-teki dengan petunjuk bertahap */
    tebak: function () {
      var teka = JP.acak(pos.teka), i = 0, poin = 0;
      function tampil() {
        var t = teka[i], buka = 1, usai = false;
        var daftar = el('ol', { 'class': 'stack', style: 'margin:0;padding-left:22px;gap:6px' });
        var fb = el('div', { hidden: true, 'aria-live': 'polite' });
        var lagi = el('button', { 'class': 'btn small teal', type: 'button', text: 'Buka petunjuk berikutnya', onclick: function () { if (buka < 3) { buka++; JP.bunyi.balik(); segar(); } } });
        var tb = pos.pilihan.map(function (nm) {
          return el('button', { 'class': 'chip', type: 'button', text: nm, onclick: function () {
            if (usai) { return; } JP.bunyi.ketuk();
            if (nm === t.j) { usai = true; var dapat = 4 - buka; poin += dapat; JP.bunyi.koin(); setTimeout(JP.bunyi.benar, 160); this.classList.add('right'); tutup(true, 'Benar, aku ' + t.j.toLowerCase() + '! Kamu mendapat ' + dapat + ' poin.'); }
            else { JP.bunyi.salah(); this.classList.add('wrong'); this.disabled = true;
              if (buka < 3) { buka++; segar(); fb.hidden = false; fb.className = 'fb bad pop'; fb.textContent = 'Bukan ' + nm.toLowerCase() + '. Satu petunjuk lagi dibuka untukmu.'; }
              else { usai = true; tutup(false, 'Belum tepat. Jawabannya ' + t.j.toLowerCase() + '.'); } }
          } });
        });
        function tutup(ok, teks) {
          buka = 3; segar(); lagi.hidden = true; tb.forEach(function (b) { b.disabled = true; if (b.textContent === t.j) { b.classList.add('right'); } });
          fb.hidden = false; fb.className = 'fb pop stack ' + (ok ? 'good' : 'bad'); fb.textContent = ''; fb.appendChild(el('b', { text: teks }));
          var nx = el('button', { 'class': 'btn primary small', type: 'button', style: 'align-self:flex-start', text: i + 1 < teka.length ? 'Teka-teki berikutnya' : 'Lihat hasil', onclick: function () { i++; if (i < teka.length) { tampil(); } else { selesai(poin / (teka.length * 3), 'Kamu mengenali organ hanya dari sedikit petunjuk.'); } } });
          fb.appendChild(nx); nx.focus();
        }
        function segar() { daftar.textContent = ''; t.c.slice(0, buka).forEach(function (c) { daftar.appendChild(el('li', { 'class': 'pop', text: c })); }); lagi.hidden = buka >= 3 || usai; }
        arena.textContent = '';
        arena.appendChild(hud('Teka-teki ' + (i + 1) + ' dari ' + teka.length, 'Poin: ' + poin));
        arena.appendChild(el('h2', { text: 'Siapa aku?' })); arena.appendChild(daftar); arena.appendChild(el('div', {}, lagi));
        arena.appendChild(el('div', { 'class': 'chips' }, tb)); arena.appendChild(fb); segar();
      }
      tampil();
    },
    /* Menjodohkan: ketuk kiri lalu kanan */
    jodoh: function () {
      var pas = pos.pasangan, kanan = JP.acak(pas.map(function (_, k) { return k; })), pilih = null, cocok = 0, salah = 0;
      var info = hud('', ''), pesan = el('div', { 'class': 'fb', hidden: true, 'aria-live': 'polite' });
      var kiriB = pas.map(function (p, k) { return el('button', { 'class': 'chip', type: 'button', style: 'width:100%;border-radius:14px;text-align:left', text: p[0], onclick: function () { JP.bunyi.ketuk(); pilih = k; kiriB.forEach(function (b) { b.classList.remove('pick'); }); this.classList.add('pick'); } }); });
      var kananB = kanan.map(function (k) { return el('button', { 'class': 'chip', type: 'button', style: 'width:100%;border-radius:14px;text-align:left;min-height:52px;padding:6px 14px', text: pas[k][1], onclick: function () {
        if (pilih === null) { pesan.hidden = false; pesan.className = 'fb pop'; pesan.textContent = 'Ketuk dulu satu nama di kolom kiri.'; return; }
        if (pilih === k) { JP.bunyi.koin(); cocok++; this.classList.add('right'); this.disabled = true; kiriB[k].classList.remove('pick'); kiriB[k].classList.add('right'); kiriB[k].disabled = true; pilih = null; pesan.hidden = false; pesan.className = 'fb good pop'; pesan.textContent = 'Tepat! ' + pas[k][0] + ': ' + pas[k][1].toLowerCase() + '.';
          if (cocok === pas.length) { setTimeout(function () { selesai(Math.max(0, 1 - salah * 0.15), 'Kamu tahu tugas setiap organ.'); }, 800); } }
        else { salah++; JP.bunyi.salah(); var b = this; b.classList.remove('shake'); void b.offsetWidth; b.classList.add('shake'); pesan.hidden = false; pesan.className = 'fb bad pop'; pesan.textContent = 'Belum cocok. Itu bukan tugas ' + pas[pilih][0].toLowerCase() + '. Coba pasangan lain.'; }
        segar();
      } }); });
      function segar() { info.firstChild.textContent = 'Pasangan ' + cocok + ' dari ' + pas.length; info.lastChild.textContent = 'Salah: ' + salah; }
      arena.textContent = ''; arena.appendChild(info);
      arena.appendChild(el('div', { style: 'display:grid;grid-template-columns:minmax(0,2fr) minmax(0,3fr);gap:10px' }, [el('div', { 'class': 'stack', style: 'gap:8px' }, kiriB), el('div', { 'class': 'stack', style: 'gap:8px' }, kananB)]));
      arena.appendChild(pesan); segar();
    },
    /* Ketuk organ pada gambar tubuh */
    tunjuk: function () {
      var tanya = JP.acak(pos.tanya), i = 0, poin = 0, coba = 0, kunci = false;
      var teks = el('h2', { style: 'font-size:20px', 'aria-live': 'polite' }), info = hud('', ''), fb = el('div', { 'class': 'fb', hidden: true, 'aria-live': 'polite' });
      var svg = JP_peta({ pilih: function (id, g) {
        if (kunci) { return; }
        var t = tanya[i];
        if (id === t.j) { kunci = true; var dapat = coba === 0 ? 2 : 1; poin += dapat; JP.bunyi.pop(); setTimeout(JP.bunyi.benar, 90); g.classList.add('right'); fb.hidden = false; fb.className = 'fb good pop'; fb.textContent = 'Tepat, itu ' + S.NAMA_ORGAN[id].toLowerCase() + '! +' + dapat + ' poin.'; setTimeout(maju, 1300); }
        else { coba++; JP.bunyi.salah(); g.classList.add('wrong'); setTimeout(function () { g.classList.remove('wrong'); }, 600);
          if (coba >= 2) { kunci = true; svg.organ[t.j].classList.add('right'); fb.hidden = false; fb.className = 'fb bad pop'; fb.textContent = 'Itu ' + S.NAMA_ORGAN[id].toLowerCase() + '. Jawabannya ' + S.NAMA_ORGAN[t.j].toLowerCase() + ', yang sekarang menyala hijau.'; setTimeout(maju, 2400); }
          else { fb.hidden = false; fb.className = 'fb bad pop'; fb.textContent = 'Itu ' + S.NAMA_ORGAN[id].toLowerCase() + '. Coba sekali lagi.'; } }
        segar();
      } });
      function maju() { i++; coba = 0; kunci = false; Object.keys(svg.organ).forEach(function (k) { svg.organ[k].classList.remove('right'); }); fb.hidden = true; if (i < tanya.length) { segar(); } else { selesai(poin / (tanya.length * 2), 'Kamu tahu letak setiap organ dan apa yang terjadi di dalamnya.'); } }
      function segar() { if (i < tanya.length) { teks.textContent = tanya[i].t; } info.firstChild.textContent = 'Soal ' + Math.min(i + 1, tanya.length) + ' dari ' + tanya.length; info.lastChild.textContent = 'Poin: ' + poin; }
      arena.textContent = ''; arena.appendChild(info); arena.appendChild(teks); arena.appendChild(fb); arena.appendChild(svg); segar();
    }
  };
  awal();
  if (!JP.embed) { setTimeout(function () { JP_pandu.mulai('pos-awal', PANDU_AWAL); }, 700); }
})();
