/* Cek Bekal: asesmen diagnostik. Pilihan ganda ditambah tingkat keyakinan, tanpa nilai. */
(function () {
  'use strict';
  var el = JP.el, S = JP_SOAL, app = document.getElementById('app');
  var soal = [], i = 0, hasil = [];
  function bingkai(isi) { app.textContent = ''; app.appendChild(el('div', { 'class': 'wrap' }, [JP.kepala('asesmen')].concat(isi))); window.scrollTo(0, 0); }
  function ransel() {
    return el('div', { 'class': 'row', role: 'img', 'aria-label': hasil.length + ' dari ' + soal.length + ' bekal terisi', style: 'gap:6px' }, soal.map(function (_, k) {
      return el('span', { style: 'width:34px;height:34px;border-radius:10px;display:grid;place-items:center;font-family:var(--font-display);border:1.5px ' + (k < hasil.length ? 'solid var(--teal);background:var(--teal-soft);color:var(--teal)' : k === i ? 'solid var(--accent)' : 'dashed var(--edge);color:var(--muted)'), text: String(k + 1) });
    }));
  }
  function mulai() { soal = JP.acak(S.DIAG); i = 0; hasil = []; tanya(); }
  function awal() {
    bingkai([el('section', { 'class': 'panel stack', style: 'align-items:center;text-align:center' }, [
      el('div', { 'class': 'bob' }, JP.nasi(96)),
      el('p', { 'class': 'kicker', text: 'Asesmen diagnostik' }),
      el('h1', { text: 'Cek Bekal' }),
      el('p', { 'class': 'lead', text: 'Sebelum menjelajah, Si Nasi ingin tahu bekal pengetahuanmu. Ada 6 pertanyaan. Tidak ada nilai dan tidak ada yang dimarahi, jadi jawab sejujurnya. Setelah menjawab, pilih seberapa yakin kamu.' }),
      el('button', { 'class': 'btn primary', type: 'button', text: 'Mulai', onclick: function () { JP.bunyi.ketuk(); mulai(); } })
    ])]);
  }
  function tanya() {
    var q = soal[i], urut = JP.acak(q.opsi.map(function (_, k) { return k; })), pilih = null;
    var kotakYakin = el('div', { 'class': 'fb stack pop', hidden: true }, [
      el('b', { text: 'Seberapa yakin kamu dengan jawaban itu?' }),
      el('div', { 'class': 'row' }, [
        el('button', { 'class': 'btn teal', type: 'button', text: 'Aku yakin', onclick: function () { jawab(true); } }),
        el('button', { 'class': 'btn', type: 'button', text: 'Aku ragu-ragu', onclick: function () { jawab(false); } })
      ])
    ]);
    var tombol = urut.map(function (k, n) {
      return el('button', { 'class': 'opt', type: 'button', onclick: function () {
        JP.bunyi.ketuk(); pilih = k;
        tombol.forEach(function (b) { b.classList.remove('pick'); }); this.classList.add('pick');
        kotakYakin.hidden = false; kotakYakin.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      } }, [el('span', { 'class': 'key', text: 'ABCD'[n] }), el('span', { text: q.opsi[k] })]);
    });
    function jawab(yakin) {
      JP.bunyi.balik();
      var benar = pilih === q.kunci;
      hasil.push({ id: q.id, pilih: pilih, benar: benar, yakin: yakin, kat: benar ? (yakin ? 'paham' : 'ragu') : (yakin ? 'mis' : 'belum') });
      i++; if (i < soal.length) { tanya(); } else { selesai(); }
    }
    bingkai([
      el('div', { 'class': 'hud' }, [el('span', { text: 'Bekal ' + (i + 1) + ' dari ' + soal.length }), ransel()]),
      el('section', { 'class': 'panel stack' }, [el('h2', { text: q.q }), el('div', { 'class': 'stack', style: 'gap:8px' }, tombol), kotakYakin])
    ]);
  }
  function selesai() {
    JP.bunyi.menang(); JP.konfeti(60);
    JP.data.diag = { waktu: new Date().toISOString(), items: hasil }; JP.simpan();
    var hitung = {}; Object.keys(S.KATEGORI).forEach(function (k) { hitung[k] = hasil.filter(function (h) { return h.kat === k; }).length; });
    JP.catat('Diagnostik', Object.keys(hitung).map(function (k) { return S.KATEGORI[k].n + ' ' + hitung[k]; }).join(', '), null);
    var perlu = hasil.filter(function (h) { return h.kat !== 'paham'; });
    bingkai([
      el('section', { 'class': 'panel stack' }, [
        el('p', { 'class': 'kicker', text: 'Hasil Cek Bekal' }),
        el('h1', { text: perlu.length === 0 ? 'Bekalmu lengkap!' : 'Bekalmu sudah terpetakan' }),
        el('p', { 'class': 'lead', text: 'Ini bukan nilai. Ini peta untuk membantumu tahu bagian mana yang perlu lebih diperhatikan saat belajar.' }),
        el('div', { 'class': 'grid2' }, Object.keys(S.KATEGORI).map(function (k) {
          return el('div', { 'class': 'fb stack', style: 'gap:2px' }, [el('span', { 'class': 'badge ' + S.KATEGORI[k].warna, style: 'align-self:flex-start', text: S.KATEGORI[k].n }), el('b', { style: 'font-family:var(--font-display);font-size:30px', text: String(hitung[k]) }), el('span', { 'class': 'small muted', text: S.KATEGORI[k].ket })]);
        }))
      ]),
      el('section', { 'class': 'panel stack' }, [
        el('h2', { text: 'Rincian dan saran belajar' }),
        el('ol', { 'class': 'stack', style: 'margin:0;padding:0;list-style:none' }, hasil.map(function (h) {
          var q = S.DIAG.filter(function (x) { return x.id === h.id; })[0], K = S.KATEGORI[h.kat];
          return el('li', { 'class': 'fb stack', style: 'gap:6px' }, [
            el('div', { 'class': 'row', style: 'justify-content:space-between' }, [el('b', { text: q.q }), el('span', { 'class': 'badge ' + K.warna, text: K.n })]),
            el('span', { 'class': 'small', text: 'Jawabanmu: ' + q.opsi[h.pilih] + (h.yakin ? ' (yakin)' : ' (ragu-ragu)') }),
            h.kat === 'paham' ? null : el('span', { 'class': 'small muted', text: 'Saran: ' + q.saran })
          ]);
        })),
        el('p', { 'class': 'small muted', text: 'Jawaban yang benar sengaja belum ditampilkan. Temukan sendiri saat belajar, ya!' }),
        el('div', { 'class': 'row' }, [
          el('a', { 'class': 'btn primary', href: '../belajar/', text: 'Mulai belajar' }),
          el('a', { 'class': 'btn', href: './', text: 'Kembali ke asesmen' })
        ])
      ])
    ]);
  }
  awal();
})();
