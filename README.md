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
| `/asesmen/guru.html` | Dasbor kelas dari database, kisi-kisi, kunci jawaban, pedoman penskoran |
| `/asesmen/bonus.html` | Arena bonus Basmi Kuman (tidak dinilai) |
| `/kamus/` | Kamus Pencernaan: 33 istilah, bisa dicari dan didengarkan |

## Tokoh dan arena bonus

Si Nasi sang penjelajah ditemani enam penjaga pos (Gigo, Kero, Lambu, Hali, Kolo, Tiha) dan Si Kuman.
Semua tokoh digambar dengan SVG di `assets/tokoh.js`. Arena bonus Basmi Kuman ada di `/asesmen/bonus.html`
dan tidak dinilai.

## Akun siswa dan database kelas

Siswa menekan **Masuk kelas** di Peta Petualangan, memilih kelas A, B, atau C, menulis nama, lalu memilih dua gambar rahasia.
Satu nama hanya bisa dipakai satu anak di tiap kelas. Gambar rahasia dipakai untuk masuk lagi dari perangkat lain.
Progres disimpan di perangkat dan dikirim ke server (`api/jp.js`, satu berkas JSON per siswa di Vercel Blob privat).
Tanpa internet permainan tetap berjalan, dan hasilnya dikirim saat internet kembali.

Halaman guru memeriksa kata sandi di server (variabel lingkungan `GURU_SANDI`), lalu menampilkan dasbor kelas:
daftar siswa, ketercapaian tiap tujuan pembelajaran, lima butir ujian tersulit, peta miskonsepsi, dan unduhan CSV.
Guru dapat mengatur ulang gambar rahasia siswa, menghapus siswa, atau menghapus data satu kelas.
Yang disimpan hanya nama yang diketik siswa, kelas, dan hasil asesmennya.

Variabel lingkungan server: `BLOB_READ_WRITE_TOKEN` (dari Vercel Blob), `GURU_SANDI`, `JP_RAHASIA`.

## Panduan pengenalan

`assets/pandu.js` menampilkan panduan langkah demi langkah untuk pengguna baru: layar meredup, satu bagian disorot,
dan Si Nasi menjelaskan fungsinya. Panduan muncul otomatis sekali di beranda, peta asesmen, awal pos, tiap jenis
permainan, Cek Bekal, Ujian, dan tiap kegiatan media 3D. Tombol tanda tanya mengulang panduan kapan saja.

## Dipakai tanpa internet dan dipasang sebagai aplikasi

`sw.js` menyimpan setiap berkas yang pernah dibuka, sehingga situs tetap berjalan saat internet putus.
Tombol "Simpan untuk tanpa internet" di beranda mengunduh semua halaman, mesin 3D, dan rekaman suara sekaligus.
Dengan `manifest.webmanifest`, situs dapat dipasang ke layar utama HP atau laptop seperti aplikasi.

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

lalu buka `http://localhost:8000`. Untuk mencoba akun siswa dan dasbor guru di laptop, jalankan `GURU_SANDI=coba node tools/dev.js`
(data disimpan di folder sementara).

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
