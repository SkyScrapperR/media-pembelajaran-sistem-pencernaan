/* Menyusun daftar rekaman untuk asesmen dari assets/soal.js.
   Pemakaian: node tools/suara_asesmen.js > asesmen.json */
global.window = {};
require('../assets/soal.js');
const S = window.JP_SOAL;
const out = {};
S.DIAG.forEach(q => { out['diag-' + q.id] = S.teksBaca(q); });
S.POS.forEach(p => { out['pos-' + p.no] = S.teksPos(p); });
S.UJIAN.forEach(q => { out['ujian-' + q.id] = S.teksBaca(q); });
Object.keys(S.NASI).forEach(k => S.NASI[k].forEach((t, i) => {
  out['nasi-' + k + '-' + (i + 1)] = { teks: t, voice: 'id-ID-GadisNeural', pitch: '+28Hz', rate: '+6%' };
}));
process.stdout.write(JSON.stringify(out, null, 1));
