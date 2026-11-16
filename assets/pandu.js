/* Panduan pengenalan: layar meredup, satu bagian disorot, Si Nasi menjelaskan langkah demi langkah.
   Berdiri sendiri (tanpa file lain), jadi bisa dipakai di beranda, asesmen, dan media 3D. */
(function () {
  'use strict';
  var KEY = 'jelajah-pencernaan:pandu';
  function sudah() { try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) { return {}; } }
  function tandai(id) { try { var s = sudah(); s[id] = 1; localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) { /* abaikan */ } }
  var NASI = '<svg viewBox="0 0 100 116" width="54" height="63" aria-hidden="true"><path d="M20 70Q6 60 8 44M80 70q14-10 12-26M40 106l-3 8M60 106l3 8" fill="none" stroke="#12262d" stroke-width="3.4" stroke-linecap="round"/><path d="M50 20c22 0 33 22 33 46 0 26-15 42-33 42S17 92 17 66c0-24 11-46 33-46z" fill="#fffdf7" stroke="#12262d" stroke-width="3.4"/><path d="M26 30c2-16 14-24 24-24s22 8 24 24z" fill="#d9a441" stroke="#12262d" stroke-width="3.4" stroke-linejoin="round"/><path d="M18 31c10-5 54-5 64 0 2 4-2 6-6 6H24c-4 0-8-2-6-6z" fill="#e8b85a" stroke="#12262d" stroke-width="3.4" stroke-linejoin="round"/><path d="M29 25h42" stroke="#ff6a4d" stroke-width="5"/><path d="M36 66q4-6 8 0M56 66q4-6 8 0" fill="none" stroke="#12262d" stroke-width="3" stroke-linecap="round"/><ellipse cx="31" cy="75" rx="5.5" ry="3.2" fill="#ff6a4d" opacity=".45"/><ellipse cx="69" cy="75" rx="5.5" ry="3.2" fill="#ff6a4d" opacity=".45"/><path d="M42 77q8 13 16 0z" fill="#7a1f2d" stroke="#12262d" stroke-width="2.4" stroke-linejoin="round"/></svg>';
  var CSS = '.pd-blok{position:fixed;inset:0;z-index:300;cursor:default}' +
    '.pd-sorot{position:fixed;z-index:301;border-radius:18px;box-shadow:0 0 0 9999px rgba(6,12,20,.78),0 0 0 3px #ffc857,0 0 26px 6px rgba(255,200,87,.55);pointer-events:none;transition:top .35s cubic-bezier(.3,.8,.3,1),left .35s cubic-bezier(.3,.8,.3,1),width .35s cubic-bezier(.3,.8,.3,1),height .35s cubic-bezier(.3,.8,.3,1),opacity .3s}' +
    '.pd-sorot.denyut{animation:pdDenyut 1.6s ease-in-out infinite}' +
    '@keyframes pdDenyut{0%,100%{box-shadow:0 0 0 9999px rgba(6,12,20,.78),0 0 0 3px #ffc857,0 0 20px 4px rgba(255,200,87,.45)}50%{box-shadow:0 0 0 9999px rgba(6,12,20,.78),0 0 0 6px #ffc857,0 0 34px 10px rgba(255,200,87,.7)}}' +
    '.pd-kartu,.pd-kartu *,.pd-sorot,.pd-bantu{box-sizing:border-box}.pd-kartu{position:fixed;z-index:302;width:min(360px,calc(100vw - 24px));background:#fffdf7;color:#12262d;border-radius:22px;padding:16px 16px 14px;box-shadow:0 18px 50px rgba(0,0,0,.5);font-family:Lexend,"Segoe UI",system-ui,sans-serif;font-size:15px;line-height:1.45;transition:top .35s cubic-bezier(.3,.8,.3,1),left .35s cubic-bezier(.3,.8,.3,1),opacity .25s;text-align:left}' +
    '.pd-kartu h3{font-family:Fredoka,"Trebuchet MS",system-ui,sans-serif;font-weight:700;font-size:20px;line-height:1.15;margin:0 0 4px;color:#b3471f}' +
    '.pd-kartu p{margin:0}.pd-atas{display:flex;gap:10px;align-items:flex-start}.pd-nasi{flex:none;animation:pdBob 2.2s ease-in-out infinite;line-height:0}' +
    '@keyframes pdBob{0%,100%{transform:translateY(0) rotate(-3deg)}50%{transform:translateY(-5px) rotate(3deg)}}' +
    '.pd-bawah{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:12px;flex-wrap:wrap}' +
    '.pd-titik{display:flex;gap:5px}.pd-titik i{width:8px;height:8px;border-radius:50%;background:#d9d2c4}.pd-titik i.on{background:#ff6a4d;width:18px;border-radius:6px}' +
    '.pd-tb{display:flex;gap:6px}.pd-kartu button{font:inherit;font-weight:600;cursor:pointer;border-radius:999px;min-height:38px;padding:0 16px;border:1.5px solid #d9d2c4;background:#fff;color:#12262d}' +
    '.pd-kartu button.utama{background:#ff6a4d;border-color:#ff6a4d;color:#fff;box-shadow:0 4px 0 #b3471f}.pd-kartu button.utama:active{transform:translateY(2px);box-shadow:0 2px 0 #b3471f}' +
    '.pd-kartu button.lewati{border:0;background:none;color:#6d6455;padding:0 6px;text-decoration:underline}' +
    '.pd-kartu button:focus-visible{outline:3px solid #2a9fb0;outline-offset:2px}' +
    '.pd-bantu{display:inline-grid;place-items:center;width:36px;height:36px;border-radius:50%;border:1.5px solid rgba(255,255,255,.18);background:rgba(111,214,207,.14);color:#6fd6cf;font:700 17px Fredoka,system-ui,sans-serif;cursor:pointer}' +
    '.pd-bantu:hover{border-color:#6fd6cf}' +
    '@media (prefers-reduced-motion:reduce){.pd-sorot,.pd-kartu{transition:none}.pd-sorot.denyut,.pd-nasi{animation:none}}@media print{.pd-blok,.pd-sorot,.pd-kartu,.pd-bantu{display:none!important}}';
  var gaya = document.createElement('style'); gaya.textContent = CSS; document.head.appendChild(gaya);

  var aktif = null;
  function bunyi(nama) { try { if (window.JP && JP.bunyi && JP.bunyi[nama]) { JP.bunyi[nama](); } } catch (e) { /* abaikan */ } }
  function terlihat(e) { if (!e) { return false; } var r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(e).visibility !== 'hidden'; }
  /* langkah: { sel, judul, teks, bulat } ; sel boleh kosong untuk pesan di tengah layar */
  function mulai(id, langkah, opsi) {
    opsi = opsi || {};
    if (aktif) { return false; }
    if (!opsi.paksa && sudah()[id]) { return false; }
    langkah = langkah.filter(function (l) { return !l.sel || terlihat(document.querySelector(l.sel)); });
    if (!langkah.length) { return false; }
    var i = 0, blok = document.createElement('div'), sorot = document.createElement('div'), kartu = document.createElement('div');
    blok.className = 'pd-blok'; sorot.className = 'pd-sorot denyut'; kartu.className = 'pd-kartu';
    kartu.setAttribute('role', 'dialog'); kartu.setAttribute('aria-live', 'polite'); kartu.setAttribute('aria-label', 'Panduan');
    document.body.appendChild(blok); document.body.appendChild(sorot); document.body.appendChild(kartu);
    function tutup(selesai) {
      tandai(id); blok.remove(); sorot.remove(); kartu.remove(); aktif = null;
      removeEventListener('resize', atur); removeEventListener('scroll', atur, true); document.removeEventListener('keydown', tombol, true);
      if (selesai) { bunyi('koin'); } if (opsi.selesai) { opsi.selesai(selesai); }
    }
    function atur() {
      var l = langkah[i], t = l.sel ? document.querySelector(l.sel) : null, W = innerWidth, H = innerHeight, kr = kartu.getBoundingClientRect(), x, y;
      if (t && terlihat(t)) {
        var r = t.getBoundingClientRect(), pad = l.pad === undefined ? 8 : l.pad;
        sorot.style.opacity = '1'; sorot.style.borderRadius = l.bulat ? '999px' : '18px';
        sorot.style.left = (r.left - pad) + 'px'; sorot.style.top = (r.top - pad) + 'px'; sorot.style.width = (r.width + pad * 2) + 'px'; sorot.style.height = (r.height + pad * 2) + 'px';
        var bawah = H - r.bottom - pad, atas = r.top - pad;
        y = bawah >= kr.height + 18 || bawah >= atas ? r.bottom + pad + 14 : r.top - pad - 14 - kr.height;
        x = r.left + r.width / 2 - kr.width / 2;
      } else {
        sorot.style.opacity = '0'; sorot.style.left = W / 2 + 'px'; sorot.style.top = H / 2 + 'px'; sorot.style.width = '0px'; sorot.style.height = '0px';
        x = W / 2 - kr.width / 2; y = H / 2 - kr.height / 2;
      }
      kartu.style.left = Math.max(12, Math.min(W - kr.width - 12, x)) + 'px';
      kartu.style.top = Math.max(12, Math.min(H - kr.height - 12, y)) + 'px';
    }
    function tampil() {
      var l = langkah[i], akhir = i === langkah.length - 1;
      kartu.innerHTML = '<div class="pd-atas"><span class="pd-nasi">' + NASI + '</span><div><h3></h3><p></p></div></div><div class="pd-bawah"><span class="pd-titik" aria-hidden="true">' +
        langkah.map(function (_, k) { return '<i class="' + (k === i ? 'on' : '') + '"></i>'; }).join('') + '</span><span class="pd-tb">' +
        (akhir ? '' : '<button type="button" class="lewati">Lewati</button>') + (i > 0 ? '<button type="button" class="balik">Kembali</button>' : '') +
        '<button type="button" class="utama">' + (akhir ? (opsi.akhir || 'Siap!') : 'Lanjut') + '</button></span></div>';
      kartu.querySelector('h3').textContent = l.judul; kartu.querySelector('p').textContent = l.teks;
      kartu.setAttribute('aria-label', 'Panduan langkah ' + (i + 1) + ' dari ' + langkah.length);
      var lw = kartu.querySelector('.lewati'), bl = kartu.querySelector('.balik'), ut = kartu.querySelector('.utama');
      if (lw) { lw.onclick = function () { tutup(false); }; }
      if (bl) { bl.onclick = function () { i--; bunyi('balik'); tampil(); }; }
      ut.onclick = function () { if (akhir) { tutup(true); } else { i++; bunyi('ketuk'); tampil(); } };
      var t = l.sel ? document.querySelector(l.sel) : null;
      if (t && t.scrollIntoView) { var r = t.getBoundingClientRect(); if (r.top < 70 || r.bottom > innerHeight - 200) { t.scrollIntoView({ block: 'center', behavior: 'smooth' }); } }
      atur(); setTimeout(atur, 60); setTimeout(atur, 420);
      try { ut.focus({ preventScroll: true }); } catch (e) { ut.focus(); }
    }
    function tombol(e) {
      if (e.key === 'Escape') { e.preventDefault(); tutup(false); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); kartu.querySelector('.utama').click(); }
      else if (e.key === 'ArrowLeft' && i > 0) { e.preventDefault(); kartu.querySelector('.balik').click(); }
      else if (e.key === 'Tab') { /* fokus tetap di dalam kartu */ var f = kartu.querySelectorAll('button'), a = f[0], z = f[f.length - 1]; if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); } else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); } else if (!kartu.contains(document.activeElement)) { e.preventDefault(); a.focus(); } }
    }
    addEventListener('resize', atur); addEventListener('scroll', atur, true); document.addEventListener('keydown', tombol, true);
    aktif = { tutup: tutup }; bunyi('pop'); tampil();
    return true;
  }
  /* tombol tanda tanya untuk mengulang panduan */
  function tombolBantu(fn, label) {
    var b = document.createElement('button'); b.type = 'button'; b.className = 'pd-bantu'; b.textContent = '?';
    b.setAttribute('aria-label', label || 'Tampilkan panduan'); b.title = label || 'Tampilkan panduan';
    b.addEventListener('click', function () { fn(); });
    return b;
  }
  window.JP_pandu = { mulai: mulai, tombol: tombolBantu, sudah: function (id) { return !!sudah()[id]; }, lupa: function () { try { localStorage.removeItem(KEY); } catch (e) { /* abaikan */ } } };
})();
