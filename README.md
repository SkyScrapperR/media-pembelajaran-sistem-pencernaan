# Jelajah Pencernaan

Media pembelajaran digital interaktif dan aplikasi asesmen digital tentang sistem pencernaan manusia
untuk IPAS kelas V SD (Fase C). Dibuat untuk mata kuliah Teknologi Baru dalam Pengajaran dan Pembelajaran.

## Isi situs

| Halaman | Isi |
|---|---|
| `/` | Beranda dan alur penjelajahan |
| `/belajar/` | Media 3D: Organ apa ini?, Jelajah Tubuh, Perjalanan Nasi dengan narasi suara |
| `/asesmen/` | Pusat asesmen dan kemajuan pemain |
| `/asesmen/cek-bekal.html` | Asesmen diagnostik: 6 soal dengan tingkat keyakinan |
| `/asesmen/pos.html?pos=1..6` | Asesmen formatif: 6 permainan dengan umpan balik langsung |
| `/asesmen/ujian.html` | Asesmen sumatif: 15 soal, nilai 0 sampai 100, pembahasan, sertifikat |
| `/asesmen/guru.html` | Kisi-kisi, kunci jawaban, pedoman penskoran, rekap hasil |

## Tokoh dan arena bonus

Si Nasi sang penjelajah ditemani enam penjaga pos (Gigo, Kero, Lambu, Hali, Kolo, Tiha) dan Si Kuman.
Semua tokoh digambar dengan SVG di `assets/tokoh.js`. Arena bonus Basmi Kuman ada di `/asesmen/bonus.html`
dan tidak dinilai.

## Susunan file

- `assets/` dipakai bersama: `tema.css` (tampilan), `inti.js` (penyimpan progres, bunyi), `soal.js` (bank soal), `peta.js` (gambar tubuh 2D).
- `belajar/` berisi media 3D yang dipecah menjadi `gaya.css`, `data.js` (materi dan narasi), `tubuh.js` (model tubuh), dan `app.js`.
- `asesmen/` berisi satu file JavaScript untuk setiap halaman.

Setiap halaman hanya memuat file yang dibutuhkannya. Mesin 3D (three.js) hanya dimuat di `/belajar/`.
Pos Pemeriksaan juga dapat dibuka dari dalam Perjalanan Nasi dan baru dimuat saat tombolnya ditekan.

## Menjalankan

Situs ini HTML, CSS, dan JavaScript biasa tanpa proses build. Jalankan server statis di folder ini, misalnya:

```
python -m http.server 8000
```

lalu buka `http://localhost:8000`. Hasil asesmen tersimpan di peramban perangkat (localStorage).

## Rekaman narasi

Narasi memakai rekaman MP3 di folder `audio/` bila tersedia, sehingga suaranya sama di semua peramban.
Bila rekaman tidak ada, media memakai suara bahasa Indonesia bawaan peramban.
Teks narasi ada di `narasi.json`. Rekaman dibuat dengan [edge-tts](https://github.com/rany2/edge-tts):

```
pip install edge-tts
python tools/gen_audio.py narasi.json audio
```

Suara dapat diganti lewat variabel `NARASI_VOICE` (bawaan `id-ID-GadisNeural`).

Rekaman asesmen (pembaca soal dan suara Si Nasi) disusun dari `assets/soal.js`:

```
node tools/suara_asesmen.js > asesmen.json
TANPA_CONTOH=1 python tools/gen_audio.py asesmen.json audio/asesmen
```

## Musik dan efek bunyi

`assets/audio.js` menyusun 8 lagu latar langsung dengan Web Audio (tanpa file): Petualangan Si Nasi,
Riang Ceria, Tenang Berpikir, Gelembung Mimpi, Pantai Tropis, Jalan-jalan Santai, Robot 8-bit, dan Pesta Juara.
Mode Otomatis berganti lagu sendiri sekitar setiap satu menit: daftar ceria di beranda, peta, dan pos;
daftar tenang di Cek Bekal dan Ujian. Pemain bisa memilih satu lagu, mengatur volume, serta mematikan musik,
efek bunyi, atau suara Si Nasi dari tombol musik di pojok kanan atas.
