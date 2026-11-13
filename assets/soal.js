/* Bank soal asesmen: satu sumber untuk permainan, kisi-kisi, kunci jawaban, dan pedoman penskoran */
(function () {
  'use strict';
  var TP = [
    'Menyebutkan organ-organ pencernaan manusia beserta letaknya di dalam tubuh.',
    'Menjelaskan fungsi setiap organ pencernaan, termasuk organ tambahan (hati, kantong empedu, dan pankreas).',
    'Mengurutkan perjalanan makanan dari mulut sampai anus dan menjelaskan proses di setiap organ.',
    'Membedakan pencernaan mekanik dan pencernaan kimiawi beserta contohnya.',
    'Menjelaskan cara menjaga kesehatan organ pencernaan dalam kebiasaan sehari-hari.'
  ];
  var IDENTITAS = [
    ['Jenjang', 'Sekolah Dasar, Kelas V (Fase C)'],
    ['Mata pelajaran', 'Ilmu Pengetahuan Alam dan Sosial (IPAS)'],
    ['Materi', 'Sistem pencernaan manusia'],
    ['Sasaran', 'Peserta didik kelas V, usia 10 sampai 11 tahun'],
    ['Aplikasi', 'Jelajah Pencernaan, aplikasi web (HTML, CSS, JavaScript) yang dibuka lewat peramban'],
    ['Jenis asesmen', 'Diagnostik (Cek Bekal), formatif (Pos Pemeriksaan), sumatif (Ujian Akhir Penjelajah)']
  ];

  /* ---------- DIAGNOSTIK: pilihan ganda + tingkat keyakinan, tanpa nilai ---------- */
  var DIAG = [
    { id: 'D1', tp: 3, kog: 'C2', indikator: 'Menentukan jalur makanan setelah ditelan', mis: 'Makanan dianggap masuk ke saluran napas atau langsung ke perut tanpa saluran.',
      q: 'Setelah ditelan, nasi dari mulut menuju ke mana?', opsi: ['Ke lambung melalui kerongkongan', 'Ke paru-paru melalui tenggorokan', 'Langsung ke usus besar', 'Ke hati'], kunci: 0,
      saran: 'Ikuti tahap 1 dan 2 di Perjalanan Nasi.' },
    { id: 'D2', tp: 2, kog: 'C2', indikator: 'Membedakan saluran pencernaan dan organ tambahan', mis: 'Hati dan pankreas dianggap ikut dilewati makanan.',
      q: 'Apakah makanan melewati hati dan pankreas?', opsi: ['Ya, makanan lewat hati lalu pankreas', 'Tidak, keduanya hanya mengirim cairan pencerna ke usus halus', 'Hanya lewat hati', 'Hanya lewat pankreas'], kunci: 1,
      saran: 'Ketuk hati, kantong empedu, dan pankreas di Jelajah Tubuh.' },
    { id: 'D3', tp: 2, kog: 'C2', indikator: 'Menentukan tempat penyerapan sari makanan', mis: 'Sari makanan dianggap diserap di lambung.',
      q: 'Di organ mana sari makanan paling banyak diserap ke dalam darah?', opsi: ['Lambung', 'Usus halus', 'Usus besar', 'Mulut'], kunci: 1,
      saran: 'Amati titik kuning pada tahap 4 Perjalanan Nasi.' },
    { id: 'D4', tp: 4, kog: 'C2', indikator: 'Menentukan tempat pencernaan pertama kali terjadi', mis: 'Pencernaan dianggap baru dimulai di lambung.',
      q: 'Di mana makanan pertama kali dicerna?', opsi: ['Di mulut', 'Di lambung', 'Di usus halus', 'Di kerongkongan'], kunci: 0,
      saran: 'Ketuk mulut di Jelajah Tubuh dan baca tentang gigi serta air liur.' },
    { id: 'D5', tp: 2, kog: 'C2', indikator: 'Menjelaskan tugas utama usus besar', mis: 'Usus besar dianggap tempat utama penyerapan sari makanan.',
      q: 'Apa tugas utama usus besar?', opsi: ['Menyerap air dari sisa makanan', 'Menyerap sari makanan', 'Menghancurkan makanan dengan asam', 'Menghasilkan cairan empedu'], kunci: 0,
      saran: 'Amati tetes biru pada tahap 5 Perjalanan Nasi.' },
    { id: 'D6', tp: 4, kog: 'C2', indikator: 'Menggolongkan contoh pencernaan mekanik', mis: 'Mengunyah belum dianggap sebagai pencernaan, atau tertukar dengan pencernaan kimiawi.',
      q: 'Mengunyah nasi dengan gigi termasuk pencernaan apa?', opsi: ['Pencernaan mekanik', 'Pencernaan kimiawi', 'Bukan pencernaan', 'Penyerapan'], kunci: 0,
      saran: 'Baca bagian jenis pencernaan pada organ mulut dan lambung di Jelajah Tubuh.' }
  ];
  var KATEGORI = {
    paham: { n: 'Sudah paham', ket: 'Jawaban benar dan yakin', warna: 'good' },
    ragu: { n: 'Perlu dimantapkan', ket: 'Jawaban benar tetapi ragu', warna: 'sun' },
    belum: { n: 'Belum tahu', ket: 'Jawaban salah dan ragu', warna: '' },
    mis: { n: 'Miskonsepsi', ket: 'Jawaban salah tetapi yakin', warna: 'bad' }
  };

  /* ---------- FORMATIF: 6 pos permainan dengan umpan balik langsung ---------- */
  var POS = [
    { no: 1, organ: 'Mulut', judul: 'Pilah Pencernaan', jenis: 'pilah', tp: 4, kog: 'C2', bentuk: 'Menggolongkan (geser kartu)', butir: 6,
      indikator: 'Menggolongkan contoh peristiwa ke dalam pencernaan mekanik atau kimiawi',
      petunjuk: 'Geser kartu ke kiri untuk pencernaan mekanik, ke kanan untuk pencernaan kimiawi. Bisa juga memakai tombol.',
      kiri: 'Mekanik', kanan: 'Kimiawi',
      kartu: [
        { t: 'Gigi mengunyah nasi', k: 'kiri', why: 'Mengunyah memecah makanan dengan gerakan, tanpa mengubah zatnya.' },
        { t: 'Enzim ptialin mengubah zat tepung menjadi gula', k: 'kanan', why: 'Enzim mengubah zat makanan menjadi zat lain yang lebih sederhana.' },
        { t: 'Otot lambung meremas dan mengaduk makanan', k: 'kiri', why: 'Meremas dan mengaduk adalah gerakan, jadi termasuk mekanik.' },
        { t: 'Enzim pepsin memecah protein', k: 'kanan', why: 'Pepsin adalah enzim di lambung yang mengubah protein.' },
        { t: 'Gigi seri memotong apel', k: 'kiri', why: 'Memotong hanya mengecilkan ukuran makanan.' },
        { t: 'Enzim lipase memecah lemak', k: 'kanan', why: 'Lipase adalah enzim dari pankreas yang mengubah lemak.' }
      ] },
    { no: 2, organ: 'Kerongkongan', judul: 'Susun Rute Nasi', jenis: 'rute', tp: 3, kog: 'C3', bentuk: 'Mengurutkan (ketuk berurutan)', butir: 7,
      indikator: 'Mengurutkan organ yang dilewati makanan dan mengenali organ yang tidak dilewati',
      petunjuk: 'Ketuk organ sesuai urutan yang dilewati makanan. Hati-hati, ada organ yang tidak dilewati makanan.',
      urutan: ['Mulut', 'Kerongkongan', 'Lambung', 'Usus halus', 'Usus besar', 'Rektum', 'Anus'],
      pengecoh: { 'Hati': 'Hati tidak dilewati makanan. Hati hanya mengirim cairan empedu.', 'Pankreas': 'Pankreas tidak dilewati makanan. Pankreas hanya mengirim getah pankreas.' } },
    { no: 3, organ: 'Lambung', judul: 'Siapa Aku?', jenis: 'tebak', tp: 2, kog: 'C2', bentuk: 'Teka-teki dengan petunjuk bertahap', butir: 4,
      indikator: 'Mengenali organ pencernaan berdasarkan ciri dan fungsinya',
      petunjuk: 'Baca petunjuknya lalu tebak organnya. Makin sedikit petunjuk yang kamu buka, makin banyak poinnya.',
      pilihan: ['Mulut', 'Kerongkongan', 'Lambung', 'Hati', 'Kantong empedu', 'Pankreas', 'Usus halus', 'Usus besar'],
      teka: [
        { j: 'Lambung', c: ['Dindingku dilapisi lendir tebal supaya tidak rusak oleh cairanku sendiri.', 'Aku meremas dan mengaduk makanan sampai menjadi bubur.', 'Bentukku kantong mirip huruf J, dan asamku membunuh kuman.'] },
        { j: 'Hati', c: ['Makanan tidak pernah melewatiku, tetapi aku ikut membantu.', 'Aku organ dalam terbesar di tubuhmu.', 'Aku membuat cairan empedu yang memecah lemak.'] },
        { j: 'Usus halus', c: ['Pada orang dewasa, panjangku bisa sekitar enam meter.', 'Dindingku punya sangat banyak jonjot.', 'Di dalamku sari makanan diserap ke dalam darah.'] },
        { j: 'Kerongkongan', c: ['Makanan hanya melewatiku sekitar sepuluh detik.', 'Ototku meremas bergantian. Namanya gerak peristaltik.', 'Aku saluran yang menghubungkan mulut dengan lambung.'] }
      ] },
    { no: 4, organ: 'Usus Halus', judul: 'Jodohkan Tugasnya', jenis: 'jodoh', tp: 2, kog: 'C2', bentuk: 'Menjodohkan', butir: 5,
      indikator: 'Memasangkan organ atau bagian organ dengan fungsinya',
      petunjuk: 'Ketuk satu nama di kiri, lalu ketuk tugasnya di kanan.',
      pasangan: [
        ['Hati', 'Membuat cairan empedu'],
        ['Kantong empedu', 'Menyimpan cairan empedu'],
        ['Pankreas', 'Membuat getah berisi amilase, tripsin, dan lipase'],
        ['Jonjot usus', 'Menyerap sari makanan ke dalam darah'],
        ['Air liur', 'Membasahi makanan dan mengubah zat tepung menjadi gula']
      ] },
    { no: 5, organ: 'Usus Besar', judul: 'Sehat atau Bermasalah?', jenis: 'pilah', tp: 5, kog: 'C3', bentuk: 'Menggolongkan (geser kartu)', butir: 8,
      indikator: 'Menilai kebiasaan sehari-hari yang baik atau buruk bagi pencernaan',
      petunjuk: 'Geser kartu ke kiri jika kebiasaan itu bisa membuat pencernaan bermasalah, ke kanan jika baik untuk pencernaan.',
      kiri: 'Bermasalah', kanan: 'Sehat',
      kartu: [
        { t: 'Minum air putih yang cukup', k: 'kanan', why: 'Air membantu sisa makanan tetap lunak sehingga mudah dikeluarkan.' },
        { t: 'Makan sayur dan buah setiap hari', k: 'kanan', why: 'Serat pada sayur dan buah melancarkan buang air besar.' },
        { t: 'Mengunyah makanan sampai halus', k: 'kanan', why: 'Makanan yang halus lebih mudah dicerna lambung dan usus.' },
        { t: 'Mencuci tangan sebelum makan', k: 'kanan', why: 'Tangan bersih mencegah kuman ikut masuk bersama makanan.' },
        { t: 'Sering menahan buang air besar', k: 'kiri', why: 'Feses yang ditahan makin keras dan sulit dikeluarkan.' },
        { t: 'Makan sambil berbicara dan tertawa', k: 'kiri', why: 'Makanan bisa masuk ke jalan napas sehingga tersedak.' },
        { t: 'Jarang minum air putih', k: 'kiri', why: 'Kurang minum membuat feses keras.' },
        { t: 'Menelan makanan tanpa dikunyah', k: 'kiri', why: 'Potongan besar memberatkan kerja lambung.' }
      ] },
    { no: 6, organ: 'Rektum dan Anus', judul: 'Tunjuk Organnya', jenis: 'tunjuk', tp: 1, kog: 'C3', bentuk: 'Menunjuk bagian pada gambar', butir: 6,
      indikator: 'Menunjukkan letak organ pada gambar berdasarkan proses yang terjadi di dalamnya',
      petunjuk: 'Baca peristiwanya, lalu ketuk organ yang tepat pada gambar tubuh.',
      tanya: [
        { t: 'Di sini makanan diremas sampai menjadi bubur dan kuman dibunuh oleh asam.', j: 'lambung' },
        { t: 'Di sini gigi memotong dan menghaluskan makanan.', j: 'mulut' },
        { t: 'Di sini sari makanan diserap ke dalam darah.', j: 'ususHalus' },
        { t: 'Organ ini membuat cairan empedu.', j: 'hati' },
        { t: 'Di sini air diserap sehingga sisa makanan menjadi padat.', j: 'ususBesar' },
        { t: 'Saluran ini mendorong makanan ke lambung dengan gerak peristaltik.', j: 'kerongkongan' }
      ] }
  ];
  var NAMA_ORGAN = { mulut: 'Mulut', kerongkongan: 'Kerongkongan', lambung: 'Lambung', hati: 'Hati', empedu: 'Kantong empedu', pankreas: 'Pankreas', ususHalus: 'Usus halus', ususBesar: 'Usus besar', anus: 'Rektum dan anus' };

  /* ---------- SUMATIF: 15 butir, skor maksimum 100 ---------- */
  var UJIAN = [
    { id: 'S1', tipe: 'pg', tp: 1, kog: 'C1', skor: 6, indikator: 'Menyebutkan organ berdasarkan letaknya', q: 'Organ pencernaan yang terletak di antara kerongkongan dan usus halus adalah…', opsi: ['Lambung', 'Hati', 'Usus besar', 'Pankreas'], kunci: 0, bahas: 'Makanan dari kerongkongan masuk ke lambung, lalu ke usus halus.' },
    { id: 'S2', tipe: 'pg', tp: 1, kog: 'C2', skor: 6, indikator: 'Menyebutkan letak organ tambahan', q: 'Kantong kecil berwarna hijau yang menempel di bawah hati adalah…', opsi: ['Pankreas', 'Kantong empedu', 'Usus buntu', 'Rektum'], kunci: 1, bahas: 'Kantong empedu menempel di bawah hati dan menyimpan cairan empedu.' },
    { id: 'S3', tipe: 'pg', tp: 2, kog: 'C2', skor: 6, indikator: 'Menjelaskan fungsi asam lambung', q: 'Asam lambung berfungsi untuk…', opsi: ['Menyerap sari makanan', 'Membunuh kuman yang ikut masuk bersama makanan', 'Mengubah zat tepung menjadi gula', 'Menyerap air'], kunci: 1, bahas: 'Asam lambung membunuh kuman di dalam makanan.' },
    { id: 'S4', tipe: 'pg', tp: 2, kog: 'C2', skor: 6, indikator: 'Menjelaskan fungsi jonjot usus', q: 'Jonjot usus pada dinding usus halus berfungsi untuk…', opsi: ['Meremas makanan', 'Membunuh kuman', 'Menyerap sari makanan ke dalam darah', 'Menyimpan feses'], kunci: 2, bahas: 'Jonjot usus menyerap sari makanan ke dalam darah.' },
    { id: 'S5', tipe: 'pg', tp: 2, kog: 'C3', skor: 6, indikator: 'Menerapkan pengetahuan fungsi organ tambahan pada situasi sehari-hari', q: 'Rina makan gorengan yang berlemak. Cairan yang membantu memecah lemak itu dibuat oleh…', opsi: ['Lambung', 'Hati', 'Usus besar', 'Kerongkongan'], kunci: 1, bahas: 'Hati membuat cairan empedu yang memecah lemak menjadi butiran kecil.' },
    { id: 'S6', tipe: 'pg', tp: 3, kog: 'C2', skor: 6, indikator: 'Menentukan organ berikutnya pada perjalanan makanan', q: 'Setelah menjadi bubur di lambung, makanan menuju ke…', opsi: ['Usus besar', 'Kerongkongan', 'Usus halus', 'Anus'], kunci: 2, bahas: 'Dari lambung, bubur makanan masuk ke usus halus.' },
    { id: 'S7', tipe: 'pg', tp: 3, kog: 'C4', skor: 6, indikator: 'Menganalisis peran gerak peristaltik', q: 'Makanan tetap sampai ke lambung walaupun kita menelan sambil berbaring. Mengapa?', opsi: ['Karena makanan jatuh sendiri', 'Karena otot kerongkongan meremas bergantian dan mendorong makanan', 'Karena lambung menyedot makanan', 'Karena air liur sangat licin'], kunci: 1, bahas: 'Gerak peristaltik otot kerongkongan mendorong makanan ke lambung.' },
    { id: 'S8', tipe: 'pg', tp: 4, kog: 'C2', skor: 6, indikator: 'Menentukan contoh pencernaan kimiawi', q: 'Contoh pencernaan kimiawi adalah…', opsi: ['Gigi geraham menghaluskan makanan', 'Lambung mengaduk makanan', 'Enzim ptialin mengubah zat tepung menjadi gula', 'Lidah mendorong makanan'], kunci: 2, bahas: 'Pencernaan kimiawi mengubah zat makanan dengan bantuan enzim.' },
    { id: 'S9', tipe: 'pg', tp: 4, kog: 'C4', skor: 6, indikator: 'Menganalisis peristiwa sehari-hari yang menunjukkan pencernaan kimiawi', q: 'Nasi yang dikunyah lama terasa agak manis. Peristiwa ini menunjukkan bahwa…', opsi: ['Di mulut terjadi pencernaan kimiawi oleh enzim ptialin', 'Gigi mengeluarkan gula', 'Nasi bercampur dengan asam lambung', 'Lidah menambahkan rasa manis'], kunci: 0, bahas: 'Ptialin dalam air liur mengubah zat tepung pada nasi menjadi gula.' },
    { id: 'S10', tipe: 'pg', tp: 5, kog: 'C3', skor: 6, indikator: 'Menentukan tindakan untuk menjaga kesehatan pencernaan', q: 'Beberapa hari ini feses Dimas keras dan sulit dikeluarkan. Sebaiknya Dimas…', opsi: ['Mengurangi minum air putih', 'Makan sayur dan buah serta cukup minum air putih', 'Menahan buang air besar', 'Makan lebih cepat'], kunci: 1, bahas: 'Serat dan air membuat feses lunak sehingga mudah dikeluarkan.' },
    { id: 'S11', tipe: 'pgk', tp: 2, kog: 'C2', skor: 8, indikator: 'Mengidentifikasi organ tambahan yang tidak dilewati makanan', q: 'Pilih semua organ yang membantu pencernaan tetapi tidak dilewati makanan.', opsi: ['Hati', 'Lambung', 'Pankreas', 'Usus besar'], kunci: [0, 2], bahas: 'Hati dan pankreas adalah organ tambahan. Lambung dan usus besar dilewati makanan.' },
    { id: 'S12', tipe: 'pgk', tp: 5, kog: 'C3', skor: 8, indikator: 'Memilih kebiasaan yang menjaga kesehatan pencernaan', q: 'Pilih semua kebiasaan yang baik untuk kesehatan pencernaan.', opsi: ['Mengunyah makanan sampai halus', 'Sering menahan buang air besar', 'Minum air putih yang cukup', 'Makan sayur dan buah'], kunci: [0, 2, 3], bahas: 'Menahan buang air besar membuat feses keras. Tiga kebiasaan lainnya baik untuk pencernaan.' },
    { id: 'S13', tipe: 'jodoh', tp: 2, kog: 'C2', skor: 8, indikator: 'Memasangkan organ saluran pencernaan dengan proses utamanya', q: 'Pasangkan setiap organ dengan proses utama yang terjadi di dalamnya.',
      pasangan: [['Mulut', 'Makanan dikunyah dan dibasahi air liur'], ['Lambung', 'Makanan diaduk sampai menjadi bubur'], ['Usus halus', 'Sari makanan diserap ke dalam darah'], ['Usus besar', 'Air diserap dari sisa makanan']], bahas: 'Setiap organ punya tugas utama yang berbeda di sepanjang saluran pencernaan.' },
    { id: 'S14', tipe: 'urut', tp: 3, kog: 'C3', skor: 8, indikator: 'Mengurutkan organ yang dilewati makanan', q: 'Urutkan organ yang dilewati makanan, mulai dari yang pertama.', urutan: ['Mulut', 'Kerongkongan', 'Lambung', 'Usus halus', 'Usus besar', 'Anus'], bahas: 'Urutannya: mulut, kerongkongan, lambung, usus halus, usus besar, anus.' },
    { id: 'S15', tipe: 'isian', tp: 3, kog: 'C1', skor: 8, indikator: 'Menyebutkan nama gerakan otot kerongkongan', q: 'Gerakan meremas otot kerongkongan yang mendorong makanan ke lambung disebut gerak…', kunci: 'peristaltik', bahas: 'Gerakan itu disebut gerak peristaltik.' }
  ];
  var PEDOMAN = {
    pg: 'Jawaban benar mendapat skor penuh (6). Jawaban salah atau kosong mendapat 0.',
    pgk: 'Setiap pilihan yang diperlakukan dengan tepat (dicentang bila benar, dibiarkan bila salah) mendapat 2 poin. Skor maksimum 8.',
    jodoh: 'Setiap pasangan yang tepat mendapat 2 poin. Skor maksimum 8.',
    urut: 'Semua urutan tepat mendapat 8. Jika belum semua tepat, setiap organ pada posisi yang benar mendapat 1 poin.',
    isian: 'Jawaban tepat mendapat 8. Jawaban dengan ejaan kurang tepat tetapi maksudnya jelas (misalnya "peristaltic") mendapat 6. Jawaban lain mendapat 0.'
  };
  var KKTP = 75;
  function predikat(n) { return n >= 90 ? 'Sangat baik' : n >= KKTP ? 'Baik' : n >= 60 ? 'Cukup' : 'Perlu bimbingan'; }

  /* kalimat Si Nasi (direkam saat build dengan suara anak yang ceria) */
  var NASI = {
    halo: ['Halo! Aku Si Nasi. Temani aku menjelajah perut, yuk!', 'Hihi, geli! Ayo kita mulai petualangannya!', 'Tahukah kamu? Perjalananku dari mulut sampai anus bisa satu sampai tiga hari, lho!', 'Jangan lupa kunyah makananmu sampai halus, ya!'],
    sempurna: ['Wah, sempurna! Kamu memang penjelajah sejati!', 'Luar biasa! Tiga bintang untukmu!'],
    bagus: ['Bagus sekali! Sedikit lagi kamu bisa dapat tiga bintang.', 'Hebat! Ayo coba lagi supaya bintangnya penuh.'],
    coba: ['Tidak apa-apa, belajar memang begitu. Ayo coba sekali lagi!', 'Hampir! Baca lagi materinya, lalu kita coba lagi, ya.'],
    lulus: ['Selamat! Kamu berhasil menuntaskan ujian. Ini sertifikatmu!'],
    belum: ['Jangan menyerah! Ayo belajar lagi, lalu kita ulangi ujiannya bersama.'],
    diag: ['Terima kasih sudah menjawab dengan jujur. Sekarang kita tahu bagian mana yang perlu dipelajari.'],
    naik: ['Yeay, kamu naik tingkat! Teruskan petualanganmu!']
  };
  /* teks yang dibacakan tombol Dengarkan; dipakai juga saat membuat rekaman */
  function teksBaca(q) { return q.q + (q.opsi ? ' Pilihannya: ' + q.opsi.join('; ') + '.' : ''); }
  function teksPos(p) { return p.judul + '. ' + p.petunjuk; }
  window.JP_SOAL = { NASI: NASI, teksBaca: teksBaca, teksPos: teksPos, TP: TP, IDENTITAS: IDENTITAS, DIAG: DIAG, KATEGORI: KATEGORI, POS: POS, NAMA_ORGAN: NAMA_ORGAN, UJIAN: UJIAN, PEDOMAN: PEDOMAN, KKTP: KKTP, predikat: predikat };
})();
