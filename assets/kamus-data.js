/* Kamus Pencernaan: istilah penting dengan penjelasan singkat untuk siswa kelas 5 */
(function () {
  'use strict';
  var K = [
    ['Mulut', 'Organ', 'Pintu masuk makanan. Di sini makanan pertama kali dicerna oleh gigi dan air liur.', 'gigo'],
    ['Gigi', 'Organ', 'Alat pengunyah di dalam mulut. Gigi seri memotong, gigi taring merobek, dan gigi geraham menghaluskan makanan.', 'gigo'],
    ['Lidah', 'Organ', 'Otot di dalam mulut yang mengaduk makanan, mengecap rasa, dan membantu menelan.'],
    ['Kerongkongan', 'Organ', 'Saluran berotot yang menghubungkan mulut dengan lambung. Nama lainnya esofagus.', 'kero'],
    ['Lambung', 'Organ', 'Kantong berotot mirip huruf J yang mengaduk makanan sampai menjadi bubur dan membunuh kuman dengan asam.', 'lambu'],
    ['Usus halus', 'Organ', 'Saluran panjang berkelok tempat makanan dicerna sampai halus dan sari makanannya diserap ke dalam darah.', 'hali'],
    ['Usus besar', 'Organ', 'Saluran yang menyerap air dari sisa makanan sehingga sisa makanan menjadi padat. Nama lainnya kolon.', 'kolo'],
    ['Rektum', 'Organ', 'Ujung usus besar, tempat feses disimpan sementara sebelum dikeluarkan.'],
    ['Anus', 'Organ', 'Lubang tempat feses keluar dari tubuh. Otot sfingter mengatur kapan anus membuka.'],
    ['Hati', 'Organ tambahan', 'Organ dalam terbesar di tubuh. Makanan tidak melewatinya, tetapi hati membuat cairan empedu.', 'tiha'],
    ['Kantong empedu', 'Organ tambahan', 'Kantong kecil di bawah hati yang menyimpan cairan empedu.'],
    ['Pankreas', 'Organ tambahan', 'Organ di belakang lambung yang membuat getah pankreas berisi enzim amilase, tripsin, dan lipase.'],
    ['Air liur', 'Enzim dan cairan', 'Cairan di mulut yang membasahi makanan dan mengandung enzim ptialin.'],
    ['Enzim', 'Enzim dan cairan', 'Zat yang membantu mengubah makanan menjadi zat yang lebih sederhana supaya bisa diserap tubuh.'],
    ['Ptialin', 'Enzim dan cairan', 'Enzim di dalam air liur yang mengubah zat tepung menjadi gula. Nama lainnya amilase ludah.'],
    ['Asam lambung', 'Enzim dan cairan', 'Cairan asam di lambung yang membunuh kuman yang ikut masuk bersama makanan.'],
    ['Pepsin', 'Enzim dan cairan', 'Enzim di lambung yang memecah protein, misalnya dari telur, ikan, dan daging.'],
    ['Cairan empedu', 'Enzim dan cairan', 'Cairan hijau kekuningan buatan hati yang memecah lemak menjadi butiran kecil.'],
    ['Getah pankreas', 'Enzim dan cairan', 'Cairan dari pankreas yang dialirkan ke usus halus dan berisi tiga enzim pencerna.'],
    ['Lipase', 'Enzim dan cairan', 'Enzim dari pankreas yang memecah lemak.'],
    ['Tripsin', 'Enzim dan cairan', 'Enzim dari pankreas yang memecah protein.'],
    ['Pencernaan mekanik', 'Proses', 'Memecah makanan menjadi potongan lebih kecil dengan gerakan, misalnya dikunyah gigi atau diremas lambung.'],
    ['Pencernaan kimiawi', 'Proses', 'Mengubah zat makanan menjadi zat yang lebih sederhana dengan bantuan enzim.'],
    ['Gerak peristaltik', 'Proses', 'Gerakan otot saluran pencernaan yang meremas bergantian untuk mendorong makanan.', 'kero'],
    ['Bolus', 'Proses', 'Gumpalan makanan lembut yang sudah dikunyah dan dibasahi air liur, siap ditelan.', 'nasi'],
    ['Epiglotis', 'Proses', 'Katup di pangkal tenggorokan yang menutup jalan napas saat kita menelan.'],
    ['Jonjot usus', 'Proses', 'Tonjolan halus di dinding usus halus yang menyerap sari makanan. Nama lainnya vili.', 'hali'],
    ['Sari makanan', 'Proses', 'Zat makanan yang sudah dicerna halus dan siap diserap ke dalam darah untuk memberi tenaga.'],
    ['Feses', 'Proses', 'Sisa makanan yang sudah padat dan dikeluarkan lewat anus.'],
    ['Serat', 'Kesehatan', 'Bagian sayur dan buah yang tidak dicerna tetapi membuat buang air besar lancar.'],
    ['Sembelit', 'Kesehatan', 'Susah buang air besar karena feses keras. Biasanya karena kurang serat dan kurang minum.'],
    ['Diare', 'Kesehatan', 'Buang air besar cair dan sering, biasanya karena kuman dari makanan atau tangan yang kotor.', 'kuman'],
    ['Maag', 'Kesehatan', 'Rasa perih di lambung, sering muncul kalau makan tidak teratur.']
  ].map(function (r, i) { return { id: 'k' + (i + 1), istilah: r[0], kategori: r[1], arti: r[2], tokoh: r[3] || null }; });
  window.JP_KAMUS = K;
})();
