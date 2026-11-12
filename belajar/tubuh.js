/* Pembangun model tubuh 3D: medan jarak + surface nets, dijalankan di browser */
(function () {
  function buildBodyGeometry() {
    var Cs = 0.085, X0 = -3.6, Y0 = -12.75, Z0 = -2.0, NX = 86, NY = 265, NZ = 48;
    function ell(px, py, pz, cx, cy, cz, rx, ry, rz) {
      var ax = (px - cx) / rx, ay = (py - cy) / ry, az = (pz - cz) / rz;
      var k0 = Math.sqrt(ax * ax + ay * ay + az * az);
      var bx = ax / rx, by = ay / ry, bz = az / rz;
      var k1 = Math.sqrt(bx * bx + by * by + bz * bz) + 1e-6;
      return k0 * (k0 - 1) / k1;
    }
    function cone(px, py, pz, ax, ay, az, ra, bx, by, bz, rb) {
      var bax = bx - ax, bay = by - ay, baz = bz - az, pax = px - ax, pay = py - ay, paz = pz - az;
      var h = (pax * bax + pay * bay + paz * baz) / (bax * bax + bay * bay + baz * baz);
      h = h < 0 ? 0 : h > 1 ? 1 : h;
      var dx = pax - bax * h, dy = pay - bay * h, dz = paz - baz * h;
      return Math.sqrt(dx * dx + dy * dy + dz * dz) - (ra + (rb - ra) * h);
    }
    function smin(a, b, k) { var h = 0.5 + 0.5 * (b - a) / k; h = h < 0 ? 0 : h > 1 ? 1 : h; return b + (a - b) * h - k * h * (1 - h); }
    function smax(a, b, k) { return -smin(-a, -b, k); }
    function head(x, y, z) {
      var d = ell(x, y, z, 0, 8.2, -0.15, 0.98, 1.05, 1.12);
      d = smin(d, ell(x, y, z, 0, 7.35, 0.22, 0.8, 0.98, 0.8), 0.22);
      d = smin(d, ell(x, y, z, 0, 6.62, 0.5, 0.36, 0.3, 0.36), 0.22);
      d = smin(d, cone(x, y, z, 0.6, 7.35, -0.1, 0.24, 0.3, 6.62, 0.42, 0.17), 0.22);
      d = smin(d, cone(x, y, z, -0.6, 7.35, -0.1, 0.24, -0.3, 6.62, 0.42, 0.17), 0.22);
      d = smin(d, ell(x, y, z, 0, 8.12, 0.8, 0.62, 0.15, 0.22), 0.22);
      d = smin(d, ell(x, y, z, 0.45, 7.55, 0.62, 0.3, 0.28, 0.3), 0.22);
      d = smin(d, ell(x, y, z, -0.45, 7.55, 0.62, 0.3, 0.28, 0.3), 0.22);
      d = smin(d, cone(x, y, z, 0, 7.95, 0.95, 0.08, 0, 7.42, 1.13, 0.15), 0.12);
      d = smin(d, ell(x, y, z, 0.97, 7.75, -0.12, 0.11, 0.32, 0.22), 0.07);
      d = smin(d, ell(x, y, z, -0.97, 7.75, -0.12, 0.11, 0.32, 0.22), 0.07);
      d = smax(d, -ell(x, y, z, 0.34, 7.92, 1.02, 0.2, 0.14, 0.2), 0.1);
      d = smax(d, -ell(x, y, z, -0.34, 7.92, 1.02, 0.2, 0.14, 0.2), 0.1);
      return d;
    }
    function torso(x, y, z) {
      var k = 0.45, d = cone(x, y, z, 0, 6.9, -0.25, 0.6, 0, 5.4, -0.2, 0.72);
      d = smin(d, cone(x, y, z, 0.55, 6.05, -0.38, 0.42, 2.05, 5.35, -0.25, 0.36), k);
      d = smin(d, cone(x, y, z, -0.55, 6.05, -0.38, 0.42, -2.05, 5.35, -0.25, 0.36), k);
      d = smin(d, ell(x, y, z, 2.35, 5.05, -0.12, 0.55, 0.62, 0.6), k);
      d = smin(d, ell(x, y, z, -2.35, 5.05, -0.12, 0.55, 0.62, 0.6), k);
      d = smin(d, ell(x, y, z, 0, 3.7, -0.05, 2.05, 2.15, 1.2), k);
      d = smin(d, ell(x, y, z, 0.9, 4.35, 0.5, 0.9, 0.62, 0.62), k);
      d = smin(d, ell(x, y, z, -0.9, 4.35, 0.5, 0.9, 0.62, 0.62), k);
      d = smin(d, ell(x, y, z, 0, 1.45, 0.08, 1.95, 2.05, 1.12), k);
      d = smin(d, ell(x, y, z, 0, 0.5, 0.3, 1.45, 1.25, 0.9), k);
      d = smin(d, ell(x, y, z, 0, -0.9, -0.05, 2.05, 1.4, 1.15), k);
      d = smin(d, ell(x, y, z, 0.78, -1.35, -0.55, 0.9, 0.95, 0.72), k);
      d = smin(d, ell(x, y, z, -0.78, -1.35, -0.55, 0.9, 0.95, 0.72), k);
      return d;
    }
    function leg(x, y, z, s) {
      var d = cone(x, y, z, s * 1.0, -1.45, 0, 1.0, s * 0.88, -6.25, 0.05, 0.56);
      d = smin(d, cone(x, y, z, s * 0.88, -6.25, 0.05, 0.54, s * 0.82, -11.5, -0.12, 0.27), 0.3);
      d = smin(d, ell(x, y, z, s * 0.9, -7.7, -0.22, 0.5, 1.25, 0.52), 0.3);
      d = smin(d, cone(x, y, z, s * 0.82, -11.75, -0.25, 0.3, s * 0.9, -12.3, 1.15, 0.24), 0.3);
      d = smin(d, ell(x, y, z, s * 0.84, -12.3, -0.2, 0.3, 0.2, 0.36), 0.3);
      return d;
    }
    function arm(x, y, z, s) {
      var d = cone(x, y, z, s * 2.45, 4.95, -0.15, 0.56, s * 2.8, 1.35, -0.25, 0.4);
      d = smin(d, cone(x, y, z, s * 2.8, 1.35, -0.25, 0.4, s * 2.92, -1.95, 0.1, 0.27), 0.2);
      d = smin(d, ell(x, y, z, s * 2.68, 3.4, -0.1, 0.5, 0.9, 0.5), 0.2);
      d = smin(d, ell(x, y, z, s * 2.82, 0.55, -0.12, 0.42, 0.85, 0.4), 0.2);
      d = smin(d, ell(x, y, z, s * 2.97, -2.85, 0.15, 0.17, 0.72, 0.42), 0.2);
      d = smin(d, cone(x, y, z, s * 2.95, -2.6, 0.48, 0.1, s * 2.92, -3.05, 0.65, 0.08), 0.2);
      return d;
    }
    function field(x, y, z) {
      var BIG = 10, t = (y > -3.2 && y < 7.6) ? torso(x, y, z) : BIG;
      var s = x < 0 ? -1 : 1;
      var lg = y < 0.2 ? leg(x, y, z, s) : BIG;
      var am = (x * s > 1.3 && y > -4.2 && y < 6.3) ? arm(x, y, z, s) : BIG;
      var hd = y > 5.8 ? head(x, y, z) : BIG;
      var d = smin(t, lg, 0.5);
      d = smin(d, am, 0.3);
      return smin(d, hd, 0.35);
    }
    // 1. sampel medan
    var F = new Float32Array(NX * NY * NZ), i, j, kk, n = 0;
    for (kk = 0; kk < NZ; kk++) { var z = Z0 + kk * Cs; for (j = 0; j < NY; j++) { var y = Y0 + j * Cs; for (i = 0; i < NX; i++) { F[n++] = field(X0 + i * Cs, y, z); } } }
    var SX = 1, SY = NX, SZ = NX * NY;
    // 2. surface nets: satu titik per sel yang dilintasi permukaan
    var cellV = new Int32Array((NX - 1) * (NY - 1) * (NZ - 1)).fill(-1), P = [];
    var CO = [[0, 0, 0], [1, 0, 0], [0, 1, 0], [1, 1, 0], [0, 0, 1], [1, 0, 1], [0, 1, 1], [1, 1, 1]];
    var ED = [[0, 1], [2, 3], [4, 5], [6, 7], [0, 2], [1, 3], [4, 6], [5, 7], [0, 4], [1, 5], [2, 6], [3, 7]];
    var val = new Float32Array(8);
    function cid(a, b, c) { return a + (NX - 1) * (b + (NY - 1) * c); }
    for (kk = 0; kk < NZ - 1; kk++) {
      for (j = 0; j < NY - 1; j++) {
        for (i = 0; i < NX - 1; i++) {
          var base = i + NX * (j + NY * kk), neg = 0;
          for (var c = 0; c < 8; c++) { var o = CO[c]; val[c] = F[base + o[0] * SX + o[1] * SY + o[2] * SZ]; if (val[c] < 0) { neg++; } }
          if (neg === 0 || neg === 8) { continue; }
          var ax = 0, ay = 0, az = 0, cnt = 0;
          for (var e = 0; e < 12; e++) {
            var a0 = ED[e][0], a1 = ED[e][1], v0 = val[a0], v1 = val[a1];
            if ((v0 < 0) === (v1 < 0)) { continue; }
            var tt = v0 / (v0 - v1), p0 = CO[a0], p1 = CO[a1];
            ax += p0[0] + (p1[0] - p0[0]) * tt; ay += p0[1] + (p1[1] - p0[1]) * tt; az += p0[2] + (p1[2] - p0[2]) * tt; cnt++;
          }
          cellV[cid(i, j, kk)] = P.length / 3;
          P.push(X0 + (i + ax / cnt) * Cs, Y0 + (j + ay / cnt) * Cs, Z0 + (kk + az / cnt) * Cs);
        }
      }
    }
    // 3. segi empat untuk setiap rusuk grid yang dilintasi permukaan
    var IDX = [];
    function quad(a, b, cc, d, flip) {
      if (a < 0 || b < 0 || cc < 0 || d < 0) { return; }
      if (flip) { IDX.push(a, d, cc, a, cc, b); } else { IDX.push(a, b, cc, a, cc, d); }
    }
    for (kk = 1; kk < NZ - 1; kk++) {
      for (j = 1; j < NY - 1; j++) {
        for (i = 1; i < NX - 1; i++) {
          var f0 = F[i + NX * (j + NY * kk)], in0 = f0 < 0;
          if (i < NX - 1 && (F[i + 1 + NX * (j + NY * kk)] < 0) !== in0) {
            quad(cellV[cid(i, j - 1, kk - 1)], cellV[cid(i, j, kk - 1)], cellV[cid(i, j, kk)], cellV[cid(i, j - 1, kk)], !in0);
          }
          if ((F[i + NX * (j + 1 + NY * kk)] < 0) !== in0) {
            quad(cellV[cid(i - 1, j, kk - 1)], cellV[cid(i - 1, j, kk)], cellV[cid(i, j, kk)], cellV[cid(i, j, kk - 1)], !in0);
          }
          if ((F[i + NX * (j + NY * (kk + 1))] < 0) !== in0) {
            quad(cellV[cid(i - 1, j - 1, kk)], cellV[cid(i, j - 1, kk)], cellV[cid(i, j, kk)], cellV[cid(i - 1, j, kk)], !in0);
          }
        }
      }
    }
    var NV = P.length / 3, pos = new Float32Array(P);
    // 4. penghalusan Taubin
    var deg = new Uint16Array(NV), m;
    for (m = 0; m < IDX.length; m++) { deg[IDX[m]] += 2; }
    var start = new Uint32Array(NV + 1);
    for (m = 0; m < NV; m++) { start[m + 1] = start[m] + deg[m]; }
    var nb = new Uint32Array(start[NV]), fillp = start.slice(0, NV);
    for (m = 0; m < IDX.length; m += 3) {
      var A = IDX[m], B = IDX[m + 1], D3 = IDX[m + 2];
      nb[fillp[A]++] = B; nb[fillp[A]++] = D3; nb[fillp[B]++] = A; nb[fillp[B]++] = D3; nb[fillp[D3]++] = A; nb[fillp[D3]++] = B;
    }
    var tmp = new Float32Array(pos.length);
    function pass(lam) {
      for (var q = 0; q < NV; q++) {
        var s0 = start[q], s1 = start[q + 1], cx = 0, cy = 0, cz = 0, cn = s1 - s0;
        if (!cn) { tmp[q * 3] = pos[q * 3]; tmp[q * 3 + 1] = pos[q * 3 + 1]; tmp[q * 3 + 2] = pos[q * 3 + 2]; continue; }
        for (var r = s0; r < s1; r++) { var w = nb[r] * 3; cx += pos[w]; cy += pos[w + 1]; cz += pos[w + 2]; }
        tmp[q * 3] = pos[q * 3] + lam * (cx / cn - pos[q * 3]);
        tmp[q * 3 + 1] = pos[q * 3 + 1] + lam * (cy / cn - pos[q * 3 + 1]);
        tmp[q * 3 + 2] = pos[q * 3 + 2] + lam * (cz / cn - pos[q * 3 + 2]);
      }
      pos.set(tmp);
    }
    for (m = 0; m < 8; m++) { pass(0.5); pass(-0.53); }
    var g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setIndex(NV > 65535 ? new THREE.BufferAttribute(new Uint32Array(IDX), 1) : new THREE.BufferAttribute(new Uint16Array(IDX), 1));
    g.computeVertexNormals();
    return g;
  }
  window.JP_buildBody = buildBodyGeometry;
})();
