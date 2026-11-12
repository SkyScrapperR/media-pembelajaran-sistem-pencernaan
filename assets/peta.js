/* Gambar tubuh 2D dengan organ pencernaan yang bisa diketuk (dibuat sendiri, dipakai di asesmen) */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  var P = {
    HEAD: 'M160,22 C188,22 206,44 206,78 C206,110 188,134 160,134 C132,134 114,110 114,78 C114,44 132,22 160,22 Z',
    HAIR: 'M112,82 C104,40 130,12 162,12 C194,12 218,40 208,82 C204,66 196,54 182,48 C176,57 158,63 140,61 C127,61 117,69 112,82 Z',
    TORSO: 'M142,156 C124,164 96,166 76,176 C62,183 58,200 62,218 C70,236 78,252 80,274 C82,320 88,360 88,392 C88,424 76,452 76,482 C76,508 88,526 100,538 L104,580 L154,580 L156,552 Q160,538 164,552 L166,580 L216,580 L220,538 C232,526 244,508 244,482 C244,452 232,424 232,392 C232,360 238,320 240,274 C242,252 250,236 258,218 C262,200 258,183 244,176 C224,166 196,164 178,156 Z',
    ESO: 'M164,124 C165,170 166,210 167,246 C168,268 170,284 178,298',
    LIVER: 'M92,302 C110,282 152,282 174,292 C182,296 188,300 190,306 C182,318 168,328 152,336 C134,348 118,356 104,354 C92,352 86,338 88,322 C89,312 90,306 92,302 Z',
    GALL: 'M112,342 C112,332 128,332 128,342 L127,354 C126,362 114,362 113,354 Z',
    STOMACH: 'M176,294 C184,280 208,276 222,292 C234,308 234,344 224,364 C212,384 184,390 162,380 C156,377 152,372 148,366 L150,352 C162,358 178,360 190,350 C202,340 204,318 192,306 C186,300 182,300 180,302 Z',
    PANCREAS: 'M134,392 C134,382 146,380 158,384 C182,390 204,386 220,376 C228,372 234,380 228,386 C212,396 190,402 168,404 C152,406 134,404 134,392 Z',
    DUO: 'M149,359 C136,358 126,366 124,380 C122,396 128,408 142,410 C156,412 168,410 176,404',
    SMALL: 'M176,404 C190,412 196,428 190,442 C172,436 140,438 128,446 C118,454 126,462 140,461 C160,460 184,458 196,465 C206,472 200,482 186,482 C168,482 140,480 128,486 C120,490 116,492 112,490',
    COLON: 'M106,500 C100,478 98,452 102,432 C104,420 112,414 124,416 C146,424 174,434 196,426 C208,422 218,412 222,422 C226,434 222,460 220,478 C218,494 206,504 190,506 C178,508 170,508 166,516',
    RECTUM: 'M166,514 L163,534',
    MOUTH: 'M145,108 Q160,105 175,108 Q173,126 160,128 Q147,126 145,108 Z'
  };
  /* satu jalur utuh dari mulut sampai anus, untuk peta kemajuan */
  var TRACT = 'M160,114 C161,119 163,122 164,126 C165,170 166,210 167,246 C168,268 170,284 178,298 C190,288 214,296 220,318 C226,342 214,366 194,372 C178,376 160,370 149,359 C136,358 126,366 124,380 C122,396 128,408 142,410 C156,412 168,410 176,404 C190,412 196,428 190,442 C172,436 140,438 128,446 C118,454 126,462 140,461 C160,460 184,458 196,465 C206,472 200,482 186,482 C168,482 140,480 128,486 C120,490 116,492 112,490 C109,494 107,497 106,500 C100,478 98,452 102,432 C104,420 112,414 124,416 C146,424 174,434 196,426 C208,422 218,412 222,422 C226,434 222,460 220,478 C218,494 206,504 190,506 C178,508 170,508 166,516 L163,530 L162,536';
  var LINE = '#0c1a1f';
  function s(tag, attrs) { var e = document.createElementNS(NS, tag); for (var k in attrs) { e.setAttribute(k, attrs[k]); } return e; }
  function tube(g, d, col, w, tepi) {
    g.appendChild(s('path', { d: d, fill: 'none', stroke: LINE, 'stroke-width': w + 4.5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'class': 'ol' }));
    g.appendChild(s('path', { d: d, fill: 'none', stroke: col, 'stroke-width': w, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }));
    g.appendChild(s('path', { d: d, fill: 'none', stroke: 'transparent', 'stroke-width': w + (tepi === undefined ? 14 : tepi) }));
  }
  function blob(g, d, col) { g.appendChild(s('path', { d: d, fill: col, stroke: LINE, 'stroke-width': 2.6, 'stroke-linejoin': 'round', 'class': 'ol' })); }
  function sosok(svg) {
    var f = s('g', { 'aria-hidden': 'true' });
    f.appendChild(s('path', { d: P.TORSO, fill: '#2f4a53', stroke: '#6fd6cf', 'stroke-width': 2, 'stroke-opacity': 0.55 }));
    f.appendChild(s('rect', { x: 142, y: 118, width: 36, height: 48, fill: '#2f4a53' }));
    f.appendChild(s('path', { d: P.HEAD, fill: '#2f4a53', stroke: '#6fd6cf', 'stroke-width': 2, 'stroke-opacity': 0.55 }));
    f.appendChild(s('path', { d: P.HAIR, fill: '#1b2d33' }));
    f.appendChild(s('ellipse', { cx: 143, cy: 86, rx: 4, ry: 5.5, fill: '#0c1a1f' })); f.appendChild(s('ellipse', { cx: 177, cy: 86, rx: 4, ry: 5.5, fill: '#0c1a1f' }));
    svg.appendChild(f);
  }
  /* opsi.pilih(id, grup): dipanggil saat organ diketuk */
  function peta(opsi) {
    opsi = opsi || {};
    var svg = s('svg', { viewBox: '40 0 240 590', 'class': 'peta', role: 'group', 'aria-label': 'Gambar tubuh dengan organ pencernaan' });
    sosok(svg);
    var org = {};
    function grup(id, nama, isi) {
      var g = s('g', { 'class': 'org', 'data-id': id, tabindex: opsi.pilih ? 0 : -1, role: opsi.pilih ? 'button' : 'img', 'aria-label': nama });
      isi(g); svg.appendChild(g); org[id] = g;
      if (opsi.pilih) {
        g.addEventListener('click', function () { opsi.pilih(id, g); });
        g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); opsi.pilih(id, g); } });
      }
    }
    grup('kerongkongan', 'Kerongkongan', function (g) { tube(g, P.ESO, '#f38c6b', 10); });
    grup('pankreas', 'Pankreas', function (g) { blob(g, P.PANCREAS, '#f5b53a'); });
    grup('hati', 'Hati', function (g) { blob(g, P.LIVER, '#a23a55'); });
    grup('empedu', 'Kantong empedu', function (g) { blob(g, P.GALL, '#4fb36a'); });
    grup('lambung', 'Lambung', function (g) { blob(g, P.STOMACH, '#f2618b'); });
    grup('ususBesar', 'Usus besar', function (g) { tube(g, P.COLON, '#e8873a', 16, 4); });
    grup('ususHalus', 'Usus halus', function (g) { tube(g, P.DUO, '#ff93ae', 9); tube(g, P.SMALL, '#ff93ae', 9); });
    grup('anus', 'Rektum dan anus', function (g) { tube(g, P.RECTUM, '#c9673a', 12); });
    grup('mulut', 'Mulut', function (g) { blob(g, P.MOUTH, '#e8707f'); g.appendChild(s('rect', { x: 136, y: 98, width: 48, height: 36, fill: 'transparent' })); });
    svg.organ = org;
    return svg;
  }
  /* Peta kemajuan: jalur saluran dengan n titik, Si Nasi berjalan mengikuti nomor soal */
  function jalur(n) {
    var svg = s('svg', { viewBox: '40 0 240 590', 'class': 'peta', role: 'img', 'aria-label': 'Peta kemajuan di sepanjang saluran pencernaan' });
    sosok(svg);
    var path = s('path', { d: TRACT, fill: 'none', stroke: '#ff93ae', 'stroke-width': 10, 'stroke-linecap': 'round', 'stroke-opacity': 0.35 });
    var maju = s('path', { d: TRACT, fill: 'none', stroke: '#ffc857', 'stroke-width': 10, 'stroke-linecap': 'round' });
    svg.appendChild(path); svg.appendChild(maju);
    var titik = [], total = 0, bola = s('g', {});
    bola.appendChild(s('circle', { r: 11, fill: '#fffdf7', stroke: LINE, 'stroke-width': 2.4 }));
    bola.appendChild(s('circle', { cx: -3.5, cy: -1.5, r: 1.6, fill: LINE })); bola.appendChild(s('circle', { cx: 3.5, cy: -1.5, r: 1.6, fill: LINE }));
    bola.appendChild(s('path', { d: 'M-3.5,3.5 q3.5,3 7,0', fill: 'none', stroke: LINE, 'stroke-width': 1.5, 'stroke-linecap': 'round' }));
    svg.atur = function (i) {
      if (!total) { total = path.getTotalLength(); maju.setAttribute('stroke-dasharray', total); for (var k = 0; k < n; k++) { var pt = path.getPointAtLength(total * (k + 0.5) / n), c = s('circle', { cx: pt.x, cy: pt.y, r: 4, fill: '#12262d', stroke: '#fff', 'stroke-width': 1.5 }); titik.push(c); svg.insertBefore(c, bola); } }
      var L = total * Math.min(1, (i + 0.5) / n), p = path.getPointAtLength(L);
      maju.setAttribute('stroke-dashoffset', total - L);
      bola.setAttribute('transform', 'translate(' + p.x + ' ' + p.y + ')');
      titik.forEach(function (c, k) { c.setAttribute('fill', k < i ? '#ffc857' : '#12262d'); });
    };
    svg.appendChild(bola);
    return svg;
  }
  window.JP_peta = peta; window.JP_jalur = jalur;
})();
