/* Jelajah Pencernaan: adegan 3D, suara, narasi, dan tiga kegiatan */
(function () {
  'use strict';
  var TAU = Math.PI * 2;
  var reduce = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  function $(id) { return document.getElementById(id); }
  function V(x, y, z) { return new THREE.Vector3(x, y, z); }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function smooth(t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); }
  function rng(s) { return function () { s |= 0; s = s + 0x6D2B79F5 | 0; var t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function table(tb, s) {
    for (var i = 1; i < tb.length; i++) { if (s <= tb[i][0]) { var a = tb[i - 1], b = tb[i]; return lerp(a[1], b[1], smooth((s - a[0]) / (b[0] - a[0]))); } }
    return tb[tb.length - 1][1];
  }

  var canvas = $('gl'), renderer;
  try {
    if (!window.THREE) { throw new Error('three'); }
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
  } catch (err) { $('nogl').hidden = false; return; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  var ORGANS = JP_DATA.ORGANS, BY = JP_DATA.BY, CLUES = JP_DATA.CLUES, INTRO_POOL = JP_DATA.INTRO_POOL, DESC = JP_DATA.DESC, STAGES = JP_DATA.STAGES;
  /* ================= TEKSTUR ================= */
  function noiseData(size, seed) {
    var r = rng(seed), out = new Float32Array(size * size), amp = 1, tot = 0;
    for (var o = 0; o < 5; o++) {
      var g = 4 << o, lat = new Float32Array(g * g), i;
      for (i = 0; i < lat.length; i++) { lat[i] = r(); }
      for (var y = 0; y < size; y++) {
        var v = y / size * g, y0 = Math.floor(v), ty = smooth(v - y0), y1 = (y0 + 1) % g;
        for (var x = 0; x < size; x++) {
          var u = x / size * g, x0 = Math.floor(u), tx = smooth(u - x0), x1 = (x0 + 1) % g;
          var a = lat[y0 * g + x0], b = lat[y0 * g + x1], c = lat[y1 * g + x0], d = lat[y1 * g + x1];
          out[y * size + x] += amp * ((a + (b - a) * tx) * (1 - ty) + (c + (d - c) * tx) * ty);
        }
      }
      tot += amp; amp *= 0.55;
    }
    for (i = 0; i < out.length; i++) { out[i] /= tot; }
    return out;
  }
  function texFrom(data, size, fn, srgb) {
    var c = document.createElement('canvas'); c.width = c.height = size;
    var g = c.getContext('2d'), img = g.createImageData(size, size);
    for (var i = 0; i < data.length; i++) { var v = fn(data[i]); img.data[i * 4] = v; img.data[i * 4 + 1] = v; img.data[i * 4 + 2] = v; img.data[i * 4 + 3] = 255; }
    g.putImageData(img, 0, 0);
    var t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping;
    if (srgb) { t.encoding = THREE.sRGBEncoding; }
    try { t.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy()); } catch (e) { /* abaikan */ }
    return t;
  }
  var ND = noiseData(256, 7);
  var bumpTex = texFrom(ND, 256, function (v) { return clamp((v - 0.5) * 3 + 0.5, 0, 1) * 255; });
  var tintTex = texFrom(ND, 256, function (v) { return 205 + clamp((v - 0.5) * 2.6 + 0.5, 0, 1) * 50; }, true);
  function dotTex(inner, outer) {
    var c = document.createElement('canvas'); c.width = c.height = 64; var g = c.getContext('2d');
    var gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(inner, 'rgba(255,255,255,0.9)'); gr.addColorStop(outer, 'rgba(255,255,255,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(c);
  }
  var glowTex = dotTex(0.15, 1), sparkTex = dotTex(0.35, 0.75), cells = null;
  var cellTex = (function () {
    var c = document.createElement('canvas'); c.width = c.height = 64; var g = c.getContext('2d');
    var gr = g.createRadialGradient(28, 26, 2, 32, 32, 30);
    gr.addColorStop(0, 'rgba(255,255,255,0.9)'); gr.addColorStop(0.55, 'rgba(255,255,255,0.35)'); gr.addColorStop(0.86, 'rgba(255,255,255,0.75)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr; g.beginPath(); g.arc(32, 32, 30, 0, TAU); g.fill();
    g.fillStyle = 'rgba(255,255,255,0.8)'; g.beginPath(); g.arc(38, 36, 6, 0, TAU); g.fill();
    return new THREE.CanvasTexture(c);
  })();
  function shadowDisk(rad, op) {
    var c = document.createElement('canvas'); c.width = c.height = 128; var g = c.getContext('2d');
    var gr = g.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, 'rgba(110,220,230,' + op + ')'); gr.addColorStop(0.55, 'rgba(110,220,230,' + (op * 0.35) + ')'); gr.addColorStop(1, 'rgba(110,220,230,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
    var m = new THREE.Mesh(new THREE.PlaneGeometry(rad * 2, rad * 2), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false }));
    m.rotation.x = -Math.PI / 2; return m;
  }

  /* ================= GEOMETRI ================= */
  function vtube(pts, rFn, o) {
    o = o || {};
    var curve = new THREE.CatmullRomCurve3(pts, false, 'centripetal');
    var len = curve.getLength();
    var N = o.seg || Math.max(24, Math.round(len * 26)), R = o.rad || 20;
    var fr = curve.computeFrenetFrames(N, false);
    var cnt = (N + 1) * (R + 1), pos = new Float32Array(cnt * 3), uv = new Float32Array(cnt * 2), idx = [];
    var P = new THREE.Vector3(), vRep = Math.max(1, Math.round(TAU * rFn(0.5, len * 0.5) / 0.6));
    for (var i = 0; i <= N; i++) {
      var s = i / N, d0 = s * len, d1 = len - d0, r = rFn(s, d0), q;
      curve.getPointAt(s, P);
      if (o.capA && d0 < o.capA) { q = 1 - d0 / o.capA; r *= Math.sqrt(Math.max(0, 1 - q * q)); }
      if (o.capB && d1 < o.capB) { q = 1 - d1 / o.capB; r *= Math.sqrt(Math.max(0, 1 - q * q)); }
      var n = fr.normals[i], b = fr.binormals[i];
      for (var j = 0; j <= R; j++) {
        var a = j / R * TAU, c = -Math.cos(a), sn = Math.sin(a), rr = o.bump ? r * o.bump(s, a, d0) : r;
        var k = i * (R + 1) + j;
        pos[k * 3] = P.x + (c * n.x + sn * b.x) * rr;
        pos[k * 3 + 1] = P.y + (c * n.y + sn * b.y) * rr;
        pos[k * 3 + 2] = P.z + (c * n.z + sn * b.z) * rr;
        uv[k * 2] = d0 / 0.6; uv[k * 2 + 1] = j / R * vRep;
      }
    }
    for (i = 0; i < N; i++) {
      for (j = 0; j < R; j++) {
        var A = i * (R + 1) + j, B = (i + 1) * (R + 1) + j;
        idx.push(A, B, A + 1, B, B + 1, A + 1);
      }
    }
    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
    geo.setIndex(idx);
    geo.computeVertexNormals();
    var nm = geo.attributes.normal;
    for (i = 0; i <= N; i++) {
      var k0 = i * (R + 1), k1 = k0 + R;
      var nx = nm.getX(k0) + nm.getX(k1), ny = nm.getY(k0) + nm.getY(k1), nz = nm.getZ(k0) + nm.getZ(k1), l = Math.hypot(nx, ny, nz) || 1;
      nm.setXYZ(k0, nx / l, ny / l, nz / l); nm.setXYZ(k1, nx / l, ny / l, nz / l);
    }
    geo.userData.curve = curve;
    return geo;
  }
  function blobGeo(seg, rows, fn, uvScale) {
    var g = new THREE.SphereGeometry(1, seg, rows), p = g.attributes.position, v = new THREE.Vector3();
    for (var i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); fn(v); p.setXYZ(i, v.x, v.y, v.z); }
    var uv = g.attributes.uv;
    for (i = 0; i < uv.count; i++) { uv.setXY(i, uv.getX(i) * uvScale[0], uv.getY(i) * uvScale[1]); }
    g.computeVertexNormals();
    return g;
  }
  function organMat(col, o) {
    o = o || {};
    return new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(col).convertSRGBToLinear(), map: tintTex, bumpMap: bumpTex, bumpScale: o.bump == null ? 0.012 : o.bump,
      roughness: o.rough == null ? 0.42 : o.rough, metalness: 0, clearcoat: o.coat == null ? 0.55 : o.coat, clearcoatRoughness: 0.3,
      side: o.side || THREE.FrontSide, transparent: false, opacity: 1
    });
  }

  /* ================= SCENE ================= */
  var scene = new THREE.Scene();
  renderer.setClearColor(0x000000, 0);
  var camera = new THREE.PerspectiveCamera(45, 1, 0.05, 400);
  scene.add(camera);
  scene.add(new THREE.HemisphereLight(0xf2fffb, 0x6a5450, 0.85));
  var key = new THREE.DirectionalLight(0xffffff, 1.7); key.position.set(3, 4, 6); camera.add(key);
  var keyT = new THREE.Object3D(); keyT.position.set(0, 0, -10); camera.add(keyT); key.target = keyT;
  var rim = new THREE.DirectionalLight(0xbfefff, 0.8); rim.position.set(-4, 3, -6); scene.add(rim);
  var warm = new THREE.DirectionalLight(0xffc6a0, 0.45); warm.position.set(-6, -2, 3); scene.add(warm);

  // bintik latar lembut (sel melayang)
  (function () {
    var r = rng(5), n = 140, pos = new Float32Array(n * 3);
    for (var i = 0; i < n; i++) { var u = r() * 2 - 1, t = r() * TAU, s = Math.sqrt(1 - u * u), R = 60 + r() * 40; pos[i * 3] = R * s * Math.cos(t); pos[i * 3 + 1] = R * u; pos[i * 3 + 2] = R * s * Math.sin(t); }
    var g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    cells = new THREE.Points(g, new THREE.PointsMaterial({ color: 0x8fcfc2, size: 4.5, sizeAttenuation: true, map: cellTex, transparent: true, opacity: 0.12, depthWrite: false }));
    cells.visible = false; scene.add(cells);
  })();

  var world = new THREE.Group(); scene.add(world);
  var floor = shadowDisk(4.6, 0.35); floor.position.y = -12.55; world.add(floor);
  var pgrid = new THREE.PolarGridHelper(5.2, 12, 5, 72, 0x4fb8c4, 0x4fb8c4); pgrid.position.y = -12.54;
  pgrid.material.transparent = true; pgrid.material.opacity = 0.25; pgrid.material.depthWrite = false; world.add(pgrid);
  var pring = new THREE.Mesh(new THREE.RingGeometry(5.1, 5.25, 96), new THREE.MeshBasicMaterial({ color: 0x7fe3ee, transparent: true, opacity: 0.6, side: THREE.DoubleSide, depthWrite: false }));
  pring.rotation.x = -Math.PI / 2; pring.position.y = -12.53; world.add(pring);
  var introGroup = new THREE.Group(); scene.add(introGroup);
  var introFloor = shadowDisk(2.6, 0.3); introFloor.position.y = -2.3; introGroup.add(introFloor);

  /* ---------- Tubuh hologram ---------- */
  var shellUni = { uCol: { value: new THREE.Color(0x7fd3ea) }, uScan: { value: 0 }, uOp: { value: 1 } };
  var shellMat = new THREE.ShaderMaterial({
    uniforms: shellUni,
    vertexShader: 'varying vec3 vN; varying vec3 vV; varying float vY; void main(){ vec4 wp = modelMatrix * vec4(position,1.0); vY = wp.y; vec4 mv = viewMatrix * wp; vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }',
    fragmentShader: 'uniform vec3 uCol; uniform float uScan; uniform float uOp; varying vec3 vN; varying vec3 vV; varying float vY; void main(){ vec3 n = normalize(vN); if (!gl_FrontFacing) { n = -n; } vec3 v = normalize(vV); float f = 1.0 - clamp(dot(n, v), 0.0, 1.0); float rimv = pow(f, 2.2); float lit = clamp(dot(n, normalize(vec3(0.45, 0.75, 0.5))), 0.0, 1.0); float spec = pow(clamp(dot(reflect(-normalize(vec3(0.45, 0.75, 0.5)), n), v), 0.0, 1.0), 24.0); float scan = smoothstep(0.6, 0.0, abs(vY - uScan)); float a = (rimv * 0.6 + 0.045 + lit * 0.05 + spec * 0.18 + scan * 0.05) * uOp; vec3 col = mix(uCol, vec3(1.0), clamp(rimv * 0.35 + lit * 0.3 + spec + scan * 0.4, 0.0, 1.0)); gl_FragColor = vec4(col, a); }',
    transparent: true, depthWrite: false
  });
  var shell = new THREE.Group(); world.add(shell);
  /* ---------- Pembangun tubuh: medan jarak + surface nets, dijalankan di browser ---------- */
  var buildBodyGeometry = window.JP_buildBody;
  var bodyMesh = new THREE.Mesh(new THREE.BufferGeometry(), shellMat); bodyMesh.renderOrder = 5; shell.add(bodyMesh);
  function makeBody() { var g = buildBodyGeometry(); bodyMesh.geometry.dispose(); bodyMesh.geometry = g; }

  /* ---------- Tulang (sebagai patokan letak) ---------- */
  var bones = new THREE.Group(); world.add(bones);
  var boneMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.45, depthWrite: false });
  (function () {
    for (var i = 0; i < 10; i++) {
      var y = 5.05 - i * 0.36, rx = 1.0 + Math.sin(Math.min(1, i / 4) * Math.PI / 2) * 0.5 - (i > 6 ? (i - 6) * 0.05 : 0), rz = 0.62, reach = i < 7 ? 2.55 : 2.0 - (i - 7) * 0.35;
      [-1, 1].forEach(function (sx) {
        var pts = [];
        for (var k = 0; k <= 12; k++) { var a = 0.12 + (reach - 0.12) * k / 12; pts.push(V(sx * Math.sin(a) * rx, y - (1 - Math.cos(a)) * 0.28, -Math.cos(a) * rz - 0.05)); }
        bones.add(new THREE.Mesh(vtube(pts, function () { return 0.035; }, { rad: 6, seg: 40 }), boneMat));
      });
    }
    bones.add(new THREE.Mesh(vtube([V(0, 5.25, 0.6), V(0, 4.3, 0.66), V(0, 3.45, 0.64)], function () { return 0.07; }, { rad: 8 }), boneMat));
    for (var k = 0; k < 24; k++) {
      var yy = 6.55 - k * 0.33, vb = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.22, 14), boneMat);
      vb.position.set(0, yy, -0.68 + Math.sin(k / 23 * Math.PI) * -0.08); bones.add(vb);
    }
    [-1, 1].forEach(function (sx) {
      var pts = [];
      for (var t = 0; t <= 10; t++) { var a = -0.3 + t / 10 * 1.9; pts.push(V(sx * (0.25 + Math.sin(a) * 1.1), -0.6 - Math.cos(a) * 0.55 + t * 0.02, -0.55 + Math.sin(a) * 0.35)); }
      bones.add(new THREE.Mesh(vtube(pts, function () { return 0.05; }, { rad: 6 }), boneMat));
    });
    var pub = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.05, 6, 30, Math.PI * 1.1), boneMat);
    pub.rotation.set(Math.PI / 2, 0, Math.PI * -0.05); pub.position.set(0, -1.55, -0.05); pub.scale.set(1.25, 1.15, 1); bones.add(pub);
  })();

  /* ---------- Organ ---------- */
  var ORG = {}, pickables = [];
  function addOrgan(id, meshes) {
    var g = new THREE.Group(), mats = [];
    meshes.forEach(function (m) {
      g.add(m);
      m.traverse(function (o) {
        if (o.isMesh) { o.userData.id = id; pickables.push(o); if (mats.indexOf(o.material) < 0) { mats.push(o.material); } }
      });
    });
    world.add(g);
    var box = new THREE.Box3().setFromObject(g), c = new THREE.Vector3(), sz = new THREE.Vector3();
    box.getCenter(c); box.getSize(sz);
    ORG[id] = { group: g, mats: mats, center: c, size: Math.max(sz.x, sz.y, sz.z), op: 1, opGoal: 1, glow: 0, glowGoal: 0, data: BY[id] };
  }
  function M(geo, mat) { return new THREE.Mesh(geo, mat); }

  // Mulut: lidah, gigi, bibir, kelenjar ludah
  var lowerTeeth = new THREE.Group(), tongueMesh;
  (function () {
    var tongueMat = organMat('#df6476', { coat: 0.8, rough: 0.35 }), toothMat = organMat('#f5f0e2', { coat: 0.9, rough: 0.2, bump: 0.002 }), lipMat = organMat('#d8737a', { coat: 0.7 }), glandMat = organMat('#e9c27a', { bump: 0.02 });
    var tg = blobGeo(40, 28, function (v) { v.x *= 0.33; v.y *= 0.12; v.z *= 0.42; if (v.y < 0) { v.y *= 0.6; } v.y += -0.25 * v.z * v.z; }, [2, 2]);
    tongueMesh = M(tg, tongueMat); tongueMesh.position.set(0, 6.93, 0.36);
    var upper = new THREE.Group(), parts = [tongueMesh, upper, lowerTeeth];
    function arch(grp, y) {
      for (var k = 0; k < 14; k++) {
        var a = -1.55 + k / 13 * 3.1, molar = Math.abs(a) > 0.95, t = M(new THREE.SphereGeometry(1, 14, 10), toothMat);
        t.scale.set(molar ? 0.07 : 0.05, 0.075, molar ? 0.08 : 0.04);
        t.position.set(Math.sin(a) * 0.38, y, 0.8 - (1 - Math.cos(a)) * 0.4); t.rotation.y = a; grp.add(t);
      }
    }
    arch(upper, 7.12); arch(lowerTeeth, 6.92);
    var gumMat = organMat('#e98896', { coat: 0.8, rough: 0.3 });
    [[upper, 7.175], [lowerTeeth, 6.865]].forEach(function (G) {
      var gp = [];
      for (var q = 0; q <= 16; q++) { var a = -1.6 + q / 16 * 3.2; gp.push(V(Math.sin(a) * 0.37, G[1], 0.79 - (1 - Math.cos(a)) * 0.4)); }
      G[0].add(M(vtube(gp, function () { return 0.045; }, { rad: 10, seg: 60, capA: 0.04, capB: 0.04 }), gumMat));
    });
    [[7.075, 0.034], [6.955, 0.042]].forEach(function (L) {
      var lp = [];
      for (var q = 0; q <= 10; q++) { var x = -0.3 + 0.6 * q / 10; lp.push(V(x, L[0] + (L[0] > 7 ? 0.012 : -0.012) * Math.cos(x * 5.2), 0.93 - x * x * 1.1)); }
      parts.push(M(vtube(lp, function (s) { return 0.014 + L[1] * Math.sin(Math.PI * s); }, { rad: 12, seg: 40 }), lipMat));
    });
    [-1, 1].forEach(function (sx) {
      var gl = M(blobGeo(20, 14, function (v) { v.x *= 0.1; v.y *= 0.17; v.z *= 0.13; }, [1, 1]), glandMat); gl.position.set(sx * 0.66, 7.28, -0.12); parts.push(gl);
      var sm = M(blobGeo(16, 12, function (v) { v.x *= 0.12; v.y *= 0.09; v.z *= 0.13; }, [1, 1]), glandMat); sm.position.set(sx * 0.3, 6.8, 0.32); parts.push(sm);
    });
    addOrgan('mulut', parts);
  })();

  var ESO = [V(0, 6.95, 0.2), V(0, 6.72, -0.12), V(0, 6.3, -0.3), V(0, 5.4, -0.36), V(0.03, 4.5, -0.33), V(0.1, 3.7, -0.23), V(0.3, 3.15, -0.08), V(0.58, 2.95, 0.06)];
  addOrgan('kerongkongan', [M(vtube(ESO, function (s, d) { return 0.12 * (1 + 0.06 * Math.sin(d * 9)); }, { rad: 16 }), organMat('#e9a090'))]);

  var STOM = [V(0.72, 3.32, 0.14), V(1.05, 3.08, 0.24), V(1.2, 2.6, 0.32), V(1.12, 2.05, 0.38), V(0.85, 1.7, 0.44), V(0.42, 1.62, 0.47), V(0.08, 1.76, 0.42), V(-0.15, 1.9, 0.35)];
  addOrgan('lambung', [M(vtube(STOM, function (s, d) {
    return table([[0, 0.48], [0.16, 0.6], [0.36, 0.6], [0.56, 0.5], [0.76, 0.35], [0.9, 0.22], [1, 0.16]], s) * (1 + 0.025 * Math.sin(d * 14));
  }, { rad: 32, capA: 0.42, bump: function (s, a) { return 1 + 0.035 * Math.pow(Math.max(0, Math.cos(a * 2 + s * 6)), 4); } }), organMat('#e6857a', { bump: 0.02 }))]);

  addOrgan('hati', [(function () {
    var g = blobGeo(64, 48, function (v) {
      var t = (v.x + 1) / 2, top = 1 - 0.64 * Math.pow(t, 1.1);
      if (v.y > 0) { v.y *= 0.98 * top; } else { v.y *= 0.4 * (1 - 0.4 * t); }
      v.y -= 0.16 * v.z * (1 - 0.6 * t);
      v.z *= 0.8 * (0.48 + 0.52 * top);
      v.x *= 1.3;
      v.y += 0.05 * Math.sin(v.x * 2.4) - 0.06 * Math.exp(-Math.pow(v.x - 0.25, 2) / 0.02) * (v.y > 0 ? 1 : 0);
    }, [3, 2]);
    var m = M(g, organMat('#9a3a2c', { coat: 0.75, rough: 0.32, bump: 0.01 }));
    m.position.set(-0.32, 2.88, 0.18); m.rotation.set(0.05, 0.12, 0.13);
    return m;
  })()]);

  addOrgan('empedu', [(function () {
    var pts = [[0, 0.06], [0.05, 0.02], [0.09, -0.08], [0.145, -0.28], [0.135, -0.45], [0.08, -0.56], [0, -0.59]].map(function (p) { return new THREE.Vector2(p[0], p[1]); });
    var m = M(new THREE.LatheGeometry(pts, 28), organMat('#4f9a46', { coat: 0.9, rough: 0.25, side: THREE.DoubleSide, bump: 0.004 }));
    m.position.set(-0.68, 2.42, 0.5); m.rotation.set(0.85, 0, 0.25);
    return m;
  })()]);

  var DUO = [V(-0.15, 1.9, 0.35), V(-0.46, 1.88, 0.28), V(-0.73, 1.6, 0.18), V(-0.79, 1.15, 0.1), V(-0.6, 0.82, 0.05), V(-0.25, 0.72, 0.0), V(0.12, 0.82, -0.02), V(0.36, 1.0, 0.0)];
  var PAN = [V(-0.55, 1.22, -0.05), V(-0.2, 1.36, -0.32), V(0.3, 1.54, -0.45), V(0.85, 1.74, -0.45), V(1.38, 2.0, -0.34)];
  addOrgan('pankreas', [M(vtube(PAN, function (s) { return lerp(0.23, 0.12, s); }, { rad: 22, capA: 0.2, capB: 0.12, bump: function (s, a, d) { return 1 + 0.1 * Math.sin(d * 34 + a * 3) * Math.sin(a * 5 + d * 19); } }), organMat('#e7b86c', { bump: 0.03, coat: 0.3 }))]);

  var SI = [V(0.36, 1.0, 0.0), V(0.72, 0.86, 0.14)];
  (function () {
    for (var r = 0; r < 7; r++) {
      var y = 0.72 - r * 0.2, dir = r % 2 === 0 ? -1 : 1;
      for (var k = 0; k <= 14; k++) {
        var u = k / 14, x = dir < 0 ? 0.8 - 1.65 * u : -0.85 + 1.65 * u;
        SI.push(V(x, y + 0.07 * Math.sin(u * TAU * 2.5 + r), 0.24 + 0.27 * Math.sin(u * TAU * 2 + r * 1.3)));
      }
    }
    SI.push(V(-0.98, -0.5, 0.24));
  })();
  (function () {
    var mat = organMat('#f2aaa2', { coat: 0.75, rough: 0.3 });
    var duo = M(vtube(DUO, function () { return 0.15; }, { rad: 18 }), mat);
    var si = M(vtube(SI, function (s, d) { return 0.1 * (1 + 0.05 * Math.sin(d * 11)); }, { rad: 12, seg: 1400 }), mat);
    addOrgan('ususHalus', [duo, si]);
  })();

  var COLON = [V(-1.0, -0.78, 0.28), V(-1.04, -0.5, 0.3), V(-1.12, 0.0, 0.3), V(-1.15, 0.7, 0.3), V(-1.1, 1.3, 0.35), V(-0.9, 1.5, 0.5), V(-0.45, 1.15, 0.72), V(0.05, 1.0, 0.75), V(0.55, 1.12, 0.68), V(1.05, 1.55, 0.46), V(1.28, 1.6, 0.25), V(1.33, 1.0, 0.2), V(1.3, 0.2, 0.2), V(1.2, -0.45, 0.25), V(0.9, -0.82, 0.4), V(0.5, -0.74, 0.44), V(0.25, -0.86, 0.26)];
  (function () {
    var mat = organMat('#cf9474', { bump: 0.02 });
    var colon = M(vtube(COLON, function (s, d) {
      return lerp(0.26, 0.17, s) * (0.84 + 0.16 * Math.pow(Math.abs(Math.sin(d * Math.PI / 0.3)), 0.45));
    }, { rad: 26, capA: 0.24, bump: function (s, a) { return 1 - 0.07 * Math.pow(Math.max(0, Math.cos(a * 3 + 0.5)), 10); } }), mat);
    var appx = M(vtube([V(-1.0, -0.74, 0.22), V(-0.92, -0.97, 0.3), V(-0.8, -1.08, 0.38), V(-0.7, -1.1, 0.43)], function () { return 0.045; }, { rad: 10, capB: 0.05 }), mat);
    addOrgan('ususBesar', [colon, appx]);
  })();

  var RECT = [V(0.25, -0.86, 0.26), V(0.1, -1.06, 0.08), V(0.02, -1.36, -0.05), V(0, -1.62, -0.02), V(0, -1.86, 0.05), V(0, -2.02, 0.1)];
  (function () {
    var mat = organMat('#bd6a62', { bump: 0.02 });
    var rect = M(vtube(RECT, function (s) { return table([[0, 0.17], [0.55, 0.2], [0.72, 0.14], [1, 0.08]], s); }, { rad: 22 }), mat);
    var ring = M(new THREE.TorusGeometry(0.1, 0.035, 10, 28), organMat('#a8564f'));
    ring.rotation.x = Math.PI / 2; ring.position.set(0, -1.96, 0.08);
    addOrgan('anus', [rect, ring]);
  })();

  /* ---------- Makanan (perjalanan) ---------- */
  var bolus = new THREE.Group(); world.add(bolus); bolus.visible = false;
  var bolusMat = new THREE.MeshStandardMaterial({ color: 0xf2ead6, roughness: 0.6, emissive: 0x332a18, depthTest: false });
  var bolusBall = new THREE.Mesh(new THREE.SphereGeometry(1, 28, 20), bolusMat); bolusBall.renderOrder = 20; bolus.add(bolusBall);
  var bolusGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xffe9a8, transparent: true, opacity: 0.6, depthTest: false, depthWrite: false }));
  bolusGlow.renderOrder = 19; bolus.add(bolusGlow);
  var ringTex = (function () {
    var c = document.createElement('canvas'); c.width = c.height = 128; var g = c.getContext('2d');
    g.lineWidth = 12; g.strokeStyle = 'rgba(255,255,255,0.95)'; g.beginPath(); g.arc(64, 64, 50, 0, TAU); g.stroke();
    g.lineWidth = 6; g.strokeStyle = '#ff6a4d'; g.beginPath(); g.arc(64, 64, 50, 0, TAU); g.stroke();
    return new THREE.CanvasTexture(c);
  })();
  var bolusRing = new THREE.Sprite(new THREE.SpriteMaterial({ map: ringTex, transparent: true, depthTest: false, depthWrite: false }));
  bolusRing.renderOrder = 23; bolus.add(bolusRing);
  var grainMat = new THREE.MeshStandardMaterial({ color: 0xfaf6ec, roughness: 0.5, emissive: 0x2a2620, transparent: true, depthTest: false });
  var grains = [], gr = rng(9);
  for (var gi = 0; gi < 16; gi++) {
    var gm = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 8), grainMat); gm.renderOrder = 21;
    var home = V((gr() - 0.5) * 0.34, (gr() - 0.5) * 0.18, (gr() - 0.5) * 0.3);
    gm.scale.set(0.045, 0.02, 0.02); gm.rotation.set(gr() * 3, gr() * 3, gr() * 3);
    grains.push({ m: gm, home: home }); bolus.add(gm);
  }

  // partikel (gelembung asam, sari makanan, air)
  var parts = [], partGroup = new THREE.Group(); world.add(partGroup);
  for (var pi = 0; pi < 90; pi++) {
    var sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: sparkTex, color: 0xffffff, transparent: true, opacity: 0, depthTest: false, depthWrite: false }));
    sp.renderOrder = 22; sp.visible = false; partGroup.add(sp);
    parts.push({ s: sp, life: 0, max: 1, v: new THREE.Vector3() });
  }
  var pr = rng(77);
  function spawn(at, col, speed, size, life, drift) {
    for (var i = 0; i < parts.length; i++) {
      var p = parts[i];
      if (p.life > 0) { continue; }
      var d = V(pr() - 0.5, pr() - 0.5, pr() - 0.5).normalize();
      p.v.copy(d).multiplyScalar(speed); if (drift) { p.v.y += drift; }
      p.s.position.copy(at).addScaledVector(d, 0.05);
      p.s.material.color.set(col); p.s.scale.setScalar(size); p.life = p.max = life; p.s.visible = true;
      return;
    }
  }

  /* ---------- Jalur perjalanan ---------- */
  function polyline(pts) {
    var c = new THREE.CatmullRomCurve3(pts, false, 'centripetal'), sp = c.getSpacedPoints(120), cum = [0];
    for (var i = 1; i < sp.length; i++) { cum.push(cum[i - 1] + sp[i].distanceTo(sp[i - 1])); }
    return { p: sp, cum: cum, len: cum[cum.length - 1] };
  }
  function along(pl, u, out) {
    var d = clamp(u, 0, 1) * pl.len, lo = 0, hi = pl.cum.length - 1;
    while (hi - lo > 1) { var mid = (lo + hi) >> 1; if (pl.cum[mid] < d) { lo = mid; } else { hi = mid; } }
    var seg = pl.cum[hi] - pl.cum[lo] || 1;
    return out.copy(pl.p[lo]).lerp(pl.p[hi], (d - pl.cum[lo]) / seg);
  }
  var PATHS = [
    polyline([V(0, 7.02, 1.15), V(0, 7.0, 0.75), V(0, 6.98, 0.45), V(0, 6.95, 0.2)]),
    polyline(ESO),
    polyline([ESO[ESO.length - 1], V(0.95, 2.85, 0.22)].concat(STOM.slice(2))),
    polyline(DUO.concat(SI.slice(1))),
    polyline(COLON.slice(1)),
    polyline(RECT.concat([V(0, -2.5, 0.16)]))
  ];
  var BOLUS_R = [0.15, 0.12, 0.2, 0.11, 0.17, 0.15];
  var BOLUS_C = ['#f2ead6', '#efe3c8', '#e6cc7c', '#d9b75e', '#8a5a34', '#7a4e2e'];

  /* ================= LABEL ================= */
  var labelsEl = $('labels');
  ORGANS.forEach(function (o) {
    var el = document.createElement('div'); el.className = 'lbl'; el.textContent = o.n;
    labelsEl.appendChild(el); ORG[o.id].el = el; ORG[o.id].anchor = V(o.anchor[0], o.anchor[1], o.anchor[2]);
  });

  /* ================= KAMERA ================= */
  var mode = 'intro', sel = -1, labelsOn = true;
  var theta = 0.35, phi = 1.4, dist = 14, gTheta = 0.35, gPhi = 1.4, gDist = 14;
  var target = new THREE.Vector3(0, 2.4, 0), desired = new THREE.Vector3(0, 2.4, 0);
  var W = 1, H = 1, shiftY = 0, shiftX = 0, TAN = Math.tan(THREE.MathUtils.degToRad(22.5));
  function aspect() { return W / H; }
  function narrow() { return W <= 720; }
  function overviewDist() { return Math.max(16.5, 3.2 / (TAN * Math.max(aspect(), 0.3))) * (narrow() ? 1.05 : 1); }
  function nearest(cur, goal) { return goal + TAU * Math.round((cur - goal) / TAU); }
  function minDist() { return mode === 'intro' ? 3 : 1.6; }
  function maxDist() { return mode === 'intro' ? 14 : 42; }
  function resize() {
    W = canvas.clientWidth || window.innerWidth; H = canvas.clientHeight || window.innerHeight;
    renderer.setSize(W, H, false); camera.aspect = W / H; camera.updateProjectionMatrix();
    if (mode === 'explore' && sel < 0) { gDist = overviewDist(); }
  }

  /* ================= SUARA ================= */
  var AU = { ctx: null, on: true, started: false, timer: 0, next: 0, step: 0, master: null, music: null, sfx: null, echo: null, noise: null, idx: 3 };
  try { if (localStorage.getItem('cerna-suara') === 'off') { AU.on = false; } } catch (e) { /* abaikan */ }
  var STEP = 60 / 100 / 2;
  var CHORDS = [
    { root: 48, arp: [72, 74, 76, 79, 81, 84] },
    { root: 45, arp: [69, 72, 74, 76, 79, 81] },
    { root: 41, arp: [69, 72, 74, 77, 79, 81] },
    { root: 43, arp: [71, 74, 76, 79, 81, 83] }
  ];
  var BASS = [1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0];
  var MEL = [1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 1, 0];
  function mtof(m) { return 440 * Math.pow(2, (m - 69) / 12); }
  function audioInit() {
    if (AU.ctx) { return true; }
    var AC = window.AudioContext || window.webkitAudioContext; if (!AC) { return false; }
    try { AU.ctx = new AC(); } catch (e) { return false; }
    var c = AU.ctx, comp = c.createDynamicsCompressor(); comp.connect(c.destination);
    AU.master = c.createGain(); AU.master.gain.value = 0.0001; AU.master.connect(comp);
    AU.music = c.createGain(); AU.music.gain.value = 0.3; AU.music.connect(AU.master);
    AU.sfx = c.createGain(); AU.sfx.gain.value = 0.6; AU.sfx.connect(AU.master);
    var dl = c.createDelay(2), fb = c.createGain(), lp = c.createBiquadFilter(), wet = c.createGain();
    dl.delayTime.value = STEP * 3; fb.gain.value = 0.35; lp.type = 'lowpass'; lp.frequency.value = 2000; wet.gain.value = 0.5;
    dl.connect(lp); lp.connect(fb); fb.connect(dl); lp.connect(wet); wet.connect(AU.music); AU.echo = dl;
    var buf = c.createBuffer(1, c.sampleRate, c.sampleRate), d = buf.getChannelData(0);
    for (var i = 0; i < d.length; i++) { d[i] = Math.random() * 2 - 1; }
    AU.noise = buf;
    return true;
  }
  function wake() {
    if (!AU.on || !audioInit()) { return false; }
    var c = AU.ctx; if (c.state === 'suspended') { c.resume(); }
    AU.master.gain.cancelScheduledValues(c.currentTime); AU.master.gain.setTargetAtTime(0.9, c.currentTime, 0.25);
    return true;
  }
  function tone(m, t, vol, dur, type, dest, echo) {
    var c = AU.ctx, os = c.createOscillator(), g = c.createGain();
    os.type = type || 'sine'; os.frequency.value = mtof(m);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    os.connect(g); g.connect(dest || AU.sfx); if (echo) { g.connect(AU.echo); }
    os.start(t); os.stop(t + dur + 0.05);
  }
  function marimba(m, t, vol, dest, echo) {
    var c = AU.ctx, g = c.createGain();
    [[1, 1, 0.45], [4, 0.22, 0.07], [10, 0.06, 0.03]].forEach(function (o) {
      var os = c.createOscillator(), gg = c.createGain(); os.type = 'sine'; os.frequency.value = mtof(m) * o[0];
      gg.gain.setValueAtTime(0.0001, t); gg.gain.exponentialRampToValueAtTime(o[1], t + 0.005); gg.gain.exponentialRampToValueAtTime(0.0001, t + o[2]);
      os.connect(gg); gg.connect(g); os.start(t); os.stop(t + o[2] + 0.05);
    });
    g.gain.value = vol; g.connect(dest || AU.music); if (echo) { g.connect(AU.echo); }
  }
  function shaker(t, vol) {
    var c = AU.ctx, src = c.createBufferSource(), hp = c.createBiquadFilter(), g = c.createGain();
    src.buffer = AU.noise; hp.type = 'highpass'; hp.frequency.value = 6000;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
    src.connect(hp); hp.connect(g); g.connect(AU.music); src.start(t, Math.random() * 0.5); src.stop(t + 0.06);
  }
  function schedule(step, t) {
    var pos = step % 16, ch = CHORDS[Math.floor(step / 16) % CHORDS.length];
    if (BASS[pos]) { marimba(ch.root + (pos === 6 || pos === 14 ? 7 : 0), t, 0.55); }
    shaker(t, pos % 4 === 2 ? 0.05 : 0.02);
    if (MEL[pos] && Math.random() < 0.6) {
      AU.idx = clamp(AU.idx + [-2, -1, 1, 2][Math.floor(Math.random() * 4)], 0, ch.arp.length - 1);
      marimba(ch.arp[AU.idx], t, 0.28, AU.music, Math.random() < 0.3);
    }
  }
  function tick() { var c = AU.ctx; while (AU.next < c.currentTime + 0.4) { schedule(AU.step, AU.next); AU.next += STEP; AU.step++; } }
  function musicStart() { if (!wake()) { return; } if (!AU.timer) { AU.next = AU.ctx.currentTime + 0.15; AU.timer = setInterval(tick, 120); } }
  function musicStop() {
    if (!AU.ctx) { return; }
    AU.master.gain.cancelScheduledValues(AU.ctx.currentTime); AU.master.gain.setTargetAtTime(0.0001, AU.ctx.currentTime, 0.2);
    if (AU.timer) { clearInterval(AU.timer); AU.timer = 0; }
  }
  function sfx(kind) {
    if (!wake()) { return; }
    var c = AU.ctx, t = c.currentTime + 0.01;
    if (kind === 'pick') { tone(79, t, 0.25, 0.8); tone(86, t + 0.08, 0.15, 0.8); }
    else if (kind === 'ok') { [72, 76, 79, 84].forEach(function (m, k) { tone(m, t + k * 0.08, 0.25, 0.9); }); }
    else if (kind === 'no') { tone(57, t, 0.25, 0.35, 'triangle'); tone(52, t + 0.16, 0.25, 0.5, 'triangle'); }
    else if (kind === 'close') { tone(76, t, 0.2, 0.6); tone(69, t + 0.09, 0.18, 0.6); }
    else if (kind === 'gulp') {
      var os = c.createOscillator(), g = c.createGain(); os.type = 'sine';
      os.frequency.setValueAtTime(320, t); os.frequency.exponentialRampToValueAtTime(80, t + 0.28);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.35, t + 0.03); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.32);
      os.connect(g); g.connect(AU.sfx); os.start(t); os.stop(t + 0.35);
    } else if (kind === 'bubble') {
      var o2 = c.createOscillator(), g2 = c.createGain(), f0 = 500 + Math.random() * 500; o2.type = 'sine';
      o2.frequency.setValueAtTime(f0, t); o2.frequency.exponentialRampToValueAtTime(f0 * 1.9, t + 0.08);
      g2.gain.setValueAtTime(0.0001, t); g2.gain.exponentialRampToValueAtTime(0.08, t + 0.01); g2.gain.exponentialRampToValueAtTime(0.0001, t + 0.1);
      o2.connect(g2); g2.connect(AU.sfx); o2.start(t); o2.stop(t + 0.12);
    } else {
      var src = c.createBufferSource(), bp = c.createBiquadFilter(), g3 = c.createGain();
      src.buffer = AU.noise; bp.type = 'bandpass'; bp.Q.value = 1.2;
      bp.frequency.setValueAtTime(260, t); bp.frequency.exponentialRampToValueAtTime(2400, t + 0.5);
      g3.gain.setValueAtTime(0.0001, t); g3.gain.linearRampToValueAtTime(0.2, t + 0.16); g3.gain.linearRampToValueAtTime(0.0001, t + 0.55);
      src.connect(bp); bp.connect(g3); g3.connect(AU.sfx); src.start(t); src.stop(t + 0.6);
    }
  }
  function firstGesture() { if (AU.started) { return; } AU.started = true; if (AU.on) { musicStart(); } }
  document.addEventListener('pointerdown', firstGesture, true);
  document.addEventListener('keydown', firstGesture, true);
  document.addEventListener('visibilitychange', function () {
    if (!AU.ctx) { return; }
    if (document.hidden) { musicStop(); AU.ctx.suspend(); } else if (AU.on && AU.started) { musicStart(); }
  });
  var sndBtn = $('sndBtn'); sndBtn.setAttribute('aria-pressed', AU.on ? 'true' : 'false');
  sndBtn.addEventListener('click', function () {
    AU.on = !AU.on; AU.started = true;
    try { localStorage.setItem('cerna-suara', AU.on ? 'on' : 'off'); } catch (e) { /* abaikan */ }
    sndBtn.setAttribute('aria-pressed', AU.on ? 'true' : 'false');
    if (AU.on) { musicStart(); } else { musicStop(); stopSpeak(); }
  });

  /* ================= NARASI ================= */
  var NARASI = JP_DATA.NARASI, STAGE_NARR = JP_DATA.STAGE_NARR, FINISH_NARR = JP_DATA.FINISH_NARR;

  var TEST_NARR = 'Halo teman-teman! Ayo kita jelajahi sistem pencernaan manusia bersama.';
  /* Rekaman narasi (MP3) dipakai bila tersedia; suara peramban menjadi cadangan. */
  var REC = '__rekaman__';
  var CLIPS = {};
  Object.keys(NARASI).forEach(function (k) { CLIPS[NARASI[k]] = 'organ-' + k; });
  STAGE_NARR.forEach(function (t, i) { CLIPS[t] = 'tahap-' + (i + 1); });
  CLIPS[FINISH_NARR] = 'selesai'; CLIPS[TEST_NARR] = 'coba';
  var AUD = { ok: false, label: 'Gadis', files: {} };
  var VOICE = { list: [], v: null, pref: '', auto: true, rate: 1, seq: 0, btn: null };
  try {
    VOICE.pref = localStorage.getItem('cerna-voice') || '';
    if (localStorage.getItem('cerna-auto') === 'off') { VOICE.auto = false; }
    var rt0 = parseFloat(localStorage.getItem('cerna-rate')); if (rt0) { VOICE.rate = rt0; }
  } catch (e) { /* abaikan */ }
  function store(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* abaikan */ } }
  function useRec() { return AUD.ok && (VOICE.pref === '' || VOICE.pref === REC || !VOICE.list.some(function (v) { return v.name === VOICE.pref; })); }
  try {
    fetch('../audio/manifest.json', { cache: 'no-cache' }).then(function (r) { return r.ok ? r.json() : null; }).then(function (m) {
      if (m && m.files) { AUD.ok = true; AUD.files = m.files; AUD.label = m.label || AUD.label; renderVoicePanel(); }
    }).catch(function () { /* tanpa rekaman */ });
  } catch (e) { /* tanpa rekaman */ }
  function voiceScore(v) {
    if (!v) { return 0; }
    var n = v.name, sc = 0;
    if (/natural/i.test(n)) { sc += 60; }
    if (/online|neural|premium|enhanced/i.test(n)) { sc += 30; }
    if (/google/i.test(n)) { sc += 22; }
    if (/gadis|ardi|damayanti/i.test(n)) { sc += 6; }
    if (!v.localService) { sc += 4; }
    return sc;
  }
  function prettyName(v) { return v.name.replace(/^Microsoft\s+/i, '').replace(/\s*-\s*Indonesian.*$/i, '').replace(/\s*\(Indonesia\)/i, '').trim(); }
  function renderVoicePanel() {
    var selEl = $('vSel'); selEl.textContent = '';
    if (AUD.ok) {
      var r0 = document.createElement('option'); r0.value = REC;
      r0.textContent = 'Rekaman ' + AUD.label + ' · paling alami';
      if (useRec()) { r0.selected = true; }
      selEl.appendChild(r0);
    }
    VOICE.list.forEach(function (v) {
      var o = document.createElement('option'); o.value = v.name;
      o.textContent = prettyName(v) + (voiceScore(v) >= 50 ? ' · paling alami' : '');
      if (v === VOICE.v && !useRec()) { o.selected = true; }
      selEl.appendChild(o);
    });
    var has = VOICE.list.length > 0 || AUD.ok;
    $('vHas').hidden = !has; $('vNone').hidden = has;
    $('vNatural').hidden = !has || useRec() || voiceScore(VOICE.v) >= 50;
    $('vAuto').checked = VOICE.auto;
    $('vRate').value = String(VOICE.rate);
  }
  function loadVoices() {
    var vs = [];
    try { vs = window.speechSynthesis ? speechSynthesis.getVoices() : []; } catch (e) { vs = []; }
    VOICE.list = vs.filter(function (v) { return /^(id|in)([-_]|$)/i.test(v.lang) || /indonesia/i.test(v.name); })
      .sort(function (a, b) { return voiceScore(b) - voiceScore(a); });
    VOICE.v = VOICE.list.filter(function (v) { return v.name === VOICE.pref; })[0] || VOICE.list[0] || null;
    renderVoicePanel();
  }
  if (window.speechSynthesis) { loadVoices(); try { speechSynthesis.addEventListener('voiceschanged', loadVoices); } catch (e) { /* abaikan */ } setTimeout(loadVoices, 800); }
  else { renderVoicePanel(); }
  function setSpeakBtn(b, on) { if (b) { b.textContent = on ? 'Berhenti' : 'Dengarkan'; b.setAttribute('aria-pressed', on ? 'true' : 'false'); } }
  function duck(on) { if (AU.ctx && AU.music) { AU.music.gain.setTargetAtTime(on ? 0.06 : 0.3, AU.ctx.currentTime, on ? 0.2 : 0.6); } }
  function finishCur(cur) {
    if (!cur || cur.finished) { return; }
    cur.finished = true;
    if (VOICE.cur === cur) { VOICE.cur = null; setSpeakBtn(VOICE.btn, false); VOICE.btn = null; duck(false); }
    if (cur.onDone) { cur.onDone(); }
  }
  function stopSpeak() {
    VOICE.seq++; VOICE.paused = false;
    try { if (window.speechSynthesis) { speechSynthesis.cancel(); } } catch (e) { /* abaikan */ }
    var cur = VOICE.cur; VOICE.cur = null;
    if (cur && cur.el) { try { cur.el.pause(); } catch (e) { /* abaikan */ } clearTimeout(cur.guard); }
    setSpeakBtn(VOICE.btn, false); VOICE.btn = null; duck(false);
    if (cur) { finishCur(cur); }
  }
  function canDevice() { return !!(window.speechSynthesis && VOICE.v); }
  function canSpeak() { return useRec() || canDevice(); }
  function armGuard(cur) {
    clearTimeout(cur.guard);
    var left = cur.el && isFinite(cur.el.duration) ? (cur.el.duration - cur.el.currentTime) / VOICE.rate : estSeconds(cur.text) * 1.4;
    cur.guard = setTimeout(function () { if (VOICE.cur === cur && !VOICE.paused) { finishCur(cur); } }, (left + 6) * 1000);
  }
  function playClip(cur, file) {
    var a = new Audio('../audio/' + file); cur.el = a;
    try { a.playbackRate = VOICE.rate; a.preservesPitch = true; } catch (e) { /* abaikan */ }
    a.onended = function () { clearTimeout(cur.guard); if (!cur.finished) { setTimeout(function () { finishCur(cur); }, 200); } };
    a.onloadedmetadata = function () { if (VOICE.cur === cur && !VOICE.paused) { armGuard(cur); } };
    a.onerror = function () {
      clearTimeout(cur.guard); cur.el = null;
      if (cur.finished || VOICE.cur !== cur) { return; }
      if (canDevice()) { cur.parts = cur.text.match(/[^.!?]+[.!?]*/g) || [cur.text]; cur.i = 0; runCur(cur); } else { finishCur(cur); }
    };
    armGuard(cur);
    var pr = a.play();
    if (pr && pr.catch) { pr.catch(function () { if (VOICE.cur === cur && !VOICE.paused && a.paused) { a.onerror(); } }); }
  }
  function runCur(cur) {
    var my = ++VOICE.seq;
    function next() {
      if (my !== VOICE.seq || cur.finished) { return; }
      if (cur.i >= cur.parts.length) { finishCur(cur); return; }
      var txt = cur.parts[cur.i].trim(), done = false;
      var u = new SpeechSynthesisUtterance(txt);
      try { u.voice = VOICE.v; } catch (e) { /* abaikan */ }
      u.lang = VOICE.v.lang; u.rate = VOICE.rate; u.pitch = 1;
      function go(delay) {
        if (done) { return; } done = true; clearTimeout(guard);
        if (my !== VOICE.seq) { return; }
        cur.i++; setTimeout(next, delay);
      }
      u.onend = function () { go(220); };
      u.onerror = function () { go(60); };
      var guard = setTimeout(function () { go(0); }, (txt.length * 110 + 4000) / VOICE.rate);
      speechSynthesis.speak(u);
    }
    next();
  }
  function speak(text, btn, onDone) {
    var file = useRec() ? AUD.files[CLIPS[text]] : null;
    if (!file && !canDevice()) { if (!onDone) { openVoicePanel(true); } if (onDone) { onDone(); } return; }
    stopSpeak();
    var cur = { text: text, parts: text.match(/[^.!?]+[.!?]*/g) || [text], i: 0, onDone: onDone || null, finished: false };
    VOICE.cur = cur; VOICE.btn = btn || null; setSpeakBtn(VOICE.btn, true); duck(true);
    if (file) { playClip(cur, file); } else { runCur(cur); }
  }
  function pauseSpeak() {
    if (!VOICE.cur || VOICE.paused) { return; }
    VOICE.paused = true; VOICE.seq++;
    var cur = VOICE.cur;
    if (cur.el) { clearTimeout(cur.guard); try { cur.el.pause(); } catch (e) { /* abaikan */ } return; }
    try { speechSynthesis.cancel(); } catch (e) { /* abaikan */ }
  }
  function resumeSpeak() {
    if (!VOICE.cur || !VOICE.paused) { return; }
    VOICE.paused = false;
    var cur = VOICE.cur;
    if (cur.el) { armGuard(cur); var pr = cur.el.play(); if (pr && pr.catch) { pr.catch(function () { finishCur(cur); }); } return; }
    runCur(cur);
  }
  function estSeconds(text) { return (text.length / 14.5 + (text.match(/[.!?]/g) || []).length * 0.3) / VOICE.rate; }
  function autoSpeak(text, btn) { if (VOICE.auto && canSpeak() && AU.on && AU.started) { speak(text, btn); } }
  function toggleSpeak(btn, text) { if (VOICE.btn === btn) { stopSpeak(); } else { speak(text, btn); } }
  function openVoicePanel(force) {
    var pnl = $('voicePanel'), open = force ? true : pnl.hidden;
    pnl.hidden = !open; $('voiceBtn').setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  $('voiceBtn').addEventListener('click', function () { loadVoices(); openVoicePanel(false); });
  document.addEventListener('pointerdown', function (e) {
    var pnl = $('voicePanel');
    if (!pnl.hidden && !pnl.contains(e.target) && !$('voiceBtn').contains(e.target) && !(e.target.classList && e.target.classList.contains('speak'))) { pnl.hidden = true; $('voiceBtn').setAttribute('aria-expanded', 'false'); }
  });
  $('vAuto').addEventListener('change', function () { VOICE.auto = this.checked; store('cerna-auto', VOICE.auto ? 'on' : 'off'); if (!VOICE.auto) { stopSpeak(); } });
  $('vSel').addEventListener('change', function () {
    var nm = this.value; stopSpeak();
    if (nm !== REC) { VOICE.v = VOICE.list.filter(function (v) { return v.name === nm; })[0] || VOICE.v; }
    VOICE.pref = nm; store('cerna-voice', nm);
    $('vNatural').hidden = useRec() || voiceScore(VOICE.v) >= 50;
  });
  $('vRate').addEventListener('change', function () { VOICE.rate = parseFloat(this.value) || 1; store('cerna-rate', String(VOICE.rate)); if (VOICE.cur && VOICE.cur.el) { try { VOICE.cur.el.playbackRate = VOICE.rate; } catch (e) { /* abaikan */ } } });
  $('vTest').addEventListener('click', function () { speak(TEST_NARR, null); });

  /* ================= LAYAR PENUH ================= */
  var fsBtn = $('fsBtn'), rootEl = document.documentElement, fsReq = rootEl.requestFullscreen || rootEl.webkitRequestFullscreen;
  if (!fsReq) { fsBtn.hidden = true; }
  function fsOn() { return !!(document.fullscreenElement || document.webkitFullscreenElement); }
  function fsSync() { var on = fsOn(), txt = on ? 'Keluar layar penuh' : 'Layar penuh'; fsBtn.setAttribute('aria-pressed', on ? 'true' : 'false'); fsBtn.setAttribute('aria-label', txt); fsBtn.title = txt; }
  fsBtn.addEventListener('click', function () {
    try {
      if (fsOn()) { (document.exitFullscreen || document.webkitExitFullscreen).call(document); }
      else { var rq = fsReq.call(rootEl); if (rq && rq.catch) { rq.catch(function () { /* abaikan */ }); } }
    } catch (e) { /* abaikan */ }
  });
  document.addEventListener('fullscreenchange', fsSync); document.addEventListener('webkitfullscreenchange', fsSync);

  /* ================= FOKUS & PILIHAN ================= */
  function setFocus(ids, dimOp, onOp) {
    ORGANS.forEach(function (o) {
      var on = !ids || ids.indexOf(o.id) >= 0;
      ORG[o.id].opGoal = on ? (onOp == null ? 1 : onOp) : (dimOp == null ? 0.14 : dimOp);
    });
  }
  var chipsEl = $('chips'), chipBtns = {};
  ORGANS.forEach(function (o) {
    var b = document.createElement('button'); b.type = 'button'; b.className = 'chip' + (o.kind === 'tambahan' ? ' extra' : ''); b.setAttribute('aria-pressed', 'false');
    var d = document.createElement('span'); d.className = 'dot'; d.style.background = o.col;
    b.appendChild(d); b.appendChild(document.createTextNode(o.n));
    b.title = o.kind === 'tambahan' ? 'Organ tambahan (tidak dilewati makanan)' : 'Saluran pencernaan';
    b.addEventListener('click', function () { if (sel === o.id) { closeInfo(); } else { select(o.id); } });
    chipsEl.appendChild(b); chipBtns[o.id] = b;
  });
  function markActive() {
    ORGANS.forEach(function (o) { chipBtns[o.id].setAttribute('aria-pressed', sel === o.id ? 'true' : 'false'); ORG[o.id].el.classList.toggle('on', sel === o.id); });
  }
  function infoText(o) { return o.n + '. ' + o.facts.join(' ') + ' Fakta seru: ' + o.wow; }
  function showInfo(id) {
    var o = BY[id];
    $('iName').textContent = o.n;
    $('iAka').hidden = !o.aka; $('iAka').textContent = o.aka ? 'Nama lain: ' + o.aka : '';
    $('iBadge').textContent = o.kind === 'tambahan' ? 'Organ tambahan' : 'Saluran ke-' + o.no;
    $('iJenis').textContent = o.jenis;
    var ul = $('iFacts'); ul.textContent = '';
    o.facts.forEach(function (t) {
      var li = document.createElement('li'), d = document.createElement('span'), tx = document.createElement('span');
      d.className = 'd'; d.style.background = o.col; tx.textContent = t; li.appendChild(d); li.appendChild(tx); ul.appendChild(li);
    });
    var w = $('iWow'); w.textContent = ''; var wb = document.createElement('b'); wb.textContent = 'Fakta seru: '; w.appendChild(wb); w.appendChild(document.createTextNode(o.wow));
    var th = $('iThink'); th.textContent = ''; var bb = document.createElement('b'); bb.textContent = 'Pikirkan: '; th.appendChild(bb); th.appendChild(document.createTextNode(o.think));
    $('info').style.borderTopColor = o.col; $('info').hidden = false; $('info').scrollTop = 0; $('app').classList.add('has-info');
  }
  function select(id, silent) {
    sel = id;
    var g = ORG[id];
    desired.copy(g.center);
    gDist = clamp(g.size * 2.4 + 1.4, 2.6, 9) * (narrow() ? 1.3 : 1);
    if (id === 'mulut') { gTheta = nearest(theta, 0.25); gPhi = 1.45; }
    else if (id === 'pankreas' || id === 'kerongkongan') { gTheta = nearest(theta, 0.9); gPhi = 1.35; }
    setFocus(['mulut', 'kerongkongan'].indexOf(id) >= 0 ? [id] : [id], 0.14);
    stopSpeak();
    if (!silent) { showInfo(id); sfx('pick'); autoSpeak(NARASI[id], $('iSpeak')); }
    markActive();
  }
  function closeInfo() {
    sel = -1; stopSpeak();
    $('info').hidden = true; $('app').classList.remove('has-info');
    setFocus(null);
    desired.set(0, 3.0, 0); gDist = overviewDist(); gPhi = 1.4; gTheta = nearest(theta, 0.35);
    markActive();
  }
  $('iClose').addEventListener('click', function () { sfx('close'); closeInfo(); });
  $('iSpeak').addEventListener('click', function () { if (sel !== -1) { toggleSpeak(this, NARASI[sel]); } });

  var showBody = true, showBones = true;
  $('bodyBtn').addEventListener('click', function () { showBody = !showBody; this.setAttribute('aria-pressed', showBody ? 'true' : 'false'); });
  $('boneBtn').addEventListener('click', function () { showBones = !showBones; this.setAttribute('aria-pressed', showBones ? 'true' : 'false'); });
  $('labelBtn').addEventListener('click', function () { labelsOn = !labelsOn; this.setAttribute('aria-pressed', labelsOn ? 'true' : 'false'); });
  $('resetBtn').addEventListener('click', function () { closeInfo(); });

  /* ================= MODE: TEBAK ORGAN ================= */
  var round = { id: null, last: null, right: 0, total: 0, answered: false }, introModel = null;
  function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function buildIntroModel(id) {
    if (introModel) { introGroup.remove(introModel); }
    var src = ORG[id].group, clone = src.clone(true);
    clone.traverse(function (o) { if (o.isMesh) { o.material = o.material.clone(); o.material.transparent = false; o.material.opacity = 1; o.material.depthWrite = true; o.material.emissiveIntensity = 0; } });
    var box = new THREE.Box3().setFromObject(clone), c = new THREE.Vector3(), sz = new THREE.Vector3();
    box.getCenter(c); box.getSize(sz);
    var holder = new THREE.Group(), sc = 3.0 / Math.max(sz.x, sz.y, sz.z);
    clone.position.sub(c); holder.add(clone); holder.scale.setScalar(sc);
    holder.rotation.y = -0.4;
    introModel = holder; introGroup.add(holder);
  }
  function startRound() {
    var pool = INTRO_POOL.filter(function (x) { return x !== round.last; });
    var id = pool[Math.floor(Math.random() * pool.length)];
    round.id = id; round.last = id; round.answered = false;
    var others = shuffle(INTRO_POOL.filter(function (x) { return x !== id; })).slice(0, 2);
    var opts = shuffle([id].concat(others)), wrap = $('opts'); wrap.textContent = '';
    opts.forEach(function (oid) {
      var b = document.createElement('button'); b.type = 'button'; b.className = 'opt'; b.textContent = BY[oid].n; b.dataset.id = oid;
      b.addEventListener('click', function () { answer(oid); });
      wrap.appendChild(b);
    });
    $('opts').hidden = false; $('introActs').hidden = false; $('answer').hidden = true; $('clue').hidden = true;
    buildIntroModel(id);
    gTheta = theta = 0.4; gPhi = phi = 1.35; gDist = dist = narrow() ? 8.4 : 7.2;
  }
  function confetti() {
    if (reduce) { return; }
    var fx = $('fx'), cols = ['#ff6a4d', '#ffd34e', '#6fd6cf', '#ffffff', '#b59cff'];
    for (var i = 0; i < 36; i++) {
      var c = document.createElement('span'); c.className = 'cf';
      c.style.left = (10 + Math.random() * 80) + '%'; c.style.background = cols[i % cols.length];
      c.style.setProperty('--dx', ((Math.random() - 0.5) * 240).toFixed(0) + 'px'); c.style.setProperty('--r', ((Math.random() - 0.5) * 900).toFixed(0) + 'deg');
      c.style.animationDelay = (Math.random() * 0.25).toFixed(2) + 's';
      fx.appendChild(c);
    }
    setTimeout(function () { fx.textContent = ''; }, 2200);
  }
  function answer(oid) {
    if (round.answered) { return; }
    round.answered = true; round.total++;
    var ok = oid === round.id; if (ok) { round.right++; }
    Array.prototype.forEach.call($('opts').children, function (b) {
      b.disabled = true;
      if (b.dataset.id === round.id) { b.classList.add('ok'); } else if (b.dataset.id === oid) { b.classList.add('no'); }
    });
    sfx(ok ? 'ok' : 'no'); if (ok) { confetti(); }
    var v = $('verdict'); v.textContent = ok ? 'Tepat sekali!' : 'Belum tepat. Jawabannya:'; v.className = 'verdict ' + (ok ? 'ok' : 'no');
    $('aName').textContent = BY[round.id].n; $('aDesc').textContent = DESC[round.id];
    var rid = round.id; setTimeout(function () { if (mode === 'intro' && round.id === rid) { autoSpeak((ok ? 'Tepat sekali! ' : 'Belum tepat. Jawabannya adalah ') + BY[rid].n + '. ' + DESC[rid], null); } }, 900);
    $('introActs').hidden = true; $('clue').hidden = true;
    setTimeout(function () { if (mode === 'intro' && round.answered) { $('opts').hidden = true; $('answer').hidden = false; } }, 650);
    var sc = $('score'); sc.hidden = false; sc.textContent = 'Benar ' + round.right + ' dari ' + round.total;
  }
  $('clueBtn').addEventListener('click', function () { var c = $('clue'); c.textContent = 'Petunjuk: ' + CLUES[round.id]; c.hidden = false; sfx('pick'); });
  $('again').addEventListener('click', function () { stopSpeak(); sfx('whoosh'); startRound(); });
  $('toBody').addEventListener('click', function () { sfx('whoosh'); var id = round.id; setMode('explore', true); select(id); });

  /* ================= MODE: PERJALANAN ================= */
  var J = { stage: 0, p: 0, playing: false, started: false, done: false, spawnT: 0, anim: false, narr: false, ready: false, dur: 5, token: 0, maxStage: 0 };
  var stepsEl = $('steps'), stepBtns = [];
  STAGES.forEach(function (s, i) {
    var b = document.createElement('button'); b.type = 'button'; b.className = 'step';
    b.appendChild(document.createTextNode((i + 1) + ' ' + (BY[s.id].n === 'Rektum & Anus' ? 'Anus' : BY[s.id].n)));
    var f = document.createElement('span'); f.className = 'fill'; b.appendChild(f);
    b.addEventListener('click', function () { if (i <= J.maxStage) { goStage(i, true); } });
    stepsEl.appendChild(b); stepBtns.push({ b: b, f: f });
  });
  function stageCard() {
    var s = STAGES[J.stage], o = BY[s.id];
    $('jNo').textContent = 'Tahap ' + (J.stage + 1) + ' dari 6';
    $('jTime').textContent = s.time;
    $('jName').textContent = J.done ? 'Perjalanan selesai!' : o.n;
    $('jText').textContent = J.done ? 'Dari sesuap nasi sampai keluar sebagai feses, perjalanan makanan bisa butuh sekitar 1 sampai 3 hari. Sari makanannya sudah diserap tubuh untuk tenaga dan pertumbuhan.' : (J.started ? s.text : 'Ikuti sesuap nasi melewati seluruh saluran pencernaan. Tekan Mulai, lalu Lanjut di setiap tahap.');
    var th = $('jThink'); th.textContent = ''; th.hidden = !J.started || J.done || !J.ready;
    var bb = document.createElement('b'); bb.textContent = 'Pikirkan: '; th.appendChild(bb); th.appendChild(document.createTextNode(s.think));
    $('jTime').hidden = !J.started || J.done;
    var nx = $('jNext'), waiting = J.started && !J.done && J.anim && !J.ready;
    nx.textContent = !J.started ? 'Mulai' : J.done ? 'Ulangi' : J.ready ? (J.stage === 5 ? 'Selesai' : 'Lanjut') : waiting ? 'Tunggu narasi…' : J.playing ? 'Jeda' : 'Putar';
    nx.disabled = waiting;
    nx.classList.toggle('pulse', J.started && J.ready && !J.done);
    var jp = $('jPos'); jp.hidden = !J.started || !(J.ready || J.done);
    jp.textContent = J.done ? 'Lanjut ke Asesmen' : 'Pos Pemeriksaan ' + (J.stage + 1);
    $('jPrev').disabled = !J.started || (J.stage === 0 && J.p === 0 && !J.done);
    stepBtns.forEach(function (sb, i) {
      sb.b.setAttribute('aria-current', i === J.stage && !J.done ? 'step' : 'false');
      sb.b.classList.toggle('done', J.done || i < J.stage || (i === J.stage && J.ready));
      sb.b.disabled = i > J.maxStage;
    });
  }
  function checkDone() {
    if (J.ready || J.done || !J.anim || J.narr) { return; }
    J.ready = true; J.playing = false;
    if (J.stage >= J.maxStage) { J.maxStage = Math.min(5, J.stage + 1); }
    if (J.stage === 5) { J.maxStage = 5; }
    stageCard();
  }
  function goStage(i, play) {
    J.stage = i; J.p = 0; J.started = true; J.done = false; J.playing = !!play;
    J.anim = false; J.ready = false; J.narr = false; J.token++;
    bolus.visible = true;
    var s = STAGES[i];
    setFocus(s.organs, 0.12, 0.42);
    gDist = s.dist * (narrow() ? 1.25 : 1);
    if (i === 0) { gTheta = nearest(theta, 0.55); gPhi = 1.4; }
    else if (i === 1) { gTheta = nearest(theta, 1.2); gPhi = 1.45; }
    else if (i === 5) { gTheta = nearest(theta, 0.7); gPhi = 1.75; }
    else { gTheta = nearest(theta, 0.35); gPhi = 1.35; }
    stopSpeak();
    J.dur = s.dur;
    if (play) {
      sfx(i === 1 ? 'gulp' : 'whoosh');
      if (canSpeak() && AU.on) {
        var tk = J.token;
        J.narr = true;
        J.dur = Math.max(s.dur, estSeconds(STAGE_NARR[i]) * 0.95);
        speak(STAGE_NARR[i], $('jSpeak'), function () { if (tk === J.token) { J.narr = false; checkDone(); } });
        var el = VOICE.cur && VOICE.cur.el;
        if (el) {
          /* animasi mengikuti durasi rekaman yang sebenarnya */
          el.addEventListener('loadedmetadata', function () { if (tk === J.token && isFinite(el.duration)) { J.dur = Math.max(s.dur, el.duration / VOICE.rate * 0.97); } });
        }
      }
    }
    stageCard();
  }
  function finishJourney() {
    stopSpeak();
    J.done = true; J.playing = false; J.maxStage = 5; bolus.visible = false; setFocus(null, 0.14, 1);
    desired.set(0, 3.0, 0); gDist = overviewDist(); gPhi = 1.4; gTheta = nearest(theta, 0.35);
    sfx('ok'); stageCard(); autoSpeak(FINISH_NARR, $('jSpeak'));
  }
  $('jNext').addEventListener('click', function () {
    if (!J.started || J.done) { goStage(0, true); return; }
    if (J.ready) { if (J.stage === 5) { finishJourney(); } else { goStage(J.stage + 1, true); } return; }
    if (J.anim) { return; }
    J.playing = !J.playing;
    if (J.playing) { resumeSpeak(); } else { pauseSpeak(); }
    stageCard();
  });
  $('jPrev').addEventListener('click', function () { if (J.p > 0.05 || J.stage === 0) { goStage(J.stage, true); } else { goStage(J.stage - 1, true); } });
  $('jSpeak').addEventListener('click', function () {
    if (J.started && !J.done && !J.ready && J.narr) {
      if (VOICE.paused) { J.playing = true; resumeSpeak(); stageCard(); } else { stopSpeak(); }
      return;
    }
    toggleSpeak(this, J.done ? FINISH_NARR : STAGE_NARR[J.stage]);
  });
  /* Pos Pemeriksaan (asesmen formatif) dimuat di dalam bingkai hanya saat dibuka */
  function closePos() { $('posWrap').hidden = true; $('posFrame').src = 'about:blank'; }
  $('jPos').addEventListener('click', function () {
    stopSpeak();
    if (J.done) { location.href = '../asesmen/'; return; }
    $('posFrame').src = '../asesmen/pos.html?pos=' + (J.stage + 1) + '&embed=1';
    $('posWrap').hidden = false;
  });
  $('posClose').addEventListener('click', closePos);
  window.addEventListener('message', function (e) { if (e.origin === location.origin && e.data === 'jp-pos-tutup') { closePos(); } });
  function resetJourney() { stopSpeak(); J.stage = 0; J.p = 0; J.started = false; J.done = false; J.playing = false; J.anim = false; J.ready = false; J.narr = false; J.token++; J.maxStage = 0; bolus.visible = true; updateBolus(0); stageCard(); }

  var tmpV = new THREE.Vector3(), colA = new THREE.Color(), colB = new THREE.Color();
  function updateBolus(t) {
    var i = J.stage, p = J.p, pos = along(PATHS[i], p, tmpV);
    bolus.position.copy(pos);
    var rPrev = i > 0 ? BOLUS_R[i - 1] : BOLUS_R[0], r = lerp(rPrev, BOLUS_R[i], smooth(p * 4));
    colA.set(i > 0 ? BOLUS_C[i - 1] : BOLUS_C[0]); colB.set(BOLUS_C[i]);
    var cp = i === 2 ? smooth(p * 1.4) : i === 4 ? smooth(p * 1.6) : smooth(p * 3);
    bolusMat.color.copy(colA).lerp(colB, cp); bolusMat.emissive.copy(bolusMat.color).multiplyScalar(0.22);
    var ballS = r, grainVis = 0;
    if (i === 0) { ballS = r * smooth((p - 0.25) / 0.5); grainVis = 1 - smooth((p - 0.45) / 0.35); }
    var squish = i === 0 ? 1 + 0.18 * Math.sin(t * 14) * (1 - p) : i === 2 ? 1 + 0.12 * Math.sin(t * 5) : 1 + 0.05 * Math.sin(t * 6);
    bolusBall.scale.set(ballS * squish, ballS / squish, ballS * squish);
    bolusBall.visible = ballS > 0.003;
    bolusGlow.scale.setScalar(Math.max(r, 0.06) * 3.2);
    bolusRing.scale.setScalar(Math.max(r, 0.1) * (3.6 + 0.4 * Math.sin(t * 5)));
    bolusGlow.material.color.set(0xffffff);
    grainMat.opacity = grainVis;
    grains.forEach(function (g) {
      g.m.visible = grainVis > 0.01;
      var k = 1 - smooth(p / 0.6) * 0.85;
      g.m.position.copy(g.home).multiplyScalar(k);
      if (!reduce && i === 0) { g.m.rotation.y += 0.05; }
    });
    // gigi mengunyah
    lowerTeeth.position.y = i === 0 && J.playing && p < 0.7 ? -0.05 * Math.abs(Math.sin(t * 9)) : 0;
    tongueMesh.position.y = 6.93 + lowerTeeth.position.y * 0.6;
    return pos;
  }

  /* ================= GANTI MODE ================= */
  function setMode(m, keepCam) {
    mode = m;
    $('tabIntro').setAttribute('aria-pressed', m === 'intro' ? 'true' : 'false');
    $('tabExplore').setAttribute('aria-pressed', m === 'explore' ? 'true' : 'false');
    $('tabJourney').setAttribute('aria-pressed', m === 'journey' ? 'true' : 'false');
    var intro = m === 'intro';
    world.visible = !intro; introGroup.visible = intro;
    $('introTop').hidden = !intro; $('introUI').hidden = !intro;
    $('exploreTop').hidden = m !== 'explore'; chipsEl.hidden = m !== 'explore';
    $('journeyUI').hidden = m !== 'journey'; labelsEl.hidden = intro;
    sel = -1; $('info').hidden = true; $('app').classList.remove('has-info'); markActive(); stopSpeak();
    bolus.visible = false; parts.forEach(function (p) { p.life = 0; p.s.visible = false; });
    lowerTeeth.position.y = 0; tongueMesh.position.y = 6.93;
    if (intro) {
      target.set(0, 0, 0); desired.set(0, 0, 0);
      startRound();
    } else if (m === 'explore') {
      setFocus(null);
      if (!keepCam) { target.set(0, 3.0, 0); dist = overviewDist() * 0.75; }
      desired.set(0, 3.0, 0); gDist = overviewDist(); gPhi = 1.4; gTheta = nearest(theta, 0.35);
    } else {
      setFocus(null, 0.14, 1);
      target.set(0, 3.0, 0); desired.set(0, 3.0, 0); gDist = overviewDist(); gPhi = 1.4; gTheta = nearest(theta, 0.35);
      resetJourney();
      desired.copy(PATHS[0].p[0]); gDist = overviewDist() * 0.55;
    }
  }
  $('tabIntro').addEventListener('click', function () { if (mode !== 'intro') { sfx('whoosh'); setMode('intro'); } });
  $('tabExplore').addEventListener('click', function () { if (mode !== 'explore') { sfx('whoosh'); setMode('explore'); } });
  $('tabJourney').addEventListener('click', function () { if (mode !== 'journey') { sfx('whoosh'); setMode('journey'); } });

  /* ================= INPUT ================= */
  var pts = {}, nPts = 0, tap = null, pinch = 0, ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), hoverId = null;
  function pinchDist() { var k = Object.keys(pts), a = pts[k[0]], b = pts[k[1]]; return Math.hypot(a.x - b.x, a.y - b.y); }
  function hideHint() { $('hint').style.opacity = '0'; }
  function hitAt(cx, cy) {
    var rc = canvas.getBoundingClientRect();
    ndc.set(((cx - rc.left) / rc.width) * 2 - 1, -((cy - rc.top) / rc.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    var hits = ray.intersectObjects(pickables, false);
    for (var i = 0; i < hits.length; i++) { var id = hits[i].object.userData.id; if (ORG[id].op > 0.3) { return id; } }
    return null;
  }
  canvas.addEventListener('pointerdown', function (e) {
    try { canvas.setPointerCapture(e.pointerId); } catch (x) { /* abaikan */ }
    pts[e.pointerId] = { x: e.clientX, y: e.clientY }; nPts++;
    tap = nPts === 1 ? { x: e.clientX, y: e.clientY, t: performance.now(), moved: 0 } : null;
    if (nPts === 2) { pinch = pinchDist(); }
    hideHint();
  });
  canvas.addEventListener('pointermove', function (e) {
    var p = pts[e.pointerId];
    if (!p) {
      if (mode === 'explore' && e.pointerType === 'mouse') { hoverId = hitAt(e.clientX, e.clientY); canvas.classList.toggle('hover', !!hoverId); }
      return;
    }
    var dx = e.clientX - p.x, dy = e.clientY - p.y; p.x = e.clientX; p.y = e.clientY;
    if (nPts === 1) { gTheta -= dx * 0.006; gPhi = clamp(gPhi - dy * 0.006, 0.15, Math.PI - 0.15); if (tap) { tap.moved += Math.abs(dx) + Math.abs(dy); } }
    else if (nPts === 2) { var d = pinchDist(); if (pinch > 0 && d > 0) { gDist = clamp(gDist * pinch / d, minDist(), maxDist()); } pinch = d; }
  });
  function endPtr(e) {
    if (!pts[e.pointerId]) { return; }
    delete pts[e.pointerId]; nPts = Math.max(0, nPts - 1);
    if (nPts === 0 && tap && tap.moved < 8 && performance.now() - tap.t < 600 && mode === 'explore') {
      var id = hitAt(e.clientX, e.clientY);
      if (id && id !== sel) { select(id); }
    }
    if (nPts === 0) { tap = null; }
    pinch = 0;
  }
  canvas.addEventListener('pointerup', endPtr); canvas.addEventListener('pointercancel', endPtr);
  canvas.addEventListener('pointerleave', function () { hoverId = null; canvas.classList.remove('hover'); });
  canvas.addEventListener('wheel', function (e) { e.preventDefault(); hideHint(); gDist = clamp(gDist * Math.exp(e.deltaY * 0.0012), minDist(), maxDist()); }, { passive: false });
  canvas.addEventListener('keydown', function (e) {
    var used = true;
    if (e.key === 'ArrowLeft') { gTheta -= 0.15; } else if (e.key === 'ArrowRight') { gTheta += 0.15; }
    else if (e.key === 'ArrowUp') { gPhi = clamp(gPhi - 0.12, 0.15, Math.PI - 0.15); }
    else if (e.key === 'ArrowDown') { gPhi = clamp(gPhi + 0.12, 0.15, Math.PI - 0.15); }
    else if (e.key === '+' || e.key === '=') { gDist = clamp(gDist * 0.85, minDist(), maxDist()); }
    else if (e.key === '-') { gDist = clamp(gDist * 1.18, minDist(), maxDist()); }
    else { used = false; }
    if (used) { e.preventDefault(); hideHint(); }
  });

  /* ================= LOOP ================= */
  var last = performance.now(), clock = 0, v3 = new THREE.Vector3(), shellOp = 1, boneOp = 1;
  function frame(now) {
    requestAnimationFrame(frame);
    var dt = Math.min(0.05, (now - last) / 1000); last = now; clock += dt;
    var k = 1 - Math.exp(-8 * dt);

    if (home && mode === 'explore' && !reduce && !nPts) { gTheta += dt * 0.22; }
    if (cells && !reduce) { cells.rotation.y += dt * 0.01; cells.rotation.x += dt * 0.004; }
    if (mode === 'intro') {
      if (introModel && !reduce) { introModel.rotation.y += dt * 0.35; introModel.position.y = Math.sin(clock * 1.2) * 0.08; }
    } else {
      // organ: transparansi & sorot
      ORGANS.forEach(function (o) {
        var g = ORG[o.id];
        g.op += (g.opGoal - g.op) * k;
        var glowGoal = (mode === 'explore' && (hoverId === o.id && sel !== o.id)) ? 0.22 : (sel === o.id ? 0.08 + 0.06 * Math.sin(clock * 3) : 0);
        g.glow += (glowGoal - g.glow) * k;
        g.mats.forEach(function (m) {
          m.opacity = g.op; var tr = g.op < 0.985;
          if (m.transparent !== tr) { m.transparent = tr; m.needsUpdate = true; }
          m.depthWrite = g.op > 0.6;
          m.emissive.set(o.col).convertSRGBToLinear(); m.emissiveIntensity = g.glow;
        });
        g.group.visible = g.op > 0.02;
      });
      shellOp += ((showBody || mode !== 'explore' ? 1 : 0) - shellOp) * k; shellUni.uOp.value = shellOp; shell.visible = shellOp > 0.02;
      boneOp += ((mode === 'journey' ? 0.3 : showBones ? 1 : 0) - boneOp) * k; boneMat.opacity = 0.38 * boneOp; bones.visible = boneOp > 0.02;
      shellUni.uScan.value = -12.8 + ((clock * 2.2) % 23);

      if (mode === 'journey') {
        if (J.playing && !J.anim) {
          J.p += dt / J.dur;
          if (J.p >= 1) { J.p = 1; J.anim = true; stageCard(); checkDone(); }
        }
        if (bolus.visible) {
          var bp = updateBolus(clock);
          desired.copy(bp);
          // efek tiap tahap
          J.spawnT -= dt;
          if (J.playing && J.spawnT <= 0) {
            var st = J.stage;
            if (st === 2) { spawn(bp, 0x6fbf2e, 0.35, 0.09, 1.2, 0.2); if (Math.random() < 0.25) { sfx('bubble'); } J.spawnT = 0.09; }
            else if (st === 3 && J.p > 0.12) { spawn(bp, 0xffb000, 0.8, 0.11, 1.1, 0); J.spawnT = 0.05; }
            else if (st === 4) { spawn(bp, 0x1e88ff, 0.6, 0.12, 1.2, 0); J.spawnT = 0.07; }
            else { J.spawnT = 0.1; }
          }
        }
        var fill = J.done ? 1 : J.p;
        stepBtns.forEach(function (sb, i) { sb.f.style.width = (J.done || i < J.stage ? 100 : i === J.stage ? fill * 100 : 0) + '%'; });
      }
      parts.forEach(function (p) {
        if (p.life <= 0) { return; }
        p.life -= dt;
        if (p.life <= 0) { p.s.visible = false; return; }
        p.s.position.addScaledVector(p.v, dt); p.v.multiplyScalar(1 - dt * 0.8);
        var a = p.life / p.max; p.s.material.opacity = Math.min(1, a * 1.6) * 0.9;
      });
    }

    theta += (gTheta - theta) * k; phi += (gPhi - phi) * k; dist += (gDist - dist) * k;
    target.lerp(desired, 1 - Math.exp(-(mode === 'journey' ? 5 : 8) * dt));
    var sp = Math.sin(phi);
    camera.position.set(target.x + dist * sp * Math.sin(theta), target.y + dist * Math.cos(phi), target.z + dist * sp * Math.cos(theta));
    camera.lookAt(target);
    var wantShift = 0, wantX = 0;
    if (mode === 'explore' && home) { if (narrow()) { wantShift = H * 0.17; } else { wantX = -Math.min(230, W * 0.17); } }
    else if (mode === 'explore' && sel !== -1) { if (narrow()) { wantShift = H * 0.2; } else { wantX = 170; } }
    else if (mode === 'journey') { if (narrow()) { wantShift = H * 0.2; } else { wantX = -170; wantShift = H * 0.03; } }
    else if (mode === 'intro') { wantShift = H * 0.04; }
    shiftY += (wantShift - shiftY) * k; shiftX += (wantX - shiftX) * k;
    if (Math.abs(shiftY) > 0.5 || Math.abs(shiftX) > 0.5) { camera.setViewOffset(W, H, shiftX, shiftY, W, H); } else { camera.clearViewOffset(); }

    if (mode !== 'intro') {
      var placed = [];
      var order = sel !== -1 ? [sel].concat(ORGANS.map(function (o) { return o.id; }).filter(function (x) { return x !== sel; })) : ORGANS.map(function (o) { return o.id; });
      order.forEach(function (id) {
        var g = ORG[id], el = g.el;
        var show = labelsOn && (mode === 'explore' || g.opGoal > 0.3) && g.op > 0.3;
        if (mode === 'journey' && !J.started) { show = labelsOn; }
        if (!show) { el.style.display = 'none'; return; }
        v3.copy(g.anchor).project(camera);
        if (v3.z > 1 || Math.abs(v3.x) > 1.05 || Math.abs(v3.y) > 1.05) { el.style.display = 'none'; return; }
        var x = (v3.x * 0.5 + 0.5) * W, y = (-v3.y * 0.5 + 0.5) * H, w = BY[id].n.length * 7.6 + 22, h = 18, x0 = x - 6, y0 = y - 9;
        for (var n = 0; n < placed.length; n++) { var c = placed[n]; if (x0 < c[0] + c[2] && x0 + w > c[0] && y0 < c[1] + c[3] && y0 + h > c[1]) { if (id !== sel) { el.style.display = 'none'; return; } } }
        placed.push([x0, y0, w, h]);
        el.style.display = 'block';
        el.style.transform = 'translate(' + (x - 6).toFixed(1) + 'px,' + (y - 9).toFixed(1) + 'px)';
      });
    }
    renderer.render(scene, camera);
  }

  window.addEventListener('resize', resize);
  if (window.ResizeObserver) { new ResizeObserver(resize).observe($('app')); }
  ORGANS.forEach(function (o) { ORG[o.id].el.style.setProperty('--c', o.col); });
  resize();
  var home = true;
  function goHome() {
    home = true; stopSpeak(); setMode('explore'); closeInfo();
    $('app').classList.add('homing');
    gTheta = theta; gDist = dist = overviewDist() * 1.12; desired.set(0, 2.6, 0); target.set(0, 2.6, 0);
  }
  function leaveHome(m) {
    home = false; $('app').classList.remove('homing'); sfx('whoosh');
    setMode(m, m === 'explore');
  }
  Array.prototype.forEach.call(document.querySelectorAll('#modes button'), function (b) {
    b.addEventListener('click', function () { leaveHome(b.dataset.m); });
  });
  $('homeBtn').addEventListener('click', function () { sfx('close'); goHome(); });
  function openSheet(tab) {
    Array.prototype.forEach.call(document.querySelectorAll('.stab'), function (b) { b.setAttribute('aria-selected', b.dataset.tab === tab ? 'true' : 'false'); });
    Array.prototype.forEach.call(document.querySelectorAll('.spane'), function (p) { p.hidden = p.dataset.pane !== tab; });
    $('sheet').hidden = false; $('sheetClose').focus();
  }
  function closeSheet() { $('sheet').hidden = true; }
  Array.prototype.forEach.call(document.querySelectorAll('.hlinks button, .stab'), function (b) {
    b.addEventListener('click', function () { sfx('pick'); openSheet(b.dataset.tab); });
  });
  $('infoBtn').addEventListener('click', function () { sfx('pick'); openSheet('tujuan'); });
  $('sheetClose').addEventListener('click', function () { sfx('close'); closeSheet(); });
  $('sheet').addEventListener('pointerdown', function (e) { if (e.target === this) { closeSheet(); } });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !$('sheet').hidden) { closeSheet(); } });
  goHome();
  setTimeout(function () {
    var t0 = performance.now(); try { makeBody(); } catch (e) { /* tubuh tidak tampil, organ tetap jalan */ }
    window.__bodyMs = Math.round(performance.now() - t0);
    Array.prototype.forEach.call(document.querySelectorAll('#modes button'), function (b) { b.disabled = false; });
    $('homeNote').textContent = 'Nyalakan suara untuk musik dan efek. Geser layar untuk memutar model.';
  }, 300);
  setTimeout(hideHint, 14000);
  requestAnimationFrame(frame);
})();
