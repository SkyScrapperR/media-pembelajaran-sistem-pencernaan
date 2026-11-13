/* Ujian Akhir Penjelajah: asesmen sumatif 15 butir, skor maksimum 100, pembahasan di akhir */
(function () {
  'use strict';
  var el = JP.el, S = JP_SOAL, app = document.getElementById('app');
  var soal, i, jawab, peta;
  function bingkai(isi, lebar) { app.textContent = ''; app.appendChild(el('div', { 'class': 'wrap', style: lebar ? 'width:min(920px,100%)' : '' }, [JP.kepala('asesmen')].concat(isi))); window.scrollTo(0, 0); }
  function awal() {
    bingkai([el('section', { 'class': 'panel stack', style: 'align-items:center;text-align:center' }, [
      el('div', { 'class': 'bob' }, JP.nasi(96)),
      el('p', { 'class': 'kicker', text: 'Asesmen sumatif' }),
      el('h1', { text: 'Ujian Akhir Penjelajah' }),
      el('p', { 'class': 'lead', text: 'Temani Si Nasi menempuh seluruh saluran pencernaan. Setiap soal yang kamu jawab membuatnya maju satu langkah. Ada 15 soal dengan nilai tertinggi 100. Pembahasan muncul setelah semua soal selesai.' }),
      el('ul', { 'class': 'small muted', style: 'text-align:left;margin:0;padding-left:20px' }, [
        el('li', { text: 'Bentuk soal: pilihan ganda, pilih lebih dari satu, menjodohkan, mengurutkan, dan isian singkat.' }),
        el('li', { text: 'Kamu boleh kembali ke soal sebelumnya sebelum menekan Selesai.' }),
        el('li', { text: 'Raih nilai ' + S.KKTP + ' ke atas untuk mendapat sertifikat.' })
      ]),
      el('button', { 'class': 'btn primary', type: 'button', text: 'Mulai ujian', onclick: function () { JP.bunyi.ketuk(); mulai(); } })
    ])]);
  }
  function mulai() {
    soal = S.UJIAN.map(function (q) {
      var s = { q: q };
      if (q.opsi) { s.urut = JP.acak(q.opsi.map(function (_, k) { return k; })); }
      if (q.tipe === 'jodoh') { s.kanan = JP.acak(q.pasangan.map(function (_, k) { return k; })); }
      if (q.tipe === 'urut') { s.keping = JP.acak(q.urutan); }
      return s;
    });
    jawab = soal.map(function (s) { var t = s.q.tipe; return t === 'pg' ? null : t === 'pgk' ? [] : t === 'jodoh' ? {} : t === 'urut' ? [] : ''; });
    i = 0; peta = JP_jalur(soal.length); tampil();
  }
  function terisi(k) { var q = soal[k].q, a = jawab[k]; return q.tipe === 'pg' ? a !== null : q.tipe === 'pgk' ? a.length > 0 : q.tipe === 'jodoh' ? Object.keys(a).length === q.pasangan.length : q.tipe === 'urut' ? a.length === q.urutan.length : a.trim() !== ''; }
  var RENDER = {
    pg: function (s, segar) {
      return el('div', { 'class': 'stack', style: 'gap:8px' }, s.urut.map(function (k, n) {
        return el('button', { 'class': 'opt' + (jawab[i] === k ? ' pick' : ''), type: 'button', 'aria-pressed': jawab[i] === k ? 'true' : 'false', onclick: function () { JP.bunyi.ketuk(); jawab[i] = k; segar(); } }, [el('span', { 'class': 'key', text: 'ABCD'[n] }), el('span', { text: s.q.opsi[k] })]);
      }));
    },
    pgk: function (s, segar) {
      return el('div', { 'class': 'stack', style: 'gap:8px' }, [el('p', { 'class': 'small muted', text: 'Boleh memilih lebih dari satu.' })].concat(s.urut.map(function (k) {
        var on = jawab[i].indexOf(k) >= 0;
        return el('button', { 'class': 'opt' + (on ? ' pick' : ''), type: 'button', role: 'checkbox', 'aria-checked': on ? 'true' : 'false', onclick: function () { JP.bunyi.ketuk(); if (on) { jawab[i].splice(jawab[i].indexOf(k), 1); } else { jawab[i].push(k); } segar(); } }, [el('span', { 'class': 'key', style: 'border-radius:8px', text: on ? '✓' : '' }), el('span', { text: s.q.opsi[k] })]);
      })));
    },
    jodoh: function (s, segar) {
      var a = jawab[i], pas = s.q.pasangan;
      return el('div', { 'class': 'stack', style: 'gap:8px' }, [el('p', { 'class': 'small muted', text: 'Ketuk satu organ, lalu ketuk prosesnya. Ketuk lagi untuk mengganti pasangan.' }),
        el('div', { style: 'display:grid;grid-template-columns:minmax(0,2fr) minmax(0,3fr);gap:10px' }, [
          el('div', { 'class': 'stack', style: 'gap:8px' }, pas.map(function (p, k) { return el('button', { 'class': 'chip' + (s.pilih === k ? ' pick' : ''), type: 'button', style: 'width:100%;border-radius:14px;text-align:left;min-height:52px', onclick: function () { JP.bunyi.ketuk(); s.pilih = k; segar(); } }, [p[0], a[k] !== undefined ? el('span', { 'class': 'badge', style: 'margin-left:6px', text: String(s.kanan.indexOf(a[k]) + 1) }) : null]); })),
          el('div', { 'class': 'stack', style: 'gap:8px' }, s.kanan.map(function (k, n) {
            var dipakai = Object.keys(a).filter(function (x) { return a[x] === k; })[0];
            return el('button', { 'class': 'chip' + (dipakai !== undefined ? ' pick' : ''), type: 'button', style: 'width:100%;border-radius:14px;text-align:left;min-height:52px;padding:6px 14px', onclick: function () {
              if (s.pilih === undefined || s.pilih === null) { return; } JP.bunyi.ketuk();
              if (dipakai !== undefined) { delete a[dipakai]; } a[s.pilih] = k; s.pilih = null; segar();
            } }, [el('span', { 'class': 'badge', style: 'margin-right:6px', text: String(n + 1) }), pas[k][1]]);
          }))
        ])]);
    },
    urut: function (s, segar) {
      var a = jawab[i];
      return el('div', { 'class': 'stack', style: 'gap:8px' }, [el('p', { 'class': 'small muted', text: 'Ketuk nama organ sesuai urutan. Ketuk kotak yang sudah terisi untuk membatalkannya.' }),
        el('ol', { 'class': 'stack', style: 'margin:0;padding:0;list-style:none;gap:6px' }, s.q.urutan.map(function (_, k) {
          return el('li', {}, el('button', { 'class': 'slot' + (a[k] ? ' fill' : k === a.length ? ' next' : ''), type: 'button', style: 'width:100%;background:' + (a[k] ? '' : 'transparent'), disabled: !a[k], 'aria-label': a[k] ? 'Batalkan ' + a[k] : 'Posisi ' + (k + 1) + ' kosong', onclick: function () { a.splice(k); segar(); } }, [el('span', { 'class': 'n', text: String(k + 1) }), a[k] || '']));
        })),
        el('div', { 'class': 'chips' }, s.keping.map(function (nm) { return el('button', { 'class': 'chip', type: 'button', disabled: a.indexOf(nm) >= 0, text: nm, onclick: function () { JP.bunyi.ketuk(); a.push(nm); segar(); } }); }))]);
    },
    isian: function (s, segar, tombol) {
      var inp = el('input', { type: 'text', maxlength: 30, autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false', placeholder: 'Ketik jawabanmu', 'aria-label': 'Jawaban', value: jawab[i] });
      inp.addEventListener('input', function () { jawab[i] = inp.value; tombol(); });
      return el('div', {}, inp);
    }
  };
  function tampil() {
    var s = soal[i], q = s.q;
    var maju = el('button', { 'class': 'btn primary', type: 'button', onclick: function () { if (i + 1 < soal.length) { i++; tampil(); } else { var kosong = soal.filter(function (_, k) { return !terisi(k); }).length; if (!kosong || confirm('Masih ada ' + kosong + ' soal yang belum lengkap. Selesaikan ujian sekarang?')) { nilai(); } } } });
    var isi = el('div', {});
    function tombol() { maju.textContent = i + 1 < soal.length ? (terisi(i) ? 'Lanjut' : 'Lewati dulu') : 'Selesai'; }
    function segar() { isi.textContent = ''; isi.appendChild(RENDER[q.tipe](s, segar, tombol)); tombol(); }
    peta.style.maxWidth = '170px';
    bingkai([
      el('div', { 'class': 'hud' }, [el('span', { text: 'Soal ' + (i + 1) + ' dari ' + soal.length }), el('span', { 'class': 'badge', text: 'Skor soal ini: ' + q.skor })]),
      el('div', { 'class': 'meter' }, el('i', { style: 'width:' + (i / soal.length * 100) + '%;background:var(--sun)' })),
      el('div', { style: 'display:flex;gap:16px;align-items:flex-start' }, [
        el('section', { 'class': 'panel stack', style: 'flex:1;min-width:0' }, [el('h2', { style: 'font-size:20px;line-height:1.3', text: q.q }), isi,
          el('div', { 'class': 'row', style: 'justify-content:space-between' }, [el('button', { 'class': 'btn', type: 'button', disabled: i === 0, text: 'Sebelumnya', onclick: function () { i--; tampil(); } }), maju])]),
        el('aside', { 'class': 'petaSisi', style: 'flex:0 0 170px', 'aria-hidden': 'true' }, peta)
      ])
    ], true);
    segar();
    /* peta kemajuan hanya di layar lebar; di HP cukup batang kemajuan */
    if (window.matchMedia('(max-width: 640px)').matches) { peta.parentNode.style.display = 'none'; } else { try { peta.atur(i); } catch (e) { peta.parentNode.style.display = 'none'; } }
  }
  function jarak(a, b) { var m = [], x, y; for (x = 0; x <= a.length; x++) { m[x] = [x]; } for (y = 0; y <= b.length; y++) { m[0][y] = y; } for (x = 1; x <= a.length; x++) { for (y = 1; y <= b.length; y++) { m[x][y] = Math.min(m[x - 1][y] + 1, m[x][y - 1] + 1, m[x - 1][y - 1] + (a[x - 1] === b[y - 1] ? 0 : 1)); } } return m[a.length][b.length]; }
  function skorSoal(k) {
    var q = soal[k].q, a = jawab[k], n = 0;
    if (q.tipe === 'pg') { return a === q.kunci ? q.skor : 0; }
    if (q.tipe === 'pgk') { if (!a.length) { return 0; } q.opsi.forEach(function (_, o) { if ((q.kunci.indexOf(o) >= 0) === (a.indexOf(o) >= 0)) { n += 2; } }); return n; }
    if (q.tipe === 'jodoh') { q.pasangan.forEach(function (_, o) { if (a[o] === o) { n += 2; } }); return n; }
    if (q.tipe === 'urut') { q.urutan.forEach(function (nm, o) { if (a[o] === nm) { n++; } }); return n === q.urutan.length ? q.skor : n; }
    var t = a.toLowerCase().replace(/gerak(an)?/g, '').replace(/[^a-z]/g, '');
    return t === q.kunci ? q.skor : (t && jarak(t, q.kunci) <= 2 ? 6 : 0);
  }
  function teksJawab(k) {
    var q = soal[k].q, a = jawab[k];
    if (q.tipe === 'pg') { return a === null ? '(kosong)' : q.opsi[a]; }
    if (q.tipe === 'pgk') { return a.length ? a.slice().sort().map(function (o) { return q.opsi[o]; }).join('; ') : '(kosong)'; }
    if (q.tipe === 'jodoh') { return q.pasangan.map(function (p, o) { return p[0] + ' → ' + (a[o] !== undefined ? q.pasangan[a[o]][1] : '(kosong)'); }).join('; '); }
    if (q.tipe === 'urut') { return a.length ? a.join(', ') : '(kosong)'; }
    return a.trim() || '(kosong)';
  }
  function teksKunci(q) {
    if (q.tipe === 'pg') { return q.opsi[q.kunci]; }
    if (q.tipe === 'pgk') { return q.kunci.map(function (o) { return q.opsi[o]; }).join('; '); }
    if (q.tipe === 'jodoh') { return q.pasangan.map(function (p) { return p[0] + ' → ' + p[1]; }).join('; '); }
    if (q.tipe === 'urut') { return q.urutan.join(', '); }
    return q.kunci;
  }
  function nilai() {
    var skor = soal.map(function (_, k) { return skorSoal(k); }), total = skor.reduce(function (a, b) { return a + b; }, 0);
    var perTP = S.TP.map(function (_, t) { var d = 0, m = 0; soal.forEach(function (s, k) { if (s.q.tp === t + 1) { d += skor[k]; m += s.q.skor; } }); return { dapat: d, maks: m }; });
    var lama = JP.data.ujian, tuntas = total >= S.KKTP, b = total >= 90 ? 3 : total >= S.KKTP ? 2 : total >= 60 ? 1 : 0;
    JP.data.ujian = { nilai: Math.max(total, lama ? lama.nilai : 0), terakhir: total, waktu: new Date().toISOString(), perTP: perTP, coba: (lama ? lama.coba || 1 : 0) + 1 }; JP.simpan();
    JP.catat('Sumatif', S.predikat(total), total);
    if (tuntas) { JP.bunyi.menang(); JP.konfeti(150); } else { JP.bunyi.salah(); }
    var tgl = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    bingkai([
      el('section', { 'class': 'panel stack pop', style: 'align-items:center;text-align:center' }, [
        JP.nasi(84, tuntas ? 'senang' : 'sedih'),
        el('p', { 'class': 'kicker', text: 'Nilai Ujian Akhir' }),
        el('p', { style: 'font-family:var(--font-display);font-size:84px;line-height:1;color:var(--sun);font-variant-numeric:tabular-nums', text: String(total) }),
        JP.bintangMuncul(b),
        el('div', { 'class': 'row', style: 'justify-content:center' }, [el('span', { 'class': 'badge ' + (tuntas ? 'good' : 'sun'), text: S.predikat(total) }), el('span', { 'class': 'badge', text: tuntas ? 'Tuntas' : 'Belum tuntas (batas ' + S.KKTP + ')' })]),
        el('p', { 'class': 'lead', text: tuntas ? 'Selamat! Si Nasi sampai di ujung perjalanan berkat kamu.' : 'Jangan menyerah. Lihat bagian yang masih lemah di bawah, pelajari lagi, lalu ulangi ujiannya.' }),
        el('div', { 'class': 'row noprint', style: 'justify-content:center' }, [
          el('button', { 'class': 'btn' + (tuntas ? '' : ' primary'), type: 'button', text: 'Ulangi ujian', onclick: mulai }),
          tuntas ? null : el('a', { 'class': 'btn', href: '../belajar/', text: 'Belajar lagi' }),
          el('a', { 'class': 'btn', href: './', text: 'Kembali ke asesmen' })
        ])
      ]),
      tuntas ? el('section', { 'class': 'sertifikat' }, [
        JP.medali('A', '', false, '#c98a2b'),
        el('p', { 'class': 'kicker', text: 'Sertifikat Penjelajah Pencernaan' }),
        el('p', { 'class': 'muted', text: 'diberikan kepada' }),
        el('h2', { text: JP.data.nama || 'Penjelajah' }),
        el('p', { text: 'yang telah menuntaskan Ujian Akhir Penjelajah materi sistem pencernaan manusia dengan nilai ' + total + ' (' + S.predikat(total).toLowerCase() + ').' }),
        el('p', { 'class': 'small muted', text: tgl }),
        el('button', { 'class': 'btn small noprint', type: 'button', text: 'Cetak sertifikat', onclick: function () { window.print(); } })
      ]) : null,
      el('section', { 'class': 'panel stack' }, [
        el('h2', { text: 'Capaian per tujuan pembelajaran' }),
        el('div', { 'class': 'stack' }, perTP.map(function (p, t) {
          var pr = p.maks ? Math.round(p.dapat / p.maks * 100) : 0;
          return el('div', { 'class': 'stack', style: 'gap:4px' }, [el('div', { 'class': 'row small', style: 'justify-content:space-between;flex-wrap:nowrap;align-items:flex-start' }, [el('span', { text: (t + 1) + '. ' + S.TP[t] }), el('b', { style: 'flex:none', text: p.dapat + '/' + p.maks })]),
            el('div', { 'class': 'meter' }, el('i', { style: 'width:' + pr + '%;background:' + (pr >= S.KKTP ? 'var(--good)' : 'var(--sun)') }))]);
        }))
      ]),
      el('section', { 'class': 'panel stack' }, [
        el('h2', { text: 'Pembahasan' }),
        el('ol', { 'class': 'stack', style: 'margin:0;padding:0;list-style:none' }, soal.map(function (s, k) {
          var penuh = skor[k] === s.q.skor;
          return el('li', { 'class': 'fb stack ' + (penuh ? 'good' : skor[k] > 0 ? '' : 'bad'), style: 'gap:4px' }, [
            el('div', { 'class': 'row', style: 'justify-content:space-between;flex-wrap:nowrap;align-items:flex-start' }, [el('b', { text: (k + 1) + '. ' + s.q.q }), el('span', { 'class': 'badge ' + (penuh ? 'good' : skor[k] > 0 ? 'sun' : 'bad'), style: 'flex:none', text: skor[k] + '/' + s.q.skor })]),
            el('span', { 'class': 'small', text: 'Jawabanmu: ' + teksJawab(k) }),
            penuh ? null : el('span', { 'class': 'small', text: 'Jawaban benar: ' + teksKunci(s.q) }),
            el('span', { 'class': 'small muted', text: s.q.bahas })
          ]);
        }))
      ])
    ]);
  }
  awal();
})();
