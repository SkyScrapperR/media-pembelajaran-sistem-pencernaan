/* Data materi Jelajah Pencernaan: organ, tahap perjalanan, dan teks narasi */
(function () {
  /* ================= DATA MATERI ================= */
  var ORGANS = [
    { id: 'mulut', n: 'Mulut', col: '#e8707f', kind: 'saluran', no: 1, jenis: 'Pencernaan mekanik dan kimiawi', anchor: [0, 7.05, 1.05],
      facts: ['Gigi seri memotong, gigi taring merobek, dan gigi geraham menghaluskan makanan.', 'Lidah mengaduk makanan, mengecap rasa, dan membantu menelan.', 'Air liur membasahi makanan. Enzim ptialin di dalamnya mengubah zat tepung menjadi gula.'],
      wow: 'Kunyah nasi lama-lama, rasanya jadi agak manis. Itu tanda enzim ptialin sedang bekerja!',
      think: 'Apa jadinya kalau kita menelan nasi tanpa mengunyahnya?' },
    { id: 'kerongkongan', n: 'Kerongkongan', aka: 'esofagus', col: '#e9a090', kind: 'saluran', no: 2, jenis: 'Tidak terjadi pencernaan', anchor: [0, 5.0, -0.32],
      facts: ['Saluran berotot yang menghubungkan mulut dengan lambung, panjangnya sekitar 25 cm pada orang dewasa.', 'Makanan didorong ke bawah oleh gerak peristaltik, yaitu otot yang meremas bergantian seperti memeras pasta gigi.', 'Saat menelan, epiglotis menutup jalan napas supaya makanan tidak masuk ke paru-paru.'],
      wow: 'Berkat gerak peristaltik, astronaut tetap bisa menelan makanan di luar angkasa.',
      think: 'Mengapa kita bisa tersedak kalau makan sambil berbicara?' },
    { id: 'lambung', n: 'Lambung', col: '#e6857a', kind: 'saluran', no: 3, jenis: 'Pencernaan mekanik dan kimiawi', anchor: [1.3, 2.55, 0.5],
      facts: ['Kantong berotot yang meremas dan mengaduk makanan sampai menjadi bubur.', 'Asam lambung (HCl) membunuh kuman di dalam makanan.', 'Enzim pepsin memecah protein, dan enzim renin menggumpalkan protein susu.'],
      wow: 'Dinding lambung dilapisi lendir tebal, jadi lambung tidak ikut rusak oleh asamnya sendiri.',
      think: 'Apa yang terjadi kalau dinding lambung tidak punya lapisan lendir?' },
    { id: 'hati', n: 'Hati', col: '#9a3a2c', kind: 'tambahan', jenis: 'Membantu pencernaan', anchor: [-1.0, 3.25, 0.7],
      facts: ['Menghasilkan cairan empedu.', 'Cairan empedu memecah lemak menjadi butiran kecil agar mudah dicerna.', 'Makanan tidak melewati hati. Hati membantu dari samping.'],
      wow: 'Hati adalah organ dalam terbesar di tubuh. Beratnya sekitar 1,5 kg pada orang dewasa.',
      think: 'Mengapa makanan berlemak seperti gorengan butuh bantuan cairan empedu?' },
    { id: 'empedu', n: 'Kantong Empedu', col: '#4f9a46', kind: 'tambahan', jenis: 'Membantu pencernaan', anchor: [-0.7, 2.05, 0.85],
      facts: ['Menyimpan cairan empedu yang dibuat oleh hati.', 'Mengalirkan empedu ke usus dua belas jari saat ada makanan berlemak.'],
      wow: 'Cairan empedu berwarna hijau kekuningan. Zat warnanya ikut membuat feses berwarna cokelat.',
      think: 'Kalau kamu makan gorengan, organ mana saja yang ikut sibuk selain lambung?' },
    { id: 'pankreas', n: 'Pankreas', col: '#e7b86c', kind: 'tambahan', jenis: 'Membantu pencernaan', anchor: [0.9, 1.7, -0.5],
      facts: ['Letaknya di belakang lambung.', 'Menghasilkan getah pankreas yang dialirkan ke usus dua belas jari.', 'Enzim amilase mengubah zat tepung menjadi gula, tripsin memecah protein, dan lipase memecah lemak.'],
      wow: 'Pankreas juga membuat hormon insulin yang mengatur kadar gula darah.',
      think: 'Makanan tidak lewat pankreas. Lalu bagaimana enzimnya bisa sampai ke makanan?' },
    { id: 'ususHalus', n: 'Usus Halus', col: '#f2aaa2', kind: 'saluran', no: 4, jenis: 'Pencernaan kimiawi dan penyerapan', anchor: [0.15, 0.25, 0.75],
      facts: ['Saluran panjang yang berkelok-kelok, pada orang dewasa bisa sekitar 6 meter.', 'Terdiri atas usus dua belas jari (duodenum), usus kosong (jejunum), dan usus penyerapan (ileum).', 'Jonjot usus (vili) di dinding usus penyerapan menyerap sari makanan ke dalam darah.'],
      wow: 'Lipatan dan jonjot usus halus membuat permukaannya sangat luas, hampir setengah lapangan bulu tangkis!',
      think: 'Mengapa usus halus dibuat sangat panjang dan berlipat-lipat?' },
    { id: 'ususBesar', n: 'Usus Besar', aka: 'kolon', col: '#cf9474', kind: 'saluran', no: 5, jenis: 'Penyerapan air', anchor: [-1.3, 0.55, 0.5],
      facts: ['Menerima sisa makanan yang tidak diserap usus halus.', 'Menyerap air dan mineral, sehingga sisa makanan menjadi padat (feses).', 'Bakteri baik seperti E. coli membusukkan sisa makanan dan menghasilkan vitamin K.', 'Usus buntu (apendiks) menempel di pangkal usus besar.'],
      wow: 'Bunyi “kruuk” saat perut lapar berasal dari gerakan otot saluran pencernaan yang mendorong udara dan cairan.',
      think: 'Apa yang terjadi pada feses kalau kita jarang minum air putih?' },
    { id: 'anus', n: 'Rektum & Anus', col: '#bd6a62', kind: 'saluran', no: 6, jenis: 'Pengeluaran', anchor: [0.05, -1.95, 0.25],
      facts: ['Rektum adalah ujung usus besar, tempat feses disimpan sementara.', 'Saat rektum penuh, kita merasa ingin buang air besar.', 'Anus adalah lubang keluarnya feses. Otot sfingter mengatur kapan anus membuka.'],
      wow: 'Perjalanan makanan dari mulut sampai keluar lewat anus bisa memakan waktu sekitar 1 sampai 3 hari.',
      think: 'Mengapa kita tidak boleh sering menahan buang air besar?' }
  ];
  var BY = {}; ORGANS.forEach(function (o) { BY[o.id] = o; });
  var CLUES = {
    lambung: 'Bentuknya seperti kantong berotot. Isinya sangat asam.',
    hati: 'Organ dalam terbesar di tubuh. Ia membuat cairan empedu.',
    ususHalus: 'Saluran yang sangat panjang dan berkelok-kelok. Di sinilah sari makanan diserap.',
    ususBesar: 'Bentuknya seperti bingkai di sekeliling perut. Ia menyerap air dari sisa makanan.',
    pankreas: 'Bentuknya memanjang dan bergerigi, letaknya di belakang lambung.',
    empedu: 'Kantong kecil berwarna hijau yang menempel di bawah hati.'
  };
  var INTRO_POOL = ['lambung', 'hati', 'ususHalus', 'ususBesar', 'pankreas', 'empedu'];
  var DESC = {
    lambung: 'Kantong berotot yang mengaduk makanan menjadi bubur dan membunuh kuman dengan asam lambung.',
    hati: 'Organ tambahan yang membuat cairan empedu untuk membantu mencerna lemak.',
    ususHalus: 'Tempat makanan dicerna sampai halus dan sari makanannya diserap ke dalam darah.',
    ususBesar: 'Menyerap air dari sisa makanan sehingga terbentuk feses.',
    pankreas: 'Organ tambahan yang membuat enzim amilase, tripsin, dan lipase.',
    empedu: 'Kantong kecil yang menyimpan cairan empedu dari hati.'
  };
  var STAGES = [
    { id: 'mulut', organs: ['mulut'], dur: 6, dist: 4.4, time: 'Sekitar 1 menit', text: 'Gigi mengunyah dan air liur membasahi. Nasi berubah menjadi gumpalan lembut yang disebut bolus.', think: 'Apa jadinya kalau kita menelan nasi tanpa mengunyah?' },
    { id: 'kerongkongan', organs: ['kerongkongan'], dur: 4.5, dist: 5.2, time: 'Sekitar 10 detik', text: 'Otot kerongkongan meremas bergantian (gerak peristaltik) dan mendorong bolus turun ke lambung.', think: 'Mengapa makanan tetap turun walaupun kita makan sambil berbaring?' },
    { id: 'lambung', organs: ['lambung'], dur: 7, dist: 4.6, time: '2 sampai 4 jam', text: 'Makanan diaduk dan dicampur getah lambung sampai menjadi bubur. Asam lambung membunuh kuman.', think: 'Kuman di makanan kebanyakan mati di sini. Zat apa yang membunuhnya?' },
    { id: 'ususHalus', organs: ['ususHalus', 'hati', 'empedu', 'pankreas'], dur: 11, dist: 4.4, time: '3 sampai 5 jam', text: 'Empedu dan getah pankreas ikut mencerna makanan. Sari makanan (titik kuning) diserap jonjot usus ke dalam darah.', think: 'Ke mana sari makanan pergi setelah diserap, dan untuk apa?' },
    { id: 'ususBesar', organs: ['ususBesar'], dur: 9, dist: 5.6, time: '10 jam sampai 2 hari', text: 'Air dan mineral (tetes biru) diserap dari sisa makanan, sehingga sisa makanan menjadi padat (feses).', think: 'Mengapa feses menjadi keras kalau kita kurang minum air putih?' },
    { id: 'anus', organs: ['anus'], dur: 4.5, dist: 3.8, time: 'Sampai terasa ingin buang air besar', text: 'Feses disimpan sebentar di rektum, lalu dikeluarkan melalui anus.', think: 'Mengapa kita tidak boleh sering menahan buang air besar?' }
  ];

  var NARASI = {
    mulut: 'Ini mulut, pintu masuk makanan. Di sinilah makanan pertama kali dicerna. Gigi seri memotong, gigi taring merobek, dan gigi geraham menghaluskan makanan. Lidah membantu mengaduk dan menelan. Air liur membasahi makanan, dan enzim ptialin di dalamnya mengubah zat tepung menjadi gula. Coba pikirkan, apa jadinya kalau kita menelan nasi tanpa mengunyah?',
    kerongkongan: 'Ini kerongkongan, saluran berotot yang menghubungkan mulut dengan lambung. Ototnya meremas bergantian, seperti saat kita memeras pasta gigi. Gerakan ini disebut gerak peristaltik. Saat kita menelan, epiglotis menutup jalan napas, supaya makanan tidak masuk ke paru-paru. Nah, kenapa ya kita bisa tersedak kalau makan sambil berbicara?',
    lambung: 'Ini lambung, kantong berotot yang bentuknya mirip huruf J. Lambung meremas dan mengaduk makanan sampai menjadi bubur. Asam lambung membunuh kuman yang ikut masuk bersama makanan. Enzim pepsin memecah protein, dan enzim renin menggumpalkan protein susu. Hebatnya, dinding lambung dilapisi lendir tebal, jadi tidak ikut rusak oleh asamnya sendiri.',
    hati: 'Ini hati, organ dalam terbesar di tubuh kita. Makanan tidak lewat sini, tetapi hati membantu dari samping. Hati membuat cairan empedu, yang memecah lemak menjadi butiran kecil supaya mudah dicerna. Jadi, saat kamu makan gorengan, hati ikut sibuk bekerja.',
    empedu: 'Ini kantong empedu, kantong kecil berwarna hijau yang menempel di bawah hati. Tugasnya menyimpan cairan empedu yang dibuat oleh hati. Saat ada makanan berlemak, kantong empedu mengalirkan empedu ke usus dua belas jari.',
    pankreas: 'Ini pankreas. Letaknya di belakang lambung. Pankreas membuat getah pankreas yang berisi tiga enzim. Amilase mengubah zat tepung menjadi gula, tripsin memecah protein, dan lipase memecah lemak. Pankreas juga membuat hormon insulin, yang mengatur kadar gula di dalam darah.',
    ususHalus: 'Ini usus halus, saluran panjang yang berkelok-kelok. Pada orang dewasa, panjangnya bisa sekitar enam meter! Usus halus terdiri atas usus dua belas jari, usus kosong, dan usus penyerapan. Dindingnya punya banyak jonjot usus, yang menyerap sari makanan ke dalam darah. Sari makanan inilah yang memberi kita tenaga.',
    ususBesar: 'Ini usus besar. Bentuknya seperti bingkai yang mengelilingi usus halus. Usus besar menyerap air dan mineral dari sisa makanan, sehingga sisa makanan menjadi padat. Bakteri baik di sini membantu membusukkan sisa makanan dan membuat vitamin K. Makanya, kita perlu cukup minum air putih dan makan sayur.',
    anus: 'Ini rektum dan anus, bagian terakhir saluran pencernaan. Rektum menyimpan feses untuk sementara. Saat rektum penuh, kita merasa ingin buang air besar. Feses lalu keluar melalui anus. Ingat ya, jangan sering menahan buang air besar.'
  };
  var STAGE_NARR = [
    'Ayo kita ikuti perjalanan sesuap nasi! Pertama, nasi masuk ke mulut. Gigi mengunyah, dan air liur membasahi nasi, sampai berubah menjadi gumpalan lembut bernama bolus.',
    'Glek! Bolus ditelan dan masuk ke kerongkongan. Otot kerongkongan meremas bergantian, mendorong bolus turun ke lambung. Perjalanan ini hanya sekitar sepuluh detik.',
    'Sekarang bolus sampai di lambung. Lambung mengaduk makanan bersama getah lambung, sampai menjadi bubur. Asam lambung membunuh kuman. Makanan bisa tinggal di sini dua sampai empat jam.',
    'Bubur makanan masuk ke usus halus. Cairan empedu dan getah pankreas ikut mencerna. Lihat titik-titik kuning itu! Itu sari makanan yang diserap jonjot usus ke dalam darah.',
    'Sisa makanan yang tidak terserap masuk ke usus besar. Di sini, air diserap kembali oleh tubuh. Lihat tetesan biru itu. Sisa makanan pun menjadi padat, dan berubah menjadi feses.',
    'Akhirnya, feses disimpan sebentar di rektum, lalu dikeluarkan melalui anus.'
  ];
  var FINISH_NARR = 'Hebat! Kamu sudah mengikuti seluruh perjalanan makanan. Dari mulut sampai anus, perjalanan ini bisa memakan waktu satu sampai tiga hari.';
  window.JP_DATA = { ORGANS: ORGANS, BY: BY, CLUES: CLUES, INTRO_POOL: INTRO_POOL, DESC: DESC, STAGES: STAGES, NARASI: NARASI, STAGE_NARR: STAGE_NARR, FINISH_NARR: FINISH_NARR };
})();
