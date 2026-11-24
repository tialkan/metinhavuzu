// Metin Havuzu · UD etiketleme ekranı
// Etiketler önce tarayıcıda (localStorage) tutulur, sonra etiketleyici adına sunucuya (/kayit/<ad>.conllu) yazılır.
// Sunucudaki dosya ile tarayıcıdaki taslaklar cümle cümle birleştirilir; her cümlede daha yeni olan (# zaman) kalır.
// Kılavuz: kilavuz/KARARLAR.md (sürüm aşağıda).
const KILAVUZ = '0.2';
const UPOS = ['NOUN', 'VERB', 'AUX', 'ADJ', 'ADV', 'PRON', 'PROPN', 'NUM', 'DET', 'ADP', 'CCONJ', 'SCONJ', 'PART', 'INTJ', 'PUNCT', 'SYM', 'X'];
const DEPREL = ['root', 'nsubj', 'obj', 'iobj', 'obl', 'advmod', 'advcl', 'acl', 'amod', 'nmod', 'nmod:poss', 'det', 'case', 'cc', 'conj', 'mark', 'aux', 'cop', 'compound', 'compound:lvc', 'ccomp', 'xcomp', 'csubj', 'nummod', 'flat', 'parataxis', 'discourse', 'vocative', 'appos', 'fixed', 'orphan', 'dislocated', 'punct', 'dep'];
const OZELLIK = ['Case=Nom', 'Case=Acc', 'Case=Dat', 'Case=Loc', 'Case=Abl', 'Case=Gen', 'Case=Ins', 'Case=Equ', 'Number=Sing', 'Number=Plur', 'Person=1', 'Person=2', 'Person=3',
  'Number[psor]=Sing', 'Number[psor]=Plur', 'Person[psor]=1', 'Person[psor]=2', 'Person[psor]=3', 'VerbForm=Part', 'VerbForm=Conv', 'VerbForm=Vnoun', 'Tense=Past', 'Tense=Pres', 'Tense=Fut',
  'Aspect=Perf', 'Aspect=Prog', 'Aspect=Hab', 'Mood=Ind', 'Mood=Imp', 'Mood=Opt', 'Mood=Cnd', 'Mood=Des', 'Evident=Nfh', 'Polarity=Pos', 'Polarity=Neg', 'Voice=Pass', 'Voice=Cau', 'Voice=Rfl', 'Voice=Rcp'];
const HAL = ['', 'Nom', 'Acc', 'Dat', 'Loc', 'Abl', 'Gen', 'Ins', 'Equ', 'uygulanmaz'];
const OKUMA = ['nesir', 'arastirmaci', 'belirsiz'];

const depo = {
  oku(k, v) { try { const x = localStorage.getItem(k); return x ? JSON.parse(x) : v; } catch { return v; } },
  yaz(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch { return false; } },
};
let _kayitli = null;
function kayitli() { if (!_kayitli) _kayitli = V.kayitli_conllu ? conlluOku(V.kayitli_conllu) : {}; return _kayitli; }
function etiketleyici() { return depo.oku('mh:etiketleyici', ''); }
// Eski (sayfa + özet) kimlikleri kalıcı kimliğe çevirir; taslaklar ve içe aktarılan dosyalar için.
let _eski = null;
// 24 Kasım 2026'da birkaç saat yanlış cümle kimliğiyle yayımlanan iki cümle (yalnız etiket kimlikleri; tanık sayfaları etkilenmez).
const CUMLE_TASINDI = { 'cc2.389a.26': 'cc2.389a.27', 'cc2.397a.28': 'cc2.397a.29' };
function cumleKimlik(k) { return CUMLE_TASINDI[k] || yeniKimlik(k); }
function yeniKimlik(k) { if (!_eski) _eski = new Map(window.VERI.satirlar.filter(s => s.eid).map(s => [s.eid, s.id])); return _eski.get(k) || k; }
function tumEtiketler() {
  const t = depo.oku('mh:etiketler', {});
  let degisti = false; const yeni = {};
  for (const [k, e] of Object.entries(t)) {
    const nk = cumleKimlik(k); if (nk !== k) degisti = true;
    if (e.kaynak) { const kk = e.kaynak.map(yeniKimlik); if (kk.join() !== e.kaynak.join()) { e.kaynak = kk; degisti = true; } }
    yeni[nk] = e;
  }
  if (degisti) depo.yaz('mh:etiketler', yeni);
  return yeni;
}
function etiketKaydet(id, e) { const t = tumEtiketler(); t[id] = e; return depo.yaz('mh:etiketler', t); }

// Sözcüklere ayırma: noktalama ayrı, ayraçlar ve kısa çizgi sözcük içinde kalır (tu[v]gan, kėlir-mėn)
function sozcukle(metin) { return (metin.normalize('NFC').match(/[\p{L}\p{M}\[\]'’‘-]+|\d+|[^\s\p{L}\p{M}\d]/gu) || []); }

// Codex Cumanicus satırlarının sırası: aynı derlem + sayfa yarısı içinde okuma sırası (V.satirlar sırası)
function komsuSatir(s, yon) {
  const i = V.satirlar.indexOf(s);
  for (let j = i + yon; j >= 0 && j < V.satirlar.length; j += yon) {
    const x = V.satirlar[j];
    if (x.d === s.d && x.k === s.k) return x;
  }
  return null;
}

function yeniEtiket(s) {
  const satirlar = [s.id];
  const metin = s.t;
  return { kaynak: satirlar, metin, sozcukler: sozcukle(metin).map((f, n) => ({ form: f, lemma: '', upos: /^[^\p{L}\d]$/u.test(f) ? 'PUNCT' : '', feats: '', head: '', deprel: /^[^\p{L}\d]$/u.test(f) ? 'punct' : '', hal: '', isaret: '', okuma: 'nesir', not: '' })), etiketleyici: etiketleyici(), tarih: new Date().toISOString().slice(0, 10), kilavuz: KILAVUZ };
}

function denetle(e) {
  const u = [], n = e.sozcukler.length;
  const kok = e.sozcukler.map((t, i) => i + 1).filter(i => e.sozcukler[i - 1].deprel === 'root');
  if (kok.length !== 1) u.push('Tam olarak bir kök (root) olmalı; şu an ' + kok.length + '.');
  e.sozcukler.forEach((t, i) => {
    const h = t.head === '' ? NaN : Number(t.head);
    if (t.head === '') u.push((i + 1) + ' “' + t.form + '”: baş yok.');
    else if (isNaN(h) || h < 0 || h > n || h === i + 1) u.push((i + 1) + ' “' + t.form + '”: geçersiz baş ' + t.head + '.');
    if (t.deprel === 'root' && h !== 0) u.push((i + 1) + ' “' + t.form + '”: root ise baş 0 olmalı.');
    if (h === 0 && t.deprel !== 'root' && t.head !== '') u.push((i + 1) + ' “' + t.form + '”: baş 0 ise ilişki root olmalı.');
    if (!t.upos) u.push((i + 1) + ' “' + t.form + '”: tür (UPOS) yok.');
  });
  // döngü denetimi
  for (let i = 1; i <= n; i++) {
    const gorulen = new Set(); let k = i;
    while (k > 0 && !gorulen.has(k)) { gorulen.add(k); const h = Number(e.sozcukler[k - 1].head); if (isNaN(h)) break; k = h; }
    if (k > 0 && gorulen.has(k)) { u.push('Döngü var (' + i + ' numaralı sözcükten başlayan).'); break; }
  }
  return u;
}

function conllu(id, e) {
  const misc = t => { const m = []; if (t.hal) m.push('YonetilenHal=' + t.hal); if (t.isaret) m.push('YuzeyIsaret=' + t.isaret.replace(/[|\s]/g, '_')); if (t.okuma) m.push('Okuma=' + t.okuma); if (t.not) m.push('Not=' + t.not.replace(/[|\s=]/g, '_')); if (t.ekMisc) m.push(...t.ekMisc); return m.join('|') || '_'; };
  const BILINEN = new Set(['sent_id', 'text', 'kaynak_satirlar', 'etiketleyici', 'tarih', 'zaman', 'kilavuz']);
  const ek = Object.entries(e.ekMeta || {}).filter(([k]) => !BILINEN.has(k)).map(([k, v]) => '# ' + k + ' = ' + v + '\n').join('');
  return '# sent_id = ' + id + '\n# text = ' + e.sozcukler.map(t => t.form).join(' ') + '\n# kaynak_satirlar = ' + e.kaynak.join(' ') + '\n# etiketleyici = ' + (e.etiketleyici || '?') + '\n# tarih = ' + e.tarih + (e.zaman ? '\n# zaman = ' + e.zaman : '') + '\n# kilavuz = ' + e.kilavuz + '\n' + ek +
    e.sozcukler.map((t, i) => [i + 1, t.form, t.lemma || '_', t.upos || '_', t.xpos || '_', t.feats || '_', t.head === '' ? '_' : t.head, t.deprel || '_', t.deps || '_', misc(t)].join('\t')).join('\n') + '\n';
}

function conlluOku(metin) {
  const out = {};
  for (const blok of metin.trim().split(/\n\s*\n/)) {
    const meta = {}, s = [];
    for (const l of blok.split('\n')) {
      if (l.startsWith('#')) { const m = l.match(/^#\s*(\S+)\s*=\s*(.*)$/); if (m) meta[m[1]] = m[2]; continue; }
      const c = l.split('\t'); if (c.length < 10 || !/^\d+$/.test(c[0])) continue;
      const parca = c[9] === '_' ? [] : c[9].split('|'), TANIDIK = /^(YonetilenHal|YuzeyIsaret|Okuma|Not)=/;
      const misc = Object.fromEntries(parca.filter(x => TANIDIK.test(x)).map(x => [x.slice(0, x.indexOf('=')), x.slice(x.indexOf('=') + 1)]));
      const ekMisc = parca.filter(x => !TANIDIK.test(x));
      s.push({ form: c[1], lemma: c[2] === '_' ? '' : c[2], upos: c[3] === '_' ? '' : c[3], feats: c[5] === '_' ? '' : c[5], head: c[6] === '_' ? '' : c[6], deprel: c[7] === '_' ? '' : c[7], hal: misc.YonetilenHal || '', isaret: (misc.YuzeyIsaret || '').replace(/_/g, ' '), okuma: misc.Okuma || '', not: (misc.Not || '').replace(/_/g, ' '), xpos: c[4] === '_' ? '' : c[4], deps: c[8] === '_' ? '' : c[8], ...(ekMisc.length ? { ekMisc } : {}) });
    }
    if (meta.sent_id && s.length) out[cumleKimlik(meta.sent_id)] = { kaynak: (meta.kaynak_satirlar || meta.sent_id).split(' ').map(yeniKimlik), metin: meta.text, sozcukler: s, etiketleyici: meta.etiketleyici || '', tarih: meta.tarih || '', zaman: meta.zaman || '', kilavuz: meta.kilavuz || '', ekMeta: meta };
  }
  return out;
}

// --- Sunucuda kayıt: /kayit/<ad>.conllu (nginx PUT, site parolasının arkasında; deploy/nginx.conf)
const sunucu = {
  ad(n) { return (n || '').toLocaleLowerCase('tr').replace(/ı/g, 'i').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40); },
  async liste() { const r = await fetch(location.origin + '/kayit/', { cache: 'no-store' }); if (!r.ok) throw new Error('liste ' + r.status); return (await r.json()).filter(f => f.type === 'file' && /^[a-z0-9-]+\.conllu$/.test(f.name) && !f.name.includes('-yedek-')); },
  async oku(dosya) { const r = await fetch(location.origin + '/kayit/' + dosya, { cache: 'no-store' }); if (r.status === 404) return {}; if (!r.ok) throw new Error('okuma ' + r.status); return conlluOku(await r.text()); },
  async yaz(dosya, metin) { const r = await fetch(location.origin + '/kayit/' + dosya, { method: 'PUT', body: metin, headers: { 'Content-Type': 'text/plain; charset=utf-8' } }); if (!r.ok) throw new Error('yazma ' + r.status); },
};
let sunucuDurum = '', _gonder = null;
const GIRIS = '<a href="/kayit/giris">giriş yapın</a>';
// Site herkese açık; etiket kaydı parola ister. Sunucu 401 dönerse giriş bağlantısı gösterilir.
function sunucuDurumYaz(m, hata) {
  const giris = hata && /\b401\b/.test(m);
  sunucuDurum = giris ? 'Sunucuya kaydetmek için giriş gerekli; taslak bu tarayıcıda duruyor.' : m;
  const el = document.getElementById('sunucu-durum'); if (!el) return;
  el.className = 'not' + (hata ? ' bad' : '');
  if (giris) el.innerHTML = 'Sunucuya kaydetmek için ' + GIRIS + '; taslak bu tarayıcıda duruyor.'; else el.textContent = m;
}
// İki etiket kümesini birleştirir: her cümlede zamanı daha yeni olan kalır.
function birlestir(a, b) { const o = { ...a }; for (const [id, e] of Object.entries(b)) if (!o[id] || (e.zaman || '') > (o[id].zaman || '')) o[id] = e; return o; }
// Bu etiketleyicinin sunucudaki dosyasını okur, tarayıcıdaki taslaklarla birleştirir, ikisini de günceller.
async function esitle() {
  const ad = sunucu.ad(etiketleyici());
  if (!ad) { sunucuDurumYaz('Sunucuya kaydetmek için etiketleyici adınızı yazın.', true); return null; }
  const yerel = tumEtiketler();
  const benim = Object.fromEntries(Object.entries(yerel).filter(([, e]) => sunucu.ad(e.etiketleyici) === ad));
  const uzak = await sunucu.oku(ad + '.conllu');
  const uzakMetin = Object.keys(uzak).length ? Object.keys(uzak).map(id => conllu(id, uzak[id])).join('\n') : '';
  const son = birlestir(uzak, benim);
  const metin = Object.keys(son).map(id => conllu(id, son[id])).join('\n');
  await sunucu.yaz(ad + '.conllu', metin);
  // Günlük yedek yalnız günün ilk kaydında, kayıttan önceki hâlle yazılır; sonraki kayıtlar onu ezmez.
  const yedek = ad + '-yedek-' + new Date().toISOString().slice(0, 10) + '.conllu';
  const yedekVar = await fetch(location.origin + '/kayit/' + yedek, { method: 'HEAD', cache: 'no-store' }).then(x => x.ok).catch(() => true);
  if (!yedekVar) await sunucu.yaz(yedek, uzakMetin || metin).catch(() => {});
  depo.yaz('mh:etiketler', birlestir(yerel, son));
  sunucuDurumYaz('Sunucuya kaydedildi: ' + ad + '.conllu, ' + Object.keys(son).length + ' cümle · ' + new Date().toLocaleTimeString('tr'));
  return son;
}
function sunucuyaGonder() { clearTimeout(_gonder); _gonder = setTimeout(() => esitle().catch(err => sunucuDurumYaz('Sunucuya kaydedilemedi (' + err.message + '); taslak bu tarayıcıda duruyor.', true)), 1200); }

function indir(ad, metin) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([metin], { type: 'text/plain;charset=utf-8' }));
  a.download = ad; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
}

// --- Etiketleme sayfası: #/etiketle/<tanık kimliği>
function etiketSayfasi(id, cekildi) {
  const s = kimlik.get(id);
  if (!s) { icerik.innerHTML = '<div class="bos">Bu kimlikte tanık yok: ' + isle(id) + '</div>'; return; }
  // Tarayıcıda taslak yoksa etiketleyicinin sunucudaki kaydına bakılır (başka bilgisayarda yapılmış olabilir).
  if (!cekildi && !tumEtiketler()[id] && sunucu.ad(etiketleyici())) {
    sunucu.oku(sunucu.ad(etiketleyici()) + '.conllu').then(uzak => {
      if (uzak[id]) depo.yaz('mh:etiketler', birlestir(tumEtiketler(), { [id]: uzak[id] }));
    }).catch(() => {}).finally(() => { if (location.hash.startsWith('#/etiketle/')) etiketSayfasi(id, true); });
    icerik.innerHTML = '<p class="not">Sunucudaki kayıtlarınıza bakılıyor…</p>'; return;
  }
  const kayit = kayitli()[id], onIste = /[?&]on=1\b/.test(location.hash);
  // Kör etiketleme: ön etiket yalnız kayıtlı listeden (?on=1) açılır; tanık sayfasından boş tablo gelir.
  let e = tumEtiketler()[id] || (kayit && onIste ? JSON.parse(JSON.stringify(kayit)) : yeniEtiket(s));
  if (!e.ekMeta && kayit && kayit.ekMeta) e.ekMeta = Object.fromEntries(Object.entries(kayit.ekMeta).filter(([k]) => /^latince|^kopya/.test(k)));
  const kaynakNotu = tumEtiketler()[id] ? '' : kayit && onIste ? 'Depodaki kayıtlı etiket açıldı (' + (kayit.etiketleyici || '?') + '). Değiştirdiğinizde sizin taslağınız olur.' : kayit ? 'Bu cümlenin kayıtlı bir ön etiketi var; kör etiketleme için gösterilmiyor.' : '';
  const lat = e.ekMeta || {};
  const latinceKutu = lat.latince ? '<div class="not"><b>Latince:</b> ' + isle(lat.latince) + (lat.latince_kaynak ? ' · ' + isle(lat.latince_kaynak) : '') + (lat.kopya_supesi ? ' · kopya şüphesi: ' + isle(lat.kopya_supesi) : '') + '</div>' : '';
  const kaydet = () => { e.etiketleyici = etiketleyici(); e.zaman = new Date().toISOString(); e.tarih = e.zaman.slice(0, 10); etiketKaydet(id, e); durum(); sunucuyaGonder(); };
  function satirlarEkle(yon) {
    const uc = kimlik.get(yon < 0 ? e.kaynak[0] : e.kaynak[e.kaynak.length - 1]);
    const k = uc && komsuSatir(uc, yon); if (!k) return;
    const yeni = sozcukle(k.t).map(f => ({ form: f, lemma: '', upos: /^[^\p{L}\d]$/u.test(f) ? 'PUNCT' : '', feats: '', head: '', deprel: /^[^\p{L}\d]$/u.test(f) ? 'punct' : '', hal: '', isaret: '', okuma: 'nesir', not: '' }));
    if (yon < 0) { const kay = yeni.length; e.sozcukler.forEach(t => { if (t.head !== '' && Number(t.head) > 0) t.head = String(Number(t.head) + kay); }); e.sozcukler = yeni.concat(e.sozcukler); e.kaynak.unshift(k.id); }
    else { e.sozcukler = e.sozcukler.concat(yeni); e.kaynak.push(k.id); }
    kaydet(); ciz();
  }
  function durum() {
    const u = denetle(e), el = document.getElementById('denetim');
    if (el) el.innerHTML = u.length ? '<b>' + u.length + ' uyarı</b><ul>' + u.slice(0, 12).map(x => '<li>' + isle(x) + '</li>').join('') + '</ul>' : '<b>Ağaç geçerli.</b> Tek kök, her sözcüğün başı var, döngü yok.';
    const k = document.getElementById('kaydedildi'); if (k) k.textContent = 'Taslak bu tarayıcıda kaydedildi · ' + new Date().toLocaleTimeString('tr') + '.';
  }
  function ciz() {
    const kaynakMetin = e.kaynak.map(k => kimlik.get(k)).filter(Boolean);
    const sec = (ad, liste, deger, i) => '<select data-i="' + i + '" data-a="' + ad + '">' + liste.map(x => '<option' + (x === deger ? ' selected' : '') + '>' + x + '</option>').join('') + '</select>';
    const basSec = (t, i) => '<select data-i="' + i + '" data-a="head"><option value=""' + (t.head === '' ? ' selected' : '') + '>?</option><option value="0"' + (t.head === '0' ? ' selected' : '') + '>0 (kök)</option>' +
      e.sozcukler.map((x, j) => j === i ? '' : '<option value="' + (j + 1) + '"' + (t.head === String(j + 1) ? ' selected' : '') + '>' + (j + 1) + ' ' + isle(x.form) + '</option>').join('') + '</select>';
    icerik.innerHTML = '<a class="geri" href="#/tanik/' + id + '">← Tanığa dön</a>' +
      '<article class="kart etiket"><p class="baslik-kucuk">UD etiketleme · kılavuz ' + KILAVUZ + '</p>' +
      '<div class="kaynak-satirlar">' + kaynakMetin.map(k => '<div' + (k.id === id ? ' class="ana"' : '') + '>' + isle(k.t) + (k.c ? ' <span class="not">· ' + isle(k.c) + '</span>' : '') + '</div>').join('') + '</div>' +
      '<div class="alt ust-bosluk"><button class="dugme ikincil" id="once">+ önceki satır</button><button class="dugme ikincil" id="sonra">+ sonraki satır</button>' +
      '<label class="not">Etiketleyici <input id="etkad" value="' + isle(etiketleyici()) + '" placeholder="ad soyad" size="14"></label>' +
      '<button class="dugme ikincil" id="sifirla">Sıfırla</button><button class="dugme" id="disa">Bu cümleyi CoNLL-U indir</button></div>' +
      (kaynakNotu ? '<div class="uyari">' + isle(kaynakNotu) + '</div>' : '') + latinceKutu + '<p class="not">Cümle sınırı OCR satırı değildir: gerekirse önceki/sonraki satırı ekleyin (karar K8). Yararlanıcı yönelme hâli için K4, -(I)p tur- için K1. <span id="kaydedildi"></span> <span id="sunucu-durum" class="not">' + isle(sunucuDurum) + '</span></p>' +
      '<div class="tablo-sar"><table class="etiket-tablo"><thead><tr><th>#</th><th>Biçim</th><th>Madde başı</th><th>Tür</th><th>Özellikler</th><th>Baş</th><th>İlişki</th><th>Yönetilen hâl</th><th>Yüzey işareti</th><th>Okuma</th><th>Not</th></tr></thead><tbody>' +
      e.sozcukler.map((t, i) => '<tr><td>' + (i + 1) + '</td><td><input data-i="' + i + '" data-a="form" value="' + isle(t.form) + '" size="9"></td><td><input data-i="' + i + '" data-a="lemma" value="' + isle(t.lemma) + '" size="7" placeholder="ör. tuv"></td>' +
        '<td>' + sec('upos', [''].concat(UPOS), t.upos, i) + '</td><td><input data-i="' + i + '" data-a="feats" value="' + isle(t.feats) + '" size="18" list="ozellik" placeholder="Case=Abl|…"></td><td>' + basSec(t, i) + '</td><td>' + sec('deprel', [''].concat(DEPREL), t.deprel, i) + '</td>' +
        '<td>' + sec('hal', HAL, t.hal, i) + '</td><td><input data-i="' + i + '" data-a="isaret" value="' + isle(t.isaret) + '" size="6" placeholder="+dan"></td><td>' + sec('okuma', OKUMA, t.okuma, i) + '</td><td><input data-i="' + i + '" data-a="not" value="' + isle(t.not) + '" size="18"></td></tr>').join('') +
      '</tbody></table></div><datalist id="ozellik">' + OZELLIK.map(o => '<option value="' + o + '">').join('') + '</datalist>' +
      '<div id="denetim" class="uyari"></div></article>';
    icerik.querySelectorAll('[data-a]').forEach(el => el.addEventListener('change', () => {
      const t = e.sozcukler[Number(el.dataset.i)]; t[el.dataset.a] = el.value.trim();
      if (el.dataset.a === 'head' && el.value === '0') t.deprel = 'root';
      kaydet(); if (el.dataset.a === 'form' || (el.dataset.a === 'head' && el.value === '0')) ciz();
    }));
    document.getElementById('once').onclick = () => satirlarEkle(-1);
    document.getElementById('sonra').onclick = () => satirlarEkle(1);
    document.getElementById('etkad').onchange = ev => { depo.yaz('mh:etiketleyici', ev.target.value.trim()); kaydet(); };
    document.getElementById('sifirla').onclick = () => { if (confirm('Bu cümlenin taslak etiketleri silinsin mi?')) { e = yeniEtiket(s); kaydet(); ciz(); } };
    document.getElementById('disa').onclick = () => indir(id + '.conllu', conllu(id, e));
    durum();
  }
  ciz();
}

// --- Etiket listesi, toplu dışa/içe aktarma ve uyuşma: #/etiketler
function etiketlerSayfasi(cekildi) {
  const t = tumEtiketler(), idler = Object.keys(t);
  const kay = kayitli(), kayIdler = Object.keys(kay);
  icerik.innerHTML = '<p class="baslik-kucuk">Etiketleme</p>' +
    '<div class="uyari">Etiketlemeye herkes bakabilir; sunucuya kaydetmek için ' + GIRIS + ' (proje parolası). Etiketleriniz önce bu tarayıcıda, ardından adınıza sunucuda saklanır (<code>' + isle(sunucu.ad(etiketleyici()) || 'adınız') + '.conllu</code>). Başka bir bilgisayardan aynı adla girdiğinizde taslaklarınız gelir. <label class="not">Etiketleyici <input id="etkad2" value="' + isle(etiketleyici()) + '" placeholder="ad soyad" size="14"></label> <span id="sunucu-durum" class="not">' + isle(sunucuDurum) + '</span></div>' +
    '<div class="alt"><button class="dugme ikincil" id="esitle">Sunucuyla eşitle</button><button class="dugme" id="tumdisa">Tümünü CoNLL-U indir (' + idler.length + ')</button>' +
    '<label class="dugme ikincil">CoNLL-U içe aktar <input type="file" id="ice" accept=".conllu,.txt" hidden></label></div>' +
    '<h2 class="baslik-kucuk" style="margin-top:20px">Taslaklar</h2>' +
    (idler.length ? '<div class="kartlar">' + idler.map(id => { const e = t[id], u = denetle(e); return '<a class="kart" href="#/etiketle/' + id + '"><div class="kip-metin">' + isle(e.sozcukler.map(x => x.form).join(' ')) + '</div><div class="alt"><span class="cip' + (u.length ? '' : ' vurgu') + '">' + (u.length ? u.length + ' uyarı' : 'geçerli ağaç') + '</span><span class="cip">' + isle(e.etiketleyici || 'etiketleyici yok') + '</span><span class="cip">' + id + '</span></div></a>'; }).join('') + '</div>' : '<p class="not">Henüz taslak yok.</p>') +
    '<h2 class="baslik-kucuk" style="margin-top:20px">Depodaki kayıtlı etiketler (' + kayIdler.length + ')</h2><p class="not">Ön etiketli küme: doğ-/töre- (17) ve bėr- (6) tanıklarını içeren cümleler; her cümlenin başında Latince karşılığı ve kopya şüphesi var. Etiketleyicisi “ön etiket” olanlar denetlenmemiştir; açıp düzeltin; değiştirdiğiniz cümle adınıza sunucuya kaydedilir.</p><div class="kartlar">' +
    kayIdler.map(id => { const e = kay[id], u = denetle(e); return '<a class="kart" href="#/etiketle/' + id + '?on=1"><div class="kip-metin">' + isle(e.sozcukler.map(x => x.form).join(' ')) + '</div><div class="alt"><span class="cip">' + isle(e.etiketleyici || '?') + '</span><span class="cip' + (u.length ? '' : ' vurgu') + '">' + (u.length ? u.length + ' uyarı' : 'geçerli ağaç') + '</span>' + (t[id] ? '<span class="cip vurgu">sizin taslağınız var</span>' : '') + '</div></a>'; }).join('') + '</div>' +
    '<h2 class="baslik-kucuk" style="margin-top:20px">Sunucudaki etiketleyiciler</h2><div id="sunucu-liste" class="not">Yükleniyor…</div>' +
    '<h2 class="baslik-kucuk" style="margin-top:20px">Uyuşma (iki etiketleyici)</h2><p class="not">Sunucudaki iki etiketleyiciyi seçin; aynı <code>sent_id</code> ve aynı sözcük bölümlemesine sahip cümleler karşılaştırılır.</p>' +
    '<div class="alt"><select id="s1"></select><select id="s2"></select><button class="dugme" id="solc">Ölç</button></div>' +
    '<details class="ust-bosluk"><summary class="not">Ya da iki CoNLL-U dosyası yükleyin</summary><div class="alt"><input type="file" id="u1" accept=".conllu,.txt"><input type="file" id="u2" accept=".conllu,.txt"><button class="dugme" id="olc">Ölç</button></div></details><div id="uyusma"></div>';
  document.getElementById('tumdisa').onclick = () => indir('metinhavuzu-etiketler-' + (etiketleyici() || 'adsiz') + '-' + new Date().toISOString().slice(0, 10) + '.conllu', idler.map(id => conllu(id, t[id])).join('\n'));
  document.getElementById('ice').onchange = async ev => {
    const f = ev.target.files[0]; if (!f) return;
    const gelen = conlluOku(await f.text()), mevcut = tumEtiketler();
    const n = Object.keys(gelen).length; Object.assign(mevcut, gelen); depo.yaz('mh:etiketler', mevcut);
    alert(n + ' cümle içe aktarıldı.'); etiketlerSayfasi();
  };
  document.getElementById('etkad2').onchange = ev => { depo.yaz('mh:etiketleyici', ev.target.value.trim()); esitle().then(() => etiketlerSayfasi(true)).catch(err => sunucuDurumYaz('Eşitlenemedi (' + err.message + ').', true)); };
  document.getElementById('esitle').onclick = () => esitle().then(son => { if (son) etiketlerSayfasi(true); }).catch(err => sunucuDurumYaz('Eşitlenemedi (' + err.message + ').', true));
  sunucu.liste().then(dosyalar => {
    const el = document.getElementById('sunucu-liste'); if (!el) return;
    el.innerHTML = dosyalar.length ? '<div class="alt">' + dosyalar.map(f => '<span class="cip">' + isle(f.name.replace(/\.conllu$/, '')) + ' · ' + Math.max(1, Math.round(f.size / 1024)) + ' KB · ' + new Date(f.mtime).toLocaleString('tr') + '</span>').join('') + '</div>' : 'Sunucuda henüz kayıt yok.';
    const se = dosyalar.map(f => '<option>' + isle(f.name) + '</option>').join('');
    document.getElementById('s1').innerHTML = se; document.getElementById('s2').innerHTML = se;
    if (dosyalar.length > 1) document.getElementById('s2').selectedIndex = 1;
  }).catch(err => { const el = document.getElementById('sunucu-liste'); if (el) el.innerHTML = /\b401\b/.test(err.message) ? 'Sunucudaki kayıtları görmek için ' + GIRIS + '.' : 'Sunucuya ulaşılamadı (' + isle(err.message) + ').'; });
  document.getElementById('solc').onclick = async () => {
    const a = document.getElementById('s1').value, b = document.getElementById('s2').value;
    if (!a || !b || a === b) { document.getElementById('uyusma').textContent = 'İki farklı etiketleyici seçin.'; return; }
    document.getElementById('uyusma').innerHTML = uyusma(await sunucu.oku(a), await sunucu.oku(b));
  };
  if (etiketleyici() && !cekildi) esitle().then(son => { if (son && location.hash.startsWith('#/etiketler')) etiketlerSayfasi(true); }).catch(err => sunucuDurumYaz('Sunucuya ulaşılamadı (' + err.message + '); taslaklar bu tarayıcıda.', true));
  document.getElementById('olc').onclick = async () => {
    const [a, b] = ['u1', 'u2'].map(x => document.getElementById(x).files[0]);
    if (!a || !b) { document.getElementById('uyusma').textContent = 'İki dosya seçin.'; return; }
    document.getElementById('uyusma').innerHTML = uyusma(conlluOku(await a.text()), conlluOku(await b.text()));
  };
}

function kappa(x, y) {
  const n = x.length; if (!n) return NaN;
  const po = x.filter((v, i) => v === y[i]).length / n;
  const kat = [...new Set(x.concat(y))];
  const pe = kat.reduce((t, k) => t + (x.filter(v => v === k).length / n) * (y.filter(v => v === k).length / n), 0);
  return pe === 1 ? 1 : (po - pe) / (1 - pe);
}
function uyusma(A, B) {
  const ortak = Object.keys(A).filter(id => B[id] && A[id].sozcukler.length === B[id].sozcukler.length && A[id].sozcukler.every((t, i) => t.form === B[id].sozcukler[i].form));
  const atla = Object.keys(A).filter(id => B[id] && !ortak.includes(id));
  let n = 0, uas = 0, las = 0; const up = [[], []], dr = [[], []], hal = [[], []];
  for (const id of ortak) A[id].sozcukler.forEach((t, i) => {
    const u = B[id].sozcukler[i]; if (t.upos === 'PUNCT') return;
    n++; if (t.head === u.head) { uas++; if (t.deprel === u.deprel) las++; }
    up[0].push(t.upos); up[1].push(u.upos); dr[0].push(t.deprel); dr[1].push(u.deprel);
    const ca = (t.feats.match(/Case=(\w+)/) || [])[1] || '-', cb = (u.feats.match(/Case=(\w+)/) || [])[1] || '-'; hal[0].push(ca); hal[1].push(cb);
  });
  const y = v => isNaN(v) ? '-' : (100 * v).toFixed(1) + '%', k = v => isNaN(v) ? '-' : v.toFixed(2);
  return '<div class="tablo-sar"><table class="karsi"><tbody>' +
    '<tr><td>Karşılaştırılan cümle</td><td class="sayi">' + ortak.length + '</td></tr>' +
    '<tr><td>Sözcük (noktalama hariç)</td><td class="sayi">' + n + '</td></tr>' +
    '<tr><td>UAS (baş uyuşması)</td><td class="sayi">' + y(uas / n) + '</td></tr>' +
    '<tr><td>LAS (baş + ilişki)</td><td class="sayi">' + y(las / n) + '</td></tr>' +
    '<tr><td>Tür (UPOS) · Cohen κ</td><td class="sayi">' + k(kappa(up[0], up[1])) + '</td></tr>' +
    '<tr><td>İlişki · Cohen κ</td><td class="sayi">' + k(kappa(dr[0], dr[1])) + '</td></tr>' +
    '<tr><td>Hâl (Case) · Cohen κ</td><td class="sayi">' + k(kappa(hal[0], hal[1])) + '</td></tr>' +
    '</tbody></table></div>' + (atla.length ? '<p class="not">Sözcük bölümlemesi farklı olduğu için atlanan cümle: ' + atla.map(isle).join(', ') + '</p>' : '');
}
