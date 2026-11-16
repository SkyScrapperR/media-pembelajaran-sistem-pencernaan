/* Para tokoh: Si Nasi sang penjelajah, enam penjaga pos, dan Si Kuman. Semua digambar sendiri dengan SVG. */
(function () {
  'use strict';
  var JP = window.JP, el = JP.el, G = '#12262d';
  var DAFTAR = {
    nasi: { nama: 'Si Nasi', peran: 'Penjelajah', warna: '#fffdf7', muka: [50, 66], fakta: 'Aku sebutir nasi yang ingin tahu ke mana makanan pergi setelah ditelan.' },
    gigo: { nama: 'Gigo', peran: 'Penjaga Pos 1 · Mulut', warna: '#ffffff', muka: [50, 46], fakta: 'Aku Gigo si gigi. Tugasku memotong dan menghaluskan makanan.' },
    kero: { nama: 'Kero', peran: 'Penjaga Pos 2 · Kerongkongan', warna: '#f6a184', muka: [50, 52], fakta: 'Aku Kero. Ototku meremas bergantian untuk mendorong makanan ke lambung.' },
    lambu: { nama: 'Lambu', peran: 'Penjaga Pos 3 · Lambung', warna: '#f47a9d', muka: [57, 56], fakta: 'Aku Lambu. Aku mengaduk makanan jadi bubur dan asamku membunuh kuman.' },
    hali: { nama: 'Hali', peran: 'Penjaga Pos 4 · Usus Halus', warna: '#ffa9be', muka: [50, 60], fakta: 'Aku Hali. Jonjot di dindingku menyerap sari makanan ke dalam darah.' },
    kolo: { nama: 'Kolo', peran: 'Penjaga Pos 5 · Usus Besar', warna: '#f09a4f', muka: [50, 60], fakta: 'Aku Kolo. Aku menyerap air dari sisa makanan. Jangan lupa minum, ya!' },
    tiha: { nama: 'Tiha', peran: 'Penjaga Pos 6 · Si Hati', warna: '#c05672', muka: [44, 56], fakta: 'Aku Tiha si hati. Makanan tidak lewat aku, tetapi aku membuat cairan empedu.' },
    kuman: { nama: 'Si Kuman', peran: 'Si pengganggu', warna: '#8bd346', muka: [50, 60], fakta: 'Hehe, aku Si Kuman. Aku takut sekali dengan asam lambung dan tangan yang bersih!' }
  };
  var POS = ['gigo', 'kero', 'lambu', 'hali', 'kolo', 'tiha'];

  function wajah(cx, cy, mood, skala) {
    var s = skala || 1, dx = 10 * s, mata, mulut, alis = '';
    if (mood === 'bangga' || mood === 'tawa') {
      mata = '<path d="M' + (cx - dx - 4 * s) + ' ' + cy + 'q' + 4 * s + ' -' + 6 * s + ' ' + 8 * s + ' 0M' + (cx + dx - 4 * s) + ' ' + cy + 'q' + 4 * s + ' -' + 6 * s + ' ' + 8 * s + ' 0" fill="none" stroke="' + G + '" stroke-width="' + 3 * s + '" stroke-linecap="round"/>';
    } else {
      var ry = (mood === 'kaget' ? 6.4 : 5.4) * s;
      mata = '<g class="mata"><ellipse cx="' + (cx - dx) + '" cy="' + cy + '" rx="' + 4.2 * s + '" ry="' + ry + '" fill="' + G + '"/><ellipse cx="' + (cx + dx) + '" cy="' + cy + '" rx="' + 4.2 * s + '" ry="' + ry + '" fill="' + G + '"/><circle cx="' + (cx - dx + 1.5 * s) + '" cy="' + (cy - 2 * s) + '" r="' + 1.5 * s + '" fill="#fff"/><circle cx="' + (cx + dx + 1.5 * s) + '" cy="' + (cy - 2 * s) + '" r="' + 1.5 * s + '" fill="#fff"/></g>';
    }
    if (mood === 'marah') { alis = '<path d="M' + (cx - dx - 6 * s) + ' ' + (cy - 10 * s) + 'l' + 10 * s + ' ' + 4 * s + 'M' + (cx + dx + 6 * s) + ' ' + (cy - 10 * s) + 'l-' + 10 * s + ' ' + 4 * s + '" stroke="' + G + '" stroke-width="' + 3 * s + '" stroke-linecap="round"/>'; }
    if (mood === 'pikir') { alis = '<path d="M' + (cx + dx - 5 * s) + ' ' + (cy - 11 * s) + 'q' + 5 * s + ' -' + 4 * s + ' ' + 10 * s + ' 0" fill="none" stroke="' + G + '" stroke-width="' + 2.6 * s + '" stroke-linecap="round"/>'; }
    var my = cy + 12 * s;
    if (mood === 'sedih' || mood === 'marah') { mulut = '<path d="M' + (cx - 7 * s) + ' ' + (my + 4 * s) + 'q' + 7 * s + ' -' + 7 * s + ' ' + 14 * s + ' 0" fill="none" stroke="' + G + '" stroke-width="' + 3 * s + '" stroke-linecap="round"/>'; }
    else if (mood === 'kaget') { mulut = '<ellipse cx="' + cx + '" cy="' + (my + 2 * s) + '" rx="' + 4.2 * s + '" ry="' + 5.2 * s + '" fill="' + G + '"/>'; }
    else if (mood === 'pikir') { mulut = '<path d="M' + (cx - 5 * s) + ' ' + (my + 2 * s) + 'h' + 10 * s + '" stroke="' + G + '" stroke-width="' + 3 * s + '" stroke-linecap="round"/>'; }
    else if (mood === 'tawa' || mood === 'bangga') { mulut = '<path d="M' + (cx - 8 * s) + ' ' + (my - 1 * s) + 'q' + 8 * s + ' ' + 13 * s + ' ' + 16 * s + ' 0z" fill="#7a1f2d" stroke="' + G + '" stroke-width="' + 2.4 * s + '" stroke-linejoin="round"/>'; }
    else { mulut = '<path d="M' + (cx - 8 * s) + ' ' + my + 'q' + 8 * s + ' ' + 9 * s + ' ' + 16 * s + ' 0" fill="none" stroke="' + G + '" stroke-width="' + 3 * s + '" stroke-linecap="round"/>'; }
    var pipi = '<ellipse cx="' + (cx - dx - 9 * s) + '" cy="' + (cy + 9 * s) + '" rx="' + 5.5 * s + '" ry="' + 3.2 * s + '" fill="#ff6a4d" opacity=".45"/><ellipse cx="' + (cx + dx + 9 * s) + '" cy="' + (cy + 9 * s) + '" rx="' + 5.5 * s + '" ry="' + 3.2 * s + '" fill="#ff6a4d" opacity=".45"/>';
    return alis + mata + pipi + mulut;
  }
  var ST = ' stroke="' + G + '" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round"';
  function kaki(x1, x2, y) { return '<ellipse cx="' + x1 + '" cy="' + y + '" rx="7" ry="4" fill="' + G + '"/><ellipse cx="' + x2 + '" cy="' + y + '" rx="7" ry="4" fill="' + G + '"/>'; }
  function kilap(x, y, rx, ry, rot) { return '<ellipse cx="' + x + '" cy="' + y + '" rx="' + rx + '" ry="' + ry + '" fill="#fff" opacity=".4" transform="rotate(' + (rot || -30) + ' ' + x + ' ' + y + ')"/>'; }
  var BADAN = {
    nasi: function (m) {
      var tangan = m === 'bangga' || m === 'tawa' ? '<path d="M20 70Q6 60 8 44M80 70q14-10 12-26"' : '<path d="M20 74Q8 72 6 60M80 72q12-6 13-18"';
      return tangan + ' fill="none"' + ST + '/><path d="M40 106l-3 8M60 106l3 8" fill="none"' + ST + '/>' +
        '<path d="M50 20c22 0 33 22 33 46 0 26-15 42-33 42S17 92 17 66c0-24 11-46 33-46z" fill="#fffdf7"' + ST + '/>' +
        '<path d="M72 44c6 14 6 36-4 50 10-8 14-22 14-32 0-8-4-14-10-18z" fill="#e9e2d2" opacity=".8"/>' + kilap(34, 44, 5, 11, 24) +
        /* topi penjelajah */
        '<path d="M26 30c2-16 14-24 24-24s22 8 24 24z" fill="#d9a441"' + ST + '/><path d="M18 31c10-5 54-5 64 0 2 4-2 6-6 6H24c-4 0-8-2-6-6z" fill="#e8b85a"' + ST + '/><path d="M29 25h42" stroke="#ff6a4d" stroke-width="5"/>';
    },
    gigo: function () { return kaki(40, 60, 104) + '<path d="M24 32c0-13 11-20 26-15 15-5 26 2 26 15 0 13-4 22-7 36-2 12-5 26-12 26-6 0-4-18-7-18s-1 18-7 18c-7 0-10-14-12-26-3-14-7-23-7-36z" fill="#ffffff"' + ST + '/><path d="M68 36c2 10-2 22-4 34 6-10 9-22 9-32 0-3-2-4-5-2z" fill="#dfe9f2"/>' + kilap(34, 30, 4, 8, 30); },
    kero: function () { return kaki(42, 58, 106) + '<path d="M37 8h26c5 0 7 4 7 8 0 10-7 14-7 24s9 16 9 28-5 18-5 26c0 5-3 8-7 8H40c-4 0-7-3-7-8 0-8-5-14-5-26s9-18 9-28-7-14-7-24c0-4 2-8 7-8z" fill="#f6a184"' + ST + '/><path d="M40 24q10 5 20 0M34 82q16 6 32 0" fill="none" stroke="#c9573a" stroke-width="2.6" stroke-linecap="round" opacity=".6"/><ellipse cx="50" cy="10" rx="11" ry="3.4" fill="#c9573a"/>' + kilap(40, 36, 3.5, 8, 10); },
    lambu: function () { return kaki(44, 66, 104) + '<path d="M30 6h12v14c10-4 26-2 36 10 12 14 13 40 3 56-10 16-32 20-48 12-10-5-17-14-17-24h12c3 6 9 6 12 0 3-8-4-12-8-22-3-8-2-18-2-26z" fill="#f47a9d"' + ST + '/><path d="M78 40c6 14 4 32-4 44" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".45"/>' + kilap(40, 30, 4, 9, 20); },
    hali: function () { return kaki(40, 60, 104) + '<circle cx="50" cy="60" r="39" fill="#ffa9be"' + ST + '/><path d="M22 44q28-16 56 0M16 62q6-8 12-2M72 60q6-6 12 2M24 82q26 14 52 0" fill="none" stroke="#e8708c" stroke-width="3" stroke-linecap="round" opacity=".75"/>' + kilap(32, 36, 5, 10, 40); },
    kolo: function () {
      var d = 'M', n = 10, i;
      for (i = 0; i <= n; i++) { var a = i / n * 6.2832, a2 = (i + 0.5) / n * 6.2832, x = 50 + Math.cos(a) * 34, y = 60 + Math.sin(a) * 34, qx = 50 + Math.cos(a2) * 46, qy = 60 + Math.sin(a2) * 46; d += (i ? '' : x.toFixed(1) + ' ' + y.toFixed(1)) + (i < n ? 'Q' + qx.toFixed(1) + ' ' + qy.toFixed(1) + ' ' + (50 + Math.cos((i + 1) / n * 6.2832) * 34).toFixed(1) + ' ' + (60 + Math.sin((i + 1) / n * 6.2832) * 34).toFixed(1) : 'z'); }
      return kaki(40, 60, 106) + '<path d="' + d + '" fill="#f09a4f"' + ST + '/>' + kilap(34, 36, 5, 9, 40);
    },
    tiha: function () { return kaki(34, 56, 96) + '<path d="M8 52c0-20 18-30 42-30 24 0 42 6 42 20 0 10-10 18-26 26-16 9-30 24-44 20C12 85 8 68 8 52z" fill="#c05672"' + ST + '/><path d="M60 26c2 12-2 22-8 30" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" opacity=".35"/>' + kilap(26, 38, 5, 9, 50); },
    kuman: function () {
      var s = '', i; for (i = 0; i < 10; i++) { var a = i / 10 * 6.2832, x1 = 50 + Math.cos(a) * 26, y1 = 60 + Math.sin(a) * 26, x2 = 50 + Math.cos(a) * 40, y2 = 60 + Math.sin(a) * 40; s += '<path d="M' + x1.toFixed(1) + ' ' + y1.toFixed(1) + 'L' + x2.toFixed(1) + ' ' + y2.toFixed(1) + '" stroke="#2f5a12" stroke-width="4" stroke-linecap="round"/><circle cx="' + x2.toFixed(1) + '" cy="' + y2.toFixed(1) + '" r="4.2" fill="#8bd346" stroke="#2f5a12" stroke-width="2"/>'; }
      return s + '<circle cx="50" cy="60" r="28" fill="#8bd346" stroke="#2f5a12" stroke-width="3.4"/><circle cx="36" cy="74" r="3.4" fill="#5e9a2a"/><circle cx="64" cy="46" r="2.6" fill="#5e9a2a"/>' + kilap(38, 44, 4, 8, 40);
    }
  };
  /* tokoh(id, ukuran, suasana): senang, tawa, bangga, sedih, kaget, pikir, marah */
  function tokoh(id, ukuran, mood) {
    var t = DAFTAR[id] || DAFTAR.nasi; if (!DAFTAR[id]) { id = 'nasi'; }
    mood = mood || (id === 'kuman' ? 'marah' : 'senang');
    return el('span', { 'class': 'tokoh t-' + id, 'aria-hidden': 'true', html: '<svg viewBox="0 0 100 116" width="' + ukuran + '" height="' + Math.round(ukuran * 1.16) + '">' + BADAN[id](mood) + wajah(t.muka[0], t.muka[1], mood, id === 'tiha' || id === 'kero' || id === 'lambu' ? 0.85 : 1) + '</svg>' });
  }
  /* kartu tokoh dengan nama, untuk barisan perkenalan */
  function kartu(id, ukuran) {
    var t = DAFTAR[id];
    var b = el('button', { 'class': 'kartu-tokoh', type: 'button', 'aria-label': t.nama + ', ' + t.peran, onclick: function () {
      var g = b.firstChild; g.classList.remove('lompat'); void g.offsetWidth; g.classList.add('lompat');
      JP.bunyi.pop(); JP.toast(t.fakta, 3600);
    } }, [tokoh(id, ukuran || 64), el('b', { text: t.nama }), el('span', { text: t.peran.split(' · ').pop() })]);
    return b;
  }
  JP.tokoh = tokoh; JP.kartuTokoh = kartu; JP.TOKOH = DAFTAR; JP.TOKOH_POS = POS;
  JP.nasi = function (ukuran, mood) { return tokoh('nasi', ukuran, mood); };
})();
