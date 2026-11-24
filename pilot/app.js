const V = window.VERI;
const kimlik = new Map(V.satirlar.map(s => [s.id, s]));
const kitap = Object.fromEntries(V.sayfalar.map(s => [s.pdf, s.tahmini ? s.kitap.map(n => n + '?') : s.kitap]));
const KOPYA_AD = { birebir_kalk: 'birebir kalk', olasi_kalk: 'olası kalk', yok: 'Latincede yok', belirlenemez: 'belirlenemez' };
const CEVIRI_AD = { 'yan sütun': 'yan sütundaki kıta', 'satır içi': 'sözlük karşılığı', 'paragraf': 'paragraf eşlemesi (çapa ve uzunlukla denetlendi)' };
const q = document.getElementById('q'), icerik = document.getElementById('icerik');
const isle = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const kac = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const kucuk = s => s.normalize('NFC').toLocaleLowerCase('tr');
let kip = 'gevsek';

// --- Sanal klavye (neşrin harf envanterinden) ve kısa yollar
const harfler = V.envanter.filter(([, n]) => n > 10).map(([h]) => h);
for (const h of harfler.flatMap(h => [h, h.toLocaleUpperCase('tr')])) {
  const b = document.createElement('button');
  b.type = 'button'; b.textContent = h; b.title = 'U+' + h.codePointAt(0).toString(16).toUpperCase().padStart(4, '0');
  b.onclick = () => { const a = q.selectionStart ?? q.value.length, z = q.selectionEnd ?? a; q.value = q.value.slice(0, a) + h + q.value.slice(z); q.focus(); q.setSelectionRange(a + h.length, a + h.length); };
  document.getElementById('klavye').appendChild(b);
}
const KISA = { 'e:': 'ė', 'n:': 'ŋ', 'h:': 'ḫ', 'E:': 'Ė', 'N:': 'Ŋ', 'H:': 'Ḫ' };
q.addEventListener('input', () => {
  const k = q.selectionStart, onceki = q.value.slice(k - 2, k);
  if (KISA[onceki]) { q.value = q.value.slice(0, k - 2) + KISA[onceki] + q.value.slice(k); q.setSelectionRange(k - 1, k - 1); }
});
document.querySelectorAll('.kip button').forEach(b => b.onclick = () => { kip = b.dataset.kip; kipGoster(); if (q.value.trim()) git(); });
function kipGoster() { document.querySelectorAll('.kip button').forEach(b => b.setAttribute('aria-pressed', b.dataset.kip === kip)); }
document.getElementById('form').onsubmit = e => { e.preventDefault(); git(); };
document.querySelectorAll('#basta, #dizinli').forEach(e => e.onchange = () => q.value.trim() && git());
for (const o of ['tuv', 'tog', 'doğ', 'töre', 'tengri']) {
  const a = document.createElement('a'); a.textContent = o; a.href = '#/ara?q=' + encodeURIComponent(o); document.getElementById('ornekler').appendChild(a);
}
for (const [ad, yazi] of [['doğ', 'doğ- maddesi'], ['ver', 'ver- maddesi']]) {
  const a = document.createElement('a'); a.textContent = yazi; a.href = '#/madde/' + encodeURIComponent(ad); document.getElementById('ornekler').appendChild(a);
}
function aramaAdresi(sorgu) {
  const p = new URLSearchParams({ q: sorgu });
  if (kip !== 'gevsek') p.set('kip', kip);
  if (!document.getElementById('basta').checked) p.set('bas', '0');
  if (document.getElementById('dizinli').checked) p.set('dizin', '1');
  if (derlem !== 'hepsi') p.set('d', derlem);
  return '#/ara?' + p;
}
function git() { const s = q.value.trim(); if (s) location.hash = aramaAdresi(s); }

// --- Arama: gevşek kipte sorgunun her harfi bir sınıfa açılır, metin değiştirilmez
function desen(sorgu, gevsek) {
  sorgu = kucuk(sorgu);
  if (!gevsek) return kac(sorgu);
  let d = '';
  for (let i = 0; i < sorgu.length; i++) {
    const c = sorgu[i], s = sorgu[i + 1];
    if (c === 'n' && s === 'g') { d += '(?:ng|ŋ)'; i++; }
    else if (c === 'n' || c === 'ŋ') d += '[nŋ]';
    else if (c === 'e' || c === 'ė') d += '[eė]';
    else if (c === 'h' || c === 'x' || c === 'ḫ') d += '[hxḫ]';
    else d += kac(c);
  }
  return d;
}
function ifade(sorgu, bas = document.getElementById('basta').checked) {
  return new RegExp((bas ? '(?<![\\p{L}])' : '') + desen(sorgu, kip === 'gevsek'), 'gu');
}
function vurgula(t, re) {
  t = t.normalize('NFC'); const k = kucuk(t); let h = '', son = 0; re.lastIndex = 0;
  for (const m of k.matchAll(re)) { h += isle(t.slice(son, m.index)) + '<mark>' + isle(t.slice(m.index, m.index + m[0].length)) + '</mark>'; son = m.index + m[0].length; }
  return h + isle(t.slice(son));
}
const sayfaEtiketi = s => s.d === 'boun' ? 'cümle ' + s.b : s.d && s.d.startsWith('ttl') ? 'TTL kitap s. ' + s.ks : (kitap[s.pdf] && kitap[s.pdf].length ? 'kitap s. ' + kitap[s.pdf].join('–') : 'PDF s. ' + s.pdf);
const DERLEM = V.derlemler;
const KONUM_AD = { Fin: 'çekimli yüklem', Part: 'sıfat-fiil', Conv: 'zarf-fiil', Vnoun: 'ad-fiil', 'Conv+tur': '-(I)p tur- yapısı' };
const HAL_AD = { Nom: 'yalın', Acc: 'belirtme', Dat: 'yönelme', Loc: 'bulunma', Abl: 'çıkma', Gen: 'ilgi', Ins: 'araç', Equ: 'eşitlik' };
let derlem = 'hepsi';
function paralelBul(s) { if (!s.bs) return null; const k = Object.keys(V.paralel).find(k => s.bs.startsWith(k + ' ')); return k ? V.paralel[k] : null; }

function sonuclar(sorgu) {
  const re = ifade(sorgu), dizinli = document.getElementById('dizinli').checked, bulunan = [], bicimler = new Map();
  for (const s of V.satirlar) {
    if (!dizinli && s.k !== 'metin') continue;
    if (derlem !== 'hepsi' && s.d !== derlem) continue;
    const t = kucuk(s.t); re.lastIndex = 0;
    if (!re.test(t)) continue;
    bulunan.push(s); re.lastIndex = 0;
    for (const m of t.matchAll(re)) {
      const soz = (t.slice(m.index).match(/^[\p{L}\[\]-]+/u) || [m[0]])[0];
      bicimler.set(soz, (bicimler.get(soz) || 0) + 1);
    }
  }
  const sayfa = new Set(bulunan.map(s => s.d + (s.pdf || s.b))).size;
  const say = d => bulunan.filter(s => s.d === d).length;
  const madde = maddeBul(sorgu);
  let h = (madde ? '<div class="uyari"><b>Madde başı:</b> <a href="#/madde/' + encodeURIComponent(madde) + '">' + isle(MADDE[madde].ad) + '</a>: Kıpçakça ' + isle(MADDE[madde].kip) + ' biçimlerinin doğrulanmış tanıkları ve dışlanan benzerleri tek sayfada.</div>' : '') + '<p class="baslik-kucuk">Sonuçlar</p><p class="ozet">“' + isle(sorgu) + '” · ' + (kip === 'gevsek' ? 'gevşek' : 'tam') + ' kip · ' + bulunan.length + ' satır, ' + sayfa + ' kaynak yeri' + (dizinli ? ' · dizin ve dipnotlar dahil' : '') + '</p>';
  h += '<div class="bicimler" role="group" aria-label="Derlem">' + [['hepsi', 'Tüm derlemler'], ...Object.entries(DERLEM).map(([k, v]) => [k, v.ad])].filter(([k]) => k === 'hepsi' || say(k)).map(([k, ad]) =>
    '<a class="cip' + (derlem === k ? ' vurgu' : '') + '" href="#" data-derlem="' + k + '">' + ad + (k === 'hepsi' ? '' : ' ' + say(k)) + '</a>').join('') + '</div>';
  if (bicimler.size) h += '<div class="bicimler">' + [...bicimler].sort((a, b) => b[1] - a[1]).slice(0, 16).map(([b, n]) => '<a class="cip" href="' + aramaAdresi(b) + '"><b>' + isle(b) + '</b> ' + n + '</a>').join('') + '</div>';
  if (!bulunan.length) h += '<div class="bos">Sonuç yok. Gevşek kipi ya da “sözcük başında” seçeneğini kapatmayı deneyin.</div>';
  h += '<div class="kartlar">';
  for (const s of bulunan.slice(0, 200)) {
    h += '<a class="kart" href="#/tanik/' + s.id + '?q=' + encodeURIComponent(sorgu) + '"><div class="kip-metin">' + vurgula(s.t, re) + '</div>' +
      (s.c ? '<div class="ceviri">' + isle(s.c) + '</div>' : '') +
      '<div class="alt"><span class="cip' + (s.d === 'boun' ? ' vurgu' : '') + '">' + (DERLEM[s.d] ? DERLEM[s.d].ad : '') + '</span>' + (s.bs && s.d !== 'boun' ? '<span class="cip">' + isle(s.bs.replace(/\d+$/, '')) + '</span>' : '') +
      (s.b ? '<span class="cip">' + isle(s.b) + '</span>' : '') + '<span class="cip">' + sayfaEtiketi(s) + '</span>' +
      (s.c ? '<span class="cip vurgu">' + CEVIRI_AD[s.ct] + '</span>' : (s.bc ? '<span class="cip">bölüm çevirisi</span>' : '')) +
      (s.k !== 'metin' ? '<span class="cip">' + (s.k === 'ceviri' ? 'Türkçe çeviri satırı' : s.k) + '</span>' : '') + '</div></a>';
  }
  h += '</div>';
  if (bulunan.length > 200) h += '<p class="ozet">İlk 200 satır gösteriliyor.</p>';
  icerik.innerHTML = h;
  icerik.querySelectorAll('[data-derlem]').forEach(a => a.onclick = e => { e.preventDefault(); derlem = a.dataset.derlem; git(); });
}

function udCerceve(ud, tok) {
  return ud.filter(t => t[5] === tok[0] && !['punct', 'aux', 'cop', 'mark', 'cc', 'det'].includes(t[6])).map(t => {
    const h = (t[4].match(/Case=(\w+)/) || [])[1] || '';
    return { s: t[1], r: t[6], h, tur: t[3] === 'VERB' || /VerbForm/.test(t[4]) ? 'fiilimsi öbeği' : t[3] === 'ADP' ? 'ilgeç' : 'ad öbeği' };
  });
}
function bounSayfasi(s, sorgu) {
  const re = sorgu ? ifade(sorgu) : null;
  const adres = location.origin + location.pathname + '#/tanik/' + s.id;
  const hedefler = s.ud.filter(t => t[3] === 'VERB' && re && (re.lastIndex = 0, re.test(kucuk(t[1]))));
  const satir = s.ud.map(t => '<tr' + (hedefler.includes(t) ? ' class="hedef"' : '') + '><td>' + t[0] + '</td><td class="tanik-metin">' + isle(t[1]) + '</td><td>' + isle(t[2]) + '</td><td>' + t[3] + '</td><td>' + isle(t[4].replace(/\|/g, ' ')) + '</td><td>' + t[5] + '</td><td>' + t[6] + '</td></tr>').join('');
  const cer = hedefler.map(h => '<p><b>' + isle(h[1]) + '</b> (' + h[2] + '-, ' + (KONUM_AD[(h[4].match(/VerbForm=(\w+)/) || [])[1] || 'Fin']) + ', ilişki ' + h[6] + ')</p><ul class="cerceve">' +
    (udCerceve(s.ud, h).map(b => '<li><b>' + isle(b.s) + '</b> · ' + b.r + ' · ' + b.tur + (b.h ? ' · ' + (HAL_AD[b.h] || b.h) + ' hâli' : '') + '</li>').join('') || '<li>Bağlı öge yok.</li>') + '</ul>').join('');
  icerik.innerHTML = (sorgu ? '<a class="geri" href="' + aramaAdresi(sorgu) + '">← Aramaya dön</a>' : '<a class="geri" href="#/">← Aramaya dön</a>') +
    '<article class="kart"><h1>' + (re ? vurgula(s.t, re) : isle(s.t)) + '</h1>' +
    '<div class="alt ust-bosluk"><span class="cip vurgu">UD Turkish BOUN</span><span class="cip">cümle ' + isle(s.b) + '</span></div>' +
    (cer ? '<h2>Fiilin çerçevesi (UD etiketlerinden)</h2>' + cer : '') +
    '<h2>UD çözümlemesi</h2><div class="tablo-sar"><table><thead><tr><th>#</th><th>Biçim</th><th>Madde başı</th><th>Tür</th><th>Özellikler</th><th>Baş</th><th>İlişki</th></tr></thead><tbody>' + satir + '</tbody></table></div>' +
    '<h2>Kaynak</h2><dl class="kunye"><dt>Derlem</dt><dd>UD Turkish BOUN (Türkçe Ulusal Derlem\'den seçilmiş özgün metinler)</dd><dt>Cümle</dt><dd>' + isle(s.b) + '</dd><dt>Lisans</dt><dd>CC BY-SA 4.0 · Türk vd., UD v2.7+</dd></dl>' +
    '<h2>Kalıcı adres</h2><div class="adres"><input readonly value="' + isle(adres) + '" aria-label="Kalıcı adres"><button id="kopyala">Kopyala</button></div></article>';
  document.getElementById('kopyala').onclick = async e => { try { await navigator.clipboard.writeText(adres); e.target.textContent = 'Kopyalandı'; } catch { document.querySelector('.adres input').select(); } };
}

// --- Karşılaştırma: Kıpçakça kökler (CC II, otomatik kaba çözümleme) ve çağdaş madde başı (BOUN, UD etiketleri)
// Hariç tutma: öğe önek olarak eşleşir; "=" ile başlıyorsa yalnız sözcüğün tamamı (ör. =bėri "beri" zarfı, bėrir'i kesmez)
function haricMi(soz, haric) { const t = soz.replace(/[\[\]]/g, ''); return haric.some(h => h.startsWith('=') ? t === h.slice(1) : t.startsWith(h)); }
const KONUM_SIRA = ['Fin', 'Part', 'Conv', 'Conv+tur', 'Vnoun', '?'];
function kipcakKonum(ek, sonraki) {
  ek = ek.replace(/[ġğ]/g, 'g').replace(/ḳ/g, 'k').replace(/ḫ/g, 'h');
  const k = kipcakKonum1(ek, sonraki);
  if (k === '?' && /^m[ae]./.test(ek)) return kipcakKonum1(ek.slice(2), sonraki); // olumsuzluk -ma/-me-
  return k;
}
function kipcakKonum1(ek, sonraki) {
  if (/^[gk][ae]nd[ıi]r/.test(ek)) return 'Fin';         // -GAndIr: yüklem (ol yıl kėlgendir)
  if (/^[gk][ae]l[ıi]$/.test(ek)) return 'Conv';         // -GAlI: zarf-fiil (ol kėlgeli)
  if (/^[ıi]?y[ıi]r|^[ıi]?yor/.test(ek)) return 'Fin';   // -(I)yIr / -(I)yor: şimdiki zaman
  if (/^[ıiuü]?p$/.test(ek) && /^t[uü]r/.test(sonraki || '')) return 'Conv+tur';
  if (/^[ıiuü]?p-/.test(ek) || /^[ıiuü]?pt[ıiuü]r/.test(ek)) return 'Fin';  // -(I)p+kişi, -(I)ptIr
  if (/^[ıiuü]?p$/.test(ek) || /^m[ae]sd[ae]n/.test(ek) || /^[gk][ae]nd[ae]$/.test(ek) || /^g[ıi]n[çc]/.test(ek)) return 'Conv';
  if (/^[gk][ae]n/.test(ek) || /^m[ae]g[ae]n/.test(ek)) return 'Part';
  if (/^m[ae][kg](?![ıi]l)/.test(ek)) return 'Vnoun';
  if (/^([dt][ıiuü]|[aeuüıi]?r|[gk][ae]y|m[ıiuü]ş|s[ae]|[gk][ıi]l|m[ae]z|m[ae]s|s[ıiuü]n|[ae]?y[ıi]n|[ıiuü]?ŋ|[ae]l[ıi]|[ıiuü]?ŋ[ıi]z)/.test(ek)) return 'Fin';
  return '?';
}
function karsilastirSayfasi(p) {
  const kokler = (p.get('kok') || 'tuv, tog, tov').split(',').map(x => kucuk(x.trim())).filter(Boolean);
  const haric = (p.get('haric') || 'tuvur, tuvr, togur, togır, tuvra, tuvus, togus, tovram, tuvuş, toguş').split(',').map(x => kucuk(x.trim())).filter(Boolean);
  const lemma = (p.get('lemma') || 'doğ').trim();
  const sozlukDahil = p.get('sozluk') === '1'; let sozlukCikan = 0;
  // CC II
  const cc = [];
  const reK = new RegExp('(?<![\\p{L}])(' + kokler.map(k => desen(k, true)).join('|') + ')([\\p{L}\\-\\[\\]]*)', 'gu');
  for (const s of V.satirlar) {
    if (s.d !== 'cc2' || s.k !== 'metin') continue;
    if (s.tur === 'sozluk' && !sozlukDahil) { sozlukCikan++; continue; }  // sözlük maddeleri tam cümle değil: varsayılan olarak paydaya girmez
    if (s.tur === 'diger') continue;
    const t = kucuk(s.ct === 'satır içi' ? s.t.split('"')[0] : s.t); reK.lastIndex = 0;
    for (const m of t.matchAll(reK)) {
      const soz = m[0];
      if (haricMi(soz, haric)) continue;
      const sonraki = (t.slice(m.index + soz.length).match(/^\s+([\p{L}]+)/u) || [])[1];
      cc.push({ s, soz, konum: kipcakKonum(m[2].replace(/[\[\]]/g, ''), sonraki) });
    }
  }
  // Latince kopya şüphesi (doğ-/bėr- altın listelerindeki satır + biçim eşlemesinden)
  const kopyaHarita = new Map();
  for (const a of (V.altin || []).concat(V.altin_ber || [], V.altin_kel || [])) if (a.satir && a.kopya_supesi) kopyaHarita.set(a.satir + '|' + a.bicim, a.kopya_supesi);
  const kopyaCikar = p.get('kopya') === '1';
  let cikarilan = 0;
  if (kopyaCikar) for (let i = cc.length - 1; i >= 0; i--) {
    const k = kopyaHarita.get(cc[i].s.id + '|' + kucuk(cc[i].soz.replace(/[\[\]]/g, '')));
    if (k === 'birebir_kalk' || k === 'olasi_kalk') { cc.splice(i, 1); cikarilan++; }
  }
  // TTL Kıpçak (Ermeni harfli + Memluk + kitaptaki CC seçkisi), aynı otomatik tahminle
  const tk = [];
  for (const s of V.satirlar) {
    if (!s.d || !s.d.startsWith('ttl')) continue;
    const t = kucuk(s.t); reK.lastIndex = 0;
    for (const m of t.matchAll(reK)) {
      const soz = m[0];
      if (haricMi(soz, haric)) continue;
      const sonraki = (t.slice(m.index + soz.length).match(/^\s+([\p{L}]+)/u) || [])[1];
      tk.push({ s, soz, konum: kipcakKonum(m[2].replace(/[\[\]]/g, ''), sonraki) });
    }
  }
  // BOUN
  const bn = [], hal = {}; let k1Donusen = 0;
  for (const s of V.satirlar) {
    if (s.d !== 'boun') continue;
    for (const t of s.ud) if (t[2] === lemma && t[3] === 'VERB') {
      let konum = (t[4].match(/VerbForm=(\w+)/) || [])[1] || 'Fin';
      let cerAdaylari = udCerceve(s.ud, t);
      // K1 (kılavuz 0.2) çağdaş tarafa da: -Ip dur- yapısında sözlüksel fiil baş, dur- yardımcı; tümleçler sözlüksel fiile.
      // BOUN bu yapıyı tutarsız etiketler (aux / compound:lvc / advcl); üçü de aynı çözümlemeye çevrilir.
      // BOUN'da görülen beş etiketleme: dur aux / compound:lvc / advcl bağımlısı ya da -Ip fiil dur'un advcl / nmod bağımlısı (bazen VerbForm eksik).
      const ipMi = (konum === 'Conv' || !/VerbForm/.test(t[4])) && /[ıiuü]p$/i.test(t[1]);
      const durBagimli = s.ud.find(d => d[5] === t[0] && d[2] === 'dur' && d[6] !== 'punct');
      const durBas = s.ud.find(d => d[0] === t[5] && d[2] === 'dur');
      if (ipMi && (durBagimli || durBas)) {
        konum = 'Conv+tur'; k1Donusen++;
        if (durBas) cerAdaylari = cerAdaylari.concat(udCerceve(s.ud, durBas).filter(b => b.s !== t[1]));
      }
      const cer = cerAdaylari.filter(b => ['obj', 'obl', 'iobj', 'ccomp', 'xcomp'].includes(b.r));
      for (const b of cer) { const k = b.tur + ' · ' + (b.h ? (HAL_AD[b.h] || b.h) : b.r); hal[k] = (hal[k] || 0) + 1; }
      bn.push({ s, soz: t[1], konum, cer });
    }
  }
  const say = (dizi, k) => dizi.filter(x => x.konum === k).length;
  // Oran yalnız en az 5 tanık VE en az 3 ayrı metin birimi varsa (tek ilahideki tekrarlar bağımsız gözlem sayılmaz).
  const birim = x => x.s.d === 'boun' ? x.s.b.split('_')[0] : (x.s.bs || x.s.b || x.s.id);
  const birimSay = dizi => new Set(dizi.map(birim)).size;
  const oranKolon = {};
  const oran = (n, top, d) => (top >= 5 && oranKolon[d] >= 3) ? ' <small>(%' + Math.round(100 * n / top) + ')</small>' : '';
  const yogun = (dizi, k) => { const h = dizi.filter(x => x.konum === k); if (h.length < 3) return ''; const c = {}; h.forEach(x => c[birim(x)] = (c[birim(x)] || 0) + 1); const en = Math.max(...Object.values(c)); return en / h.length > 0.5 ? ' <span class="yogun" title="Tanıkların yarıdan fazlası tek metin biriminden (' + en + '/' + h.length + '); bağımsız gözlem sayısı düşük">⚠</span>' : ''; };
  const ccBelge = new Set(cc.map(x => x.s.bs)).size, bnBelge = new Set(cc.length ? bn.map(x => x.s.b.split('_')[0]) : bn.map(x => x.s.b.split('_')[0])).size;
  oranKolon.cc = birimSay(cc); oranKolon.tk = birimSay(tk); oranKolon.bn = birimSay(bn);
  let h = '<p class="baslik-kucuk">Karşılaştırma</p>' +
    '<form class="kart" id="kform"><div class="alt"><label>Kıpçakça kök(ler) <input name="kok" value="' + isle(kokler.join(', ')) + '"></label> ' +
    '<label>hariç tut <input name="haric" value="' + isle(haric.join(', ')) + '"></label> ' +
    '<label>Çağdaş madde başı <input name="lemma" value="' + isle(lemma) + '"></label> ' +
    '<label title="altın listelerde Latinceyle birebir ya da olası kalk sayılan tanıklar"><input type="checkbox" name="kopya" value="1"' + (kopyaCikar ? ' checked' : '') + '> Latince kalk şüphelilerini çıkar</label> ' +
    '<label title="Sözlük bölümlerindeki maddeler tam cümle değildir; varsayılan olarak karşılaştırmaya girmez"><input type="checkbox" name="sozluk" value="1"' + (sozlukDahil ? ' checked' : '') + '> Sözlük maddelerini dahil et</label> <button class="dugme">Karşılaştır</button></div></form>' +
    '<p class="not">Oran (%) yalnız en az 5 tanık ve en az 3 ayrı metin birimi (ilahi, vaaz, sözlük bölümü; BOUN\'da belge) varsa gösterilir. ⚠: hücredeki tanıkların yarıdan fazlası tek metin biriminden.' + (sozlukDahil ? ' Sözlük maddeleri dahil.' : ' Sözlük maddeleri karşılaştırma dışında (' + sozlukCikan + ' satır).') + ' BOUN\'da -Ip dur- yapısı K1 kuralıyla CC II ile aynı çözümlemeye çevrildi (' + k1Donusen + ' tanık). Metin birimi: CC II ' + oranKolon.cc + ', TTL ' + oranKolon.tk + ', BOUN ' + oranKolon.bn + '.' + (kopyaCikar ? ' Latince kalk şüphesiyle çıkarılan CC II tanığı: ' + cikarilan + ' (yalnız altın liste tanıkları için bilinir).' : '') + '</p>' +
    '<div class="uyari">Bu tablo keşif içindir, sonuç değildir. Codex Cumanicus tarafı otomatik ek tahminiyle sınıflanır (UD etiketi yok); BOUN tarafı UD etiketlerinden gelir. CC II tanıklarının çoğu Latinceden çevrilmiş manzum ilahi ve vaazdır; BOUN özgün çağdaş düzyazıdır. <i>Tarihî Türk Lehçeleri</i> ders kitabı da CC II söz diziminin çeviri yüzünden “çoklukla kuralsız” olduğunu belirtir. Sütun toplamı 5\'ten küçükse oran gösterilmez.</div>' +
    '<div class="tablo-sar"><table class="karsi"><thead><tr><th>Fiilin konumu</th><th>Codex Cumanicus II <small>' + kokler.join('/') + '- · ' + cc.length + ' kullanım, ' + ccBelge + ' bölüm · otomatik</small></th><th>TTL Kıpçak seçkisi <small>Ermeni harfli, Memluk, CC · ' + tk.length + ' kullanım · otomatik</small></th><th>UD BOUN <small>' + isle(lemma) + '- · ' + bn.length + ' kullanım · UD</small></th></tr></thead><tbody>' +
    KONUM_SIRA.map(k => { const a = say(cc, k), c = say(tk, k), b = say(bn, k); return (a || b || c) ? '<tr><td>' + (KONUM_AD[k] || 'belirsiz (elle bakılmalı)') + '</td><td class="sayi"><a href="#" data-l="cc:' + k + '">' + a + '</a>' + oran(a, cc.length, "cc") + yogun(cc, k) + '</td><td class="sayi"><a href="#" data-l="tk:' + k + '">' + c + '</a>' + oran(c, tk.length, "tk") + yogun(tk, k) + '</td><td class="sayi"><a href="#" data-l="bn:' + k + '">' + b + '</a>' + oran(b, bn.length, "bn") + yogun(bn, k) + '</td></tr>' : ''; }).join('') +
    '</tbody></table></div>';
  const halSira = Object.entries(hal).sort((x, y) => y[1] - x[1]);
  h += '<h2 class="baslik-kucuk" style="margin-top:20px">Tümleç türü ve hâli (yalnız BOUN; CC II için etiketleme bekleniyor)</h2>' +
    (halSira.length ? '<div class="tablo-sar"><table class="karsi"><thead><tr><th>Tümleç</th><th>BOUN</th></tr></thead><tbody>' + halSira.map(([k, n]) => '<tr><td>' + isle(k) + '</td><td class="sayi">' + n + oran(n, bn.length, "bn") + '</td></tr>').join('') + '</tbody></table></div>' : '<p class="not">Tümleç yok.</p>') +
    '<div id="liste"></div>';
  icerik.innerHTML = h;
  document.getElementById('kform').onsubmit = e => { e.preventDefault(); const f = new FormData(e.target); location.hash = '#/karsilastir?' + new URLSearchParams([...f.entries()]); };
  icerik.querySelectorAll('[data-l]').forEach(a => a.onclick = e => {
    e.preventDefault(); const [d, k] = a.dataset.l.split(':'); const dizi = ({ cc, tk, bn }[d]).filter(x => x.konum === k);
    document.getElementById('liste').innerHTML = '<h2 class="baslik-kucuk" style="margin-top:20px">' + ({ cc: 'Codex Cumanicus II', tk: 'TTL Kıpçak seçkisi', bn: 'UD BOUN' }[d]) + ' · ' + (KONUM_AD[k] || 'belirsiz') + ' · ' + dizi.length + ' tanık</h2><div class="kartlar">' +
      dizi.slice(0, 150).map(x => '<a class="kart" href="#/tanik/' + x.s.id + '?q=' + encodeURIComponent(x.soz.replace(/[\[\]]/g, '')) + '"><div class="kip-metin">' + isle(x.s.t) + '</div>' + (x.s.c ? '<div class="ceviri">' + isle(x.s.c) + '</div>' : '') + '<div class="alt"><span class="cip vurgu">' + isle(x.soz) + '</span>' + (x.cer ? x.cer.map(b => '<span class="cip">' + isle(b.s) + ' · ' + (b.h ? (HAL_AD[b.h] || b.h) : b.r) + '</span>').join('') : '<span class="cip">' + sayfaEtiketi(x.s) + '</span>') + '</div></a>').join('') + '</div>';
    document.getElementById('liste').scrollIntoView({ behavior: 'smooth' });
  });
}

function ttlSayfasi(s, sorgu) {
  const re = sorgu ? ifade(sorgu) : null;
  const adres = location.origin + location.pathname + '#/tanik/' + s.id;
  const cev = V.bolum_ceviri[s.bc], coz = V.cozumleme[s.bc];
  const ayni = V.satirlar.filter(x => x.bc === s.bc);
  icerik.innerHTML = (sorgu ? '<a class="geri" href="' + aramaAdresi(sorgu) + '">← Aramaya dön</a>' : '<a class="geri" href="#/">← Aramaya dön</a>') +
    '<div class="tanik"><article class="kart"><h1>' + (re ? vurgula(s.t, re) : isle(s.t)) + '</h1>' +
    '<div class="alt ust-bosluk"><span class="cip vurgu">' + isle(DERLEM[s.d].ad) + '</span><span class="cip">' + isle(s.b) + '</span><span class="cip">' + sayfaEtiketi(s) + '</span></div>' +
    '<h2>Metnin tamamı (çeviri yazı)</h2><p class="kita">' + ayni.map(x => x.id === s.id ? '<mark>' + isle(x.t) + '</mark>' : isle(x.t)).join('\n') + '</p>' +
    (cev ? '<h2>Türkçe çeviri</h2><p class="ceviri-buyuk">' + isle(cev) + '</p><p class="not">metin düzeyinde çeviri (ders kitabından)</p>' : '') +
    (coz ? '<details><summary>Dil bilgisi çözümlemeleri (ders kitabından)</summary><pre>' + isle(coz) + '</pre></details>' : '') +
    '<h2>Kaynak</h2><dl class="kunye"><dt>Derlem</dt><dd>' + isle(DERLEM[s.d].ad) + ' · ' + isle(DERLEM[s.d].donem) + '</dd><dt>Tür</dt><dd>' + isle(DERLEM[s.d].tur) + '</dd><dt>Kitap</dt><dd>' + isle(DERLEM[s.d].kunye) + '</dd><dt>Sayfa</dt><dd>kitap s. ' + isle(s.ks) + ' · PDF s. ' + s.ps + '</dd><dt>Not</dt><dd>Sayfa görüntülerinden elle çevriyazıya aktarıldı; [?] belirsiz okuma. Asıl kaynak neşre göre denetlenmeli.</dd></dl>' +
    '<p class="ust-bosluk"><a class="dugme" href="#/etiketle/' + s.id + '">Bu satırı UD ile etiketle</a></p>' +
    '<h2>Kalıcı adres</h2><div class="adres"><input readonly value="' + isle(adres) + '" aria-label="Kalıcı adres"><button id="kopyala">Kopyala</button></div></article>' +
    '<figure class="kart sayfa-gorsel"><img alt="Ders kitabı sayfası, kitap s. ' + isle(s.ks) + '" src="veri/ttl/s' + String(s.ps).padStart(3, '0') + '.jpg"><figcaption class="not">TTL kitap s. ' + isle(s.ks) + '</figcaption></figure></div>';
  const img = document.querySelector('.sayfa-gorsel img'); img.onclick = e => window.open(e.target.src, '_blank'); img.onerror = () => img.closest('figure').remove();
  document.getElementById('kopyala').onclick = async e => { try { await navigator.clipboard.writeText(adres); e.target.textContent = 'Kopyalandı'; } catch { document.querySelector('.adres input').select(); } };
}

// Makaleye hazır atıf: Kıpçakça metin (NFC), yazma yaprağı, neşir sayfası, kalıcı adres.
function atifMetni(s, adres) {
  const yer = (s.b || s.yp || '').replace(/\s*:\s*/, ': ');  // yaprak (bölüm aralığı); satır numarası neşir metin sayfalarında basılı değil
  const sayfa = sayfaEtiketi(s).replace(/^kitap s\.\s*/, '');
  return (s.t + ' (Codex Cumanicus II' + (yer ? ', ' + yer : '') + '; Argunşah & Güner 2015: ' + sayfa + ') ' + adres).normalize('NFC');
}
// --- Madde başı: #/madde/<doğ|gel|ver> · doğrulanmış tanıklar + gerekçesiyle dışlanan benzerler + CSV
const MADDE = {
  'doğ': { ad: 'doğ- “doğmak”', kip: 'tuv-, tog-, töre- (ve ettirgenleri)', liste: () => V.altin, olumsuz: 'dog', not: 'tuv- ve tog- aynı fiildir (ET twg- > CC tog- ~ tuv-): CC I sözlüğünün 19a “doğarım” dizisinde togarmen, togdum, toggıl asıl yazıcıya, ⟨tuarmen⟩ ikinci bir ele aittir (Ünal 2010). Fark yazıcı/ağız katmanıdır, söz dizimi değil.' },
  'gel': { ad: 'gel- “gelmek”', kip: 'kėl-', liste: () => V.altin_kel, olumsuz: 'kel' },
  'ver': { ad: 'ver- “vermek”', kip: 'bėr-', liste: () => V.altin_ber, olumsuz: 'ber' },
};
const MADDE_ESLE = { 'doğ': 'doğ', 'dog': 'doğ', 'tuv': 'doğ', 'tog': 'doğ', 'töre': 'doğ', 'gel': 'gel', 'kėl': 'gel', 'kel': 'gel', 'ver': 'ver', 'bėr': 'ver', 'ber': 'ver' };
function maddeBul(q) { return MADDE_ESLE[kucuk(q.trim()).replace(/-$/, '')] || null; }
function maddeSayfasi(ad) {
  const m = MADDE[ad]; if (!m) { icerik.innerHTML = '<div class="bos">Bu madde başı için doğrulanmış liste yok. Olanlar: doğ-, gel-, ver-.</div>'; return; }
  const liste = m.liste() || [], olumsuz = (V.olumsuz || {})[m.olumsuz] || [];
  const satir = x => { const s = kimlik.get(x.satir); return '<tr><td><b>' + isle(x.bicim || '') + '</b></td><td class="tanik-metin">' + (s ? '<a href="#/tanik/' + s.id + '?q=' + encodeURIComponent(x.bicim || '') + '">' + isle(s.t) + '</a>' : isle(x.tanik)) + '</td><td>' + isle(x.yer) + '</td><td>' + (s ? s.tur || '' : '') + '</td><td><span class="cip kopya-' + (x.kopya_supesi || 'belirlenemez') + '">' + (KOPYA_AD[x.kopya_supesi] || '—') + '</span></td></tr>'; };
  const TUR_AD = { farkli_sozcuk: 'başka sözcük', turev_ad: 'türev ad', turev_fiil: 'türev fiil (ayrı madde)', katman_sizintisi: 'Türkçe satır', belirsiz: 'belirsiz' };
  icerik.innerHTML = '<p class="baslik-kucuk">Madde başı · ' + isle(m.ad) + '</p>' +
    '<p class="ozet">Kıpçakça biçimler: ' + isle(m.kip) + '. Neşrin dizininden çıkarılıp metinde satır satır doğrulanmış <b>' + liste.length + ' tanık</b>; gevşek aramada gelip tanık olmayan <b>' + olumsuz.length + ' benzer</b> gerekçesiyle aşağıda. <button class="dugme" id="csv">CSV indir</button></p>' + (m.not ? '<p class="not">' + isle(m.not) + '</p>' : '') +
    '<div class="tablo-sar"><table><thead><tr><th>Biçim</th><th>Tanık</th><th>Yer</th><th>Metin türü</th><th>Kopya şüphesi</th></tr></thead><tbody>' + liste.map(satir).join('') + '</tbody></table></div>' +
    '<h2 class="baslik-kucuk" style="margin-top:24px">Dışlanan benzerler</h2><div class="tablo-sar"><table><thead><tr><th>Biçim</th><th>Satır</th><th>Neden dışlandı</th></tr></thead><tbody>' +
    olumsuz.map(o => { const s = kimlik.get(o.satir); return '<tr><td><b>' + isle(o.bicim) + '</b> <span class="cip">' + (TUR_AD[o.tur] || o.tur) + '</span></td><td class="tanik-metin">' + (s ? '<a href="#/tanik/' + s.id + '">' + isle(s.t) + '</a>' : isle(o.satir)) + '</td><td>' + isle(o.neden) + '</td></tr>'; }).join('') + '</tbody></table></div>';
  document.getElementById('csv').onclick = () => {
    const kac = v => '"' + String(v ?? '').replace(/"/g, '""') + '"';
    const satirlar = [['kimlik', 'bicim', 'metin', 'yer', 'kitap_sayfa', 'metin_turu', 'latince', 'latince_kaynak', 'kopya_supesi', 'adres']].concat(liste.map(x => { const s = kimlik.get(x.satir) || {}; return [x.satir, x.bicim, s.t, x.yer, s.pdf ? sayfaEtiketi(s) : '', s.tur, x.latince, x.latince_kaynak, x.kopya_supesi, location.origin + location.pathname + '#/tanik/' + x.satir]; }));
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['\ufeff' + satirlar.map(r => r.map(kac).join(',')).join('\n')], { type: 'text/csv;charset=utf-8' }));
    a.download = 'metinhavuzu-' + ad + '.csv'; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  };
}
function tanikSayfasi(id, sorgu) {
  const s = kimlik.get(id);
  if (!s) { icerik.innerHTML = '<div class="bos">Bu adreste bir tanık yok: ' + isle(id) + '</div>'; return; }
  if (s.d === 'boun') return bounSayfasi(s, sorgu);
  if (s.d.startsWith('ttl')) return ttlSayfasi(s, sorgu);
  const par = paralelBul(s);
  const re = sorgu ? ifade(sorgu) : null;
  const adres = location.origin + location.pathname + '#/tanik/' + s.id;
  const bc = s.bc && V.bolum_ceviri[s.bc];
  const komsu = V.satirlar.filter(x => x.pdf === s.pdf && x.k === s.k && Math.abs(x.i - s.i) <= 2 && x.i !== s.i);
  icerik.innerHTML =
    (sorgu ? '<a class="geri" href="' + aramaAdresi(sorgu) + '">← Aramaya dön</a>' : '<a class="geri" href="#/">← Aramaya dön</a>') +
    '<div class="tanik"><article class="kart">' +
    '<h1>' + (re ? vurgula(s.t, re) : isle(s.t)) + '</h1>' +
    '<div class="alt ust-bosluk">' + (s.b ? '<span class="cip">' + isle(s.b) + '</span>' : '') + '<span class="cip">' + sayfaEtiketi(s) + '</span><span class="cip">' + s.k + '</span></div>' +
    '<h2>Türkçe çeviri</h2>' +
    (s.c ? '<p class="ceviri-buyuk">' + isle(s.c.replace(/ \/ /g, '\n')) + '</p><p class="not">' + CEVIRI_AD[s.ct] + '</p>' : '<p class="not">Bu satır için satır ya da kıta düzeyinde çeviri eşlenmedi.</p>') +
    (bc ? '<details' + (s.c ? '' : ' open') + '><summary>Bölümün tam Türkçe çevirisi</summary><pre>' + isle(bc) + '</pre></details>' : '') +
    (s.kt ? '<h2>Kıta</h2><p class="kita">' + (re ? vurgula(s.kt.replace(/ \/ /g, '\n'), re) : isle(s.kt.replace(/ \/ /g, '\n'))) + '</p>'
      : komsu.length ? '<h2>Bağlam</h2>' + komsu.map(x => '<div class="baglam">' + isle(x.t) + '</div>').join('') : '') +
    (par ? '<h2>Paralel metinler · ' + isle(par.ad) + '</h2><p class="not">Bu bölümün Latince aslı ve Türkçe çevirisi. Kıpçakça yapının Latince kalıbı izleyip izlemediğini görmek için.</p>' +
      (par.la ? '<details><summary>Latince asıl</summary><pre>' + isle(par.la) + '</pre></details>' : '') +
      (par.tr ? '<details><summary>Türkçe çeviri · ' + isle(par.tr_kaynak) + '</summary><pre>' + isle(par.tr) + '</pre></details>' : '<p class="not">Türkçe: ' + isle(par.tr_kaynak) + '</p>') : '') +
    '<h2>Kaynak</h2><dl class="kunye"><dt>Eser</dt><dd>Codex Cumanicus II</dd><dt>Neşir</dt><dd>Argunşah &amp; Güner 2015, Kesit</dd>' +
    (s.bs ? '<dt>Bölüm</dt><dd>' + isle(s.bs.replace(/\d+$/, '')) + '</dd>' : '') + (s.b ? '<dt>Yaprak aralığı</dt><dd>' + isle(s.b) + '</dd>' : '') +
    '<dt>Sayfa</dt><dd>' + sayfaEtiketi(s) + ' · PDF s. ' + s.pdf + '</dd><dt>Katman</dt><dd>' + s.k + (s.dz ? ' · <b>OCR düzeltmesi:</b> ' + isle(s.dz) : ' (ABBYY OCR)') + '</dd></dl>' +
    '<p class="ust-bosluk"><a class="dugme" href="#/etiketle/' + s.id + '">Bu satırı UD ile etiketle</a></p>' +
    '<h2>Kalıcı adres</h2><div class="adres"><input readonly value="' + isle(adres) + '" aria-label="Kalıcı adres"><button id="kopyala">Kopyala</button></div>' +
    '<h2>Atıf</h2><div class="adres"><input readonly id="atif" value="' + isle(atifMetni(s, adres)) + '" aria-label="Atıf"><button id="atifkopyala">Atıf kopyala</button></div>' +
    '<p class="not">Kalıcı kimlik <code>' + s.id + '</code>: derlem, kitap sayfası ve sütun (a/b), sütundaki sıra. İlk üretimde dondurulur; OCR düzeltmesinde değişmez.' + (s.eid ? ' Eski kimlik <code>' + s.eid + '</code> buraya yönlenir.' : '') + (s.dg ? ' <b>Bu satırın metni kimlik verildikten sonra değişti; etiketleri gözden geçirin.</b>' : '') + '</p>' +
    '</article><figure class="kart sayfa-gorsel"><img alt="Kaynak sayfa görüntüsü, ' + sayfaEtiketi(s) + '" src="veri/sayfalar/s' + String(s.pdf).padStart(3, '0') + '.jpg"><figcaption class="not">' + sayfaEtiketi(s) + ' · tıklayınca tam boyut</figcaption></figure></div>';
  document.querySelector('.sayfa-gorsel img').onclick = e => window.open(e.target.src, '_blank');
  document.getElementById('atifkopyala').onclick = async e => { const t = document.getElementById('atif').value; try { await navigator.clipboard.writeText(t); e.target.textContent = 'Kopyalandı'; } catch { document.getElementById('atif').select(); } };
  document.getElementById('kopyala').onclick = async e => { try { await navigator.clipboard.writeText(adres); e.target.textContent = 'Kopyalandı'; } catch { document.querySelector('.adres input').select(); } };
}

function altinSayfasi() {
  // Satır düzeyi: her tanık altin-liste/*.tsv içinde kalıcı satır kimliğine bağlı; sınama altin-liste/test_altin.py ile.
  const bagli = x => { const s = kimlik.get(x.satir); return s && s.k === 'metin' && kucuk(s.t.replace(/[\[\]]/g, '')).split(/[^\p{L}\d-]+/u).includes(x.bicim) ? s : null; };
  const hucre = x => { const s = bagli(x); return '<td class="tanik-metin">' + (s ? '<a href="#/tanik/' + s.id + '?q=' + encodeURIComponent(x.bicim) + '">' + isle(x.tanik) + '</a>' : isle(x.tanik)) + '</td>'; };
  const durum = x => '<td class="' + (bagli(x) ? 'ok">' + x.satir : 'bad">bağlı değil') + '</td>';
  let bulunan = 0, satir = '';
  const kopyaSay = {}; V.altin.forEach(a => kopyaSay[a.kopya_supesi] = (kopyaSay[a.kopya_supesi] || 0) + 1);
  for (const a of V.altin) {
    if (bagli(a)) bulunan++;
    satir += '<tr>' + durum(a) + '<td>' + a.madde_basi + '</td>' + hucre(a) + '<td>' + a.yer + '</td><td>' + a.kitap_sayfa + '</td>' +
      '<td class="latince">' + (a.latince ? '<i>' + isle(a.latince) + '</i><br>' : '') + '<span class="not">' + isle(a.latince_kaynak || '') + '</span></td>' +
      '<td><span class="cip kopya-' + (a.kopya_supesi || 'belirlenemez') + '" title="' + isle(a.kopya_notu || '') + '">' + (KOPYA_AD[a.kopya_supesi] || '—') + '</span></td></tr>';
  }
  const kelSay = {}; V.altin_kel.forEach(x => kelSay[x.konum] = (kelSay[x.konum] || 0) + 1);
  const kelTablo = '<h2 class="baslik-kucuk" style="margin-top:24px">kėl- “gelmek” · 37 tanık (dizin s. 731–732)</h2><p class="ozet">Konumlar elle: ' + Object.entries(kelSay).map(([k, n]) => (KONUM_AD[k] || k) + ' ' + n).join(', ') + '. Otomatik sınıflama ile: bulma 37/37, konum 36/37 (tek hata 63a/22 <i>kėlir aynada</i>, işlevce sıfat-fiil). Latince: 12 tanık özgün Kıpçakça bilmece (çeviri değil); birebir kalk 2 (<i>kėlsin sėniŋ ḫanlıḫıŋ</i> = <i>adveniat regnum tuum</i>, <i>kėlmek turur</i> = <i>venturus est</i>). <a href="#/karsilastir?kok=k%C4%97l&haric=kelepen%2C%20kele%C5%9F%2C%20k%C4%97lin%2C%20k%C4%97ltir%2C%20kelebek%2C%20kelle&lemma=gel">Karşılaştırmada aç</a></p><div class="tablo-sar"><table><thead><tr><th>Konum</th><th>Ek</th><th>Tanık (dizin)</th><th>Yer</th><th>Latince karşılık</th><th>Kopya şüphesi</th></tr></thead><tbody>' +
    V.altin_kel.map(x => '<tr><td>' + (KONUM_AD[x.konum] || x.konum) + '</td><td>' + isle(x.dizin_cozumu) + '</td>' + hucre(x) + '<td>' + x.yer + '</td><td class="latince">' + (x.latince ? '<i>' + isle(x.latince) + '</i><br>' : '') + '<span class="not">' + isle(x.latince_kaynak || '') + '</span></td><td><span class="cip kopya-' + (x.kopya_supesi || 'belirlenemez') + '" title="' + isle(x.kopya_notu || '') + '">' + (KOPYA_AD[x.kopya_supesi] || '—') + '</span></td></tr>').join('') + '</tbody></table></div>';
  const berSay = {}; V.altin_ber.forEach(x => berSay[x.konum] = (berSay[x.konum] || 0) + 1);
  const KULL = { 1: 'vermek', 2: 'tezlik yardımcı fiili', 3: 'birleşik fiil' };
  const berTablo = '<h2 class="baslik-kucuk" style="margin-top:24px">bėr- “vermek” · 24 tanık (dizin s. 656–657)</h2><p class="ozet">Konumlar elle: ' + Object.entries(berSay).map(([k, n]) => (KONUM_AD[k] || k) + ' ' + n).join(', ') + '. Otomatik sınıflama ile: bulma 24/24, konum 24/24. 82a/23 b <i>aytıp ye bėriŋiz</i> OCR\'da eksikti; kayıtlı düzeltmeyle eklendi. Latince: Ave ilahisindeki 7 tanığın 6\'sında Latincede “vermek” fiili yok (<i>bu karavnı saa bėrdi</i> ↔ <i>felix sanctorum mansio</i>); bėr- çoğunlukla çevirmenin seçimi. Tek birebir kalk <i>yėmiş bėrgen</i> = <i>ferens Fructum</i>. <a href="#/karsilastir?kok=b%C4%97r&haric=%3Db%C4%97ri%2C%20b%C4%97ril%2C%20b%C4%97rin%2C%20b%C4%97ri%C5%9F&lemma=ver">Karşılaştırmada aç</a></p><div class="tablo-sar"><table><thead><tr><th>Konum</th><th>Kullanım</th><th>Ek</th><th>Tanık (dizin)</th><th>Yer</th><th>Latince karşılık</th><th>Kopya şüphesi</th></tr></thead><tbody>' +
    V.altin_ber.map(x => '<tr><td>' + (KONUM_AD[x.konum] || x.konum) + '</td><td>' + KULL[x.kullanim] + '</td><td>' + isle(x.dizin_cozumu) + '</td>' + hucre(x) + '<td>' + x.yer + '</td><td class="latince">' + (x.latince ? '<i>' + isle(x.latince) + '</i><br>' : '') + '<span class="not">' + isle(x.latince_kaynak || '') + '</span></td><td><span class="cip kopya-' + (x.kopya_supesi || 'belirlenemez') + '" title="' + isle(x.kopya_notu || '') + '">' + (KOPYA_AD[x.kopya_supesi] || '—') + '</span></td></tr>').join('') + '</tbody></table></div>';
  icerik.innerHTML = '<p class="baslik-kucuk">Altın liste testi</p><p class="ozet">Neşrin dizininden çıkarılan ' + V.altin.length + ' tanığın ' + bulunan + ' tanesi kalıcı satır kimliğine bağlı ve o satırda beklenen biçim bütün sözcük olarak geçiyor (satır düzeyi). Gevşek doğ- aramasının 57 isabetinden 36\'sı altın tanık (kesinlik %63); kalan 21 isabet gerekçeleriyle olumsuz listede: başka kök 10 (<i>tuv</i> “dağ keçisi”, <i>togus</i> “dokuz”, <i>töre</i> “yasa”…), doğ- kökünden ad 9 (<i>toguş</i>, <i>tuvurdaçı</i>…), metin katmanına sızmış Türkçe çeviri satırı 2. kėl- kesinlik %69, bėr- %77; bu iki fiilin dışarıda kalan isabetleri de (kelepen “cüzamlı”, kėltir-, bėril-, bėri ilgeci…) olumsuz listede gerekçeli.</p><p class="ozet"><b>Latince kaynakla karşılaştırma:</b> ' + ['birebir_kalk', 'olasi_kalk', 'yok', 'belirlenemez'].map(k => KOPYA_AD[k] + ' ' + (kopyaSay[k] || 0)).join(' · ') + '. Kaynaklar: Credo, Vulgata (Luka 2, Matta 2), <i>A solis ortus cardine</i> , 27. ilahinin aslı <i>Ave, porta paradisi</i> (Theophilus de St. Aubin, 76 dörtlük) ve 29. ilahinin aslı <i>Verbum caro factum est / In hoc anni circulo</i>. Birebir kalklarda yapı Latinceyi izliyor (<i>Atadan</i> = <i>ex Patre</i>, <i>kimden atasız</i> = <i>de cuius … sine virili semine</i>, <i>kümüşley balkıdıŋ … kaçan töretdiŋ</i> = <i>ut argentum splenduisti quando … genuisti</i>); bunlar Kıpçakça söz dizimine kanıt sayılmamalı. “Latincede yok” tanıkları en değerlisi: Latince <i>te genuit</i> (belirtme) karşısında Kıpçakça <i>sėnden tuvmış</i> (ayrılma), Latince ilgi cümlesi karşısında Kıpçakça sıfat-fiil. Kaynak: <code>altin-liste/dog-CCII.tsv</code>, <code>kaynaklar/latince-metinler.md</code>.</p><div class="tablo-sar"><table><thead><tr><th>Satır</th><th>Madde başı</th><th>Tanık (dizin)</th><th>Yer</th><th>Kitap s.</th><th>Latince karşılık</th><th>Kopya şüphesi</th></tr></thead><tbody>' + satir + '</tbody></table></div>' + kelTablo + berTablo;
}

// --- Yapılacaklar: ekipteki etiketleyiciler için iş listesi (#/yapilacaklar)
function yapilacaklarSayfasi() {
  const tl = (id, ad) => '<a href="#/tanik/' + id + '">' + ad + '</a>';
  const sayi = Object.keys(kayitli()).length;
  icerik.innerHTML = '<p class="baslik-kucuk">Yapılacaklar</p>' +
    '<div class="uyari"><b>Başlamadan:</b> <a href="#/etiketler">Etiketle</a> sayfasında “Etiketleyici” kutusuna <b>kendi adını</b> yaz; kayıtlar bu adla tutulur. Kaydetmek için sayfadaki “giriş yapın” bağlantısını kullan (proje parolası). Kararlar: kılavuz ' + KILAVUZ + ' (K1–K8).</div>' +
    '<article class="kart yapilacak"><h2>1. Ön etiketleri denetle (' + sayi + ' cümle)</h2>' +
    '<p><a href="#/etiketler">Etiketle</a> → “Depodaki kayıtlı etiketler” listesinden bir cümle aç. Etiketler Claude\'un önerisidir; hiçbiri denetlenmedi. Yanlışları düzelt; değiştirdiğin cümle adınla sunucuya kaydedilir. Her cümlenin Latince karşılığı ve “Not” sütunu yol gösterir.</p>' +
    '<p>Özellikle bak:</p><ul>' +
    '<li><i>kim</i>: bağlaç mı ilgi zamiri mi (K5, açık)</li>' +
    '<li><i>-sėn / -mėn</i> kişi eki ayrı sözcük mü (ör. ' + tl('cc2.386a.07', 'yėr-sėn') + ')</li>' +
    '<li><i>tanıḫlık bėr-</i> birleşik fiil mi (' + tl('cc2.374a.09', '66b/8') + ')</li>' +
    '<li><i>taŋlarm</i>: OCR hatası mı (' + tl('cc2.386a.29', '72a/14') + ')</li>' +
    '<li><i>tözlikiŋ / yaratkanıŋ</i> çözümlemesi (' + tl('cc2.381a.28', '70b/12') + ')</li></ul></article>' +
    '<article class="kart yapilacak"><h2>2. Bağımsız etiketleme (uyuşma ölçümü)</h2>' +
    '<p>İkinci bir kişi aynı cümleleri <b>ön etiketlere bakmadan</b>, sıfırdan etiketlemeli. Ön etiketi görüp düzelten kişi bu ölçüme sayılmaz. Bir tanığı açıp “Bu satırı UD ile etiketle” deyince boş tablo gelir; ön etiket yalnız kayıtlı listeden açılır.</p>' +
    '<p>İki kişi bitirince: <a href="#/etiketler">Etiketle</a> → “Uyuşma” bölümünde iki adı seç → <b>Ölç</b>.</p></article>' +
    '<article class="kart yapilacak"><h2>3. Kısa kontroller</h2><ul>' +
    '<li>' + tl('cc2.407a.29', '82a/23 b') + ' <i>aytıp ye bėriŋiz</i>: OCR atlamış, elle eklendi. Basılı kitapta doğru mu?</li>' +
    '<li><i>keleşim</i> (60a, bilmece, ' + tl('cc2.343a.15', 'satır') + '): sözlükte bak; <i>kėl-</i> türevi mi, ayrı sözcük mü?</li>' +
    '<li>Latince asıllar: <i>Ave, porta paradisi</i> (27. ilahi) ve <i>In hoc anni circulo</i> (29. ilahi) metinlerini Drimba 1973 / Garkavets 2006 ile karşılaştır. Eşlemeler <a href="#/altin">Altın liste</a> sayfasındaki “Latince karşılık” sütununda.</li></ul></article>';
}

// --- Yönlendirme: #/  ·  #/ara?q=…  ·  #/tanik/<kimlik>?q=…  ·  #/altin
function yonlendir() {
  const [yol, sorgu = ''] = location.hash.slice(1).split('?');
  const p = new URLSearchParams(sorgu);
  derlem = DERLEM[p.get('d')] ? p.get('d') : 'hepsi';
  kip = p.get('kip') === 'tam' ? 'tam' : 'gevsek'; kipGoster();
  document.getElementById('basta').checked = p.get('bas') !== '0';
  document.getElementById('dizinli').checked = p.get('dizin') === '1';
  if (p.get('q')) q.value = p.get('q');
  document.body.dataset.sayfa = (yol.split('/')[1] || 'ana').replace(/^etiket.*/, 'etiket');
  const hero = document.getElementById('hero');
  document.getElementById('nav-ara').toggleAttribute('aria-current', !yol.startsWith('/altin'));
  document.getElementById('nav-altin').toggleAttribute('aria-current', yol.startsWith('/altin'));
  document.getElementById('nav-ara').toggleAttribute('aria-current', !yol.startsWith('/altin') && !yol.startsWith('/karsilastir'));
  document.getElementById('nav-karsi').toggleAttribute('aria-current', yol.startsWith('/karsilastir'));
  document.getElementById('nav-etiket').toggleAttribute('aria-current', yol.startsWith('/etiket'));
  document.getElementById('nav-yap').toggleAttribute('aria-current', yol.startsWith('/yapilacaklar'));
  if (yol.startsWith('/yapilacaklar')) document.getElementById('nav-ara').removeAttribute('aria-current');
  if (yol.startsWith('/etiket')) document.getElementById('nav-ara').removeAttribute('aria-current');
  for (const on of ['/tanik/', '/etiketle/']) {  // eski kimlikli kalıcı bağlantılar yeni kimliğe yönlenir
    if (yol.startsWith(on)) { const k = decodeURIComponent(yol.slice(on.length)), nk = on === '/etiketle/' ? cumleKimlik(k) : yeniKimlik(k); if (nk !== k) { location.replace('#' + on + encodeURIComponent(nk) + (p.toString() ? '?' + p : '')); return; } }
  }
  if (yol.startsWith('/tanik/')) {
    const s = kimlik.get(decodeURIComponent(yol.slice(7)));
    if (s && s.k !== 'metin') document.getElementById('dizinli').checked = true;
    hero.classList.add('kucuk'); tanikSayfasi(decodeURIComponent(yol.slice(7)), p.get('q'));
  } else if (yol.startsWith('/etiketle/')) { hero.classList.add('kucuk'); etiketSayfasi(decodeURIComponent(yol.slice(10))); }
  else if (yol.startsWith('/etiketler')) { hero.classList.add('kucuk'); etiketlerSayfasi(); }
  else if (yol.startsWith('/altin')) { hero.classList.add('kucuk'); altinSayfasi(); }
  else if (yol.startsWith('/madde/')) { hero.classList.add('kucuk'); maddeSayfasi(decodeURIComponent(yol.slice(7))); }
  else if (yol.startsWith('/yapilacaklar')) { hero.classList.add('kucuk'); yapilacaklarSayfasi(); }
  else if (yol.startsWith('/karsilastir')) { hero.classList.add('kucuk'); karsilastirSayfasi(p); }
  else if (yol.startsWith('/ara') && p.get('q')) { hero.classList.add('kucuk'); sonuclar(p.get('q')); }
  else { hero.classList.remove('kucuk'); q.value = ''; icerik.innerHTML = '<p class="baslik-kucuk">Pilot derlem</p><div class="kartlar"><div class="kart"><div class="kip-metin">Codex Cumanicus II · ' + V.satirlar.filter(s => s.d === 'cc2' && s.k === 'metin').length + ' metin satırı · ' + V.satirlar.filter(s => s.d === 'cc2' && s.k === 'ceviri').length + ' Türkçe çeviri satırı</div><div class="ceviri">Argunşah &amp; Güner 2015 neşri; ilahiler, vaazlar, İnanç Duası, sözlük bölümleri ve dizin.</div><div class="alt"><a class="cip vurgu" href="#/altin">doğ- altın listesi · 36 tanık</a></div></div></div>'; }
  window.scrollTo(0, 0);
}
window.addEventListener('hashchange', yonlendir);
yonlendir();
