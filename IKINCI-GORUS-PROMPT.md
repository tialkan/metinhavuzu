# İkinci görüş istemi: Metin Havuzu

Aşağıdaki metni olduğu gibi başka bir modele verin. Depo özel olduğu için gerekli bilgiler metnin içindedir.

---

Sen tarihî Türk dilleri, derlem dilbilimi (Universal Dependencies), dijital filoloji ve küçük ölçekli web altyapısı konularında deneyimli bir hakemsin. Aşağıda bir araştırma projesinin şimdiye kadarki durumunu anlatıyorum. Senden bağımsız, sert ve somut bir ikinci görüş istiyorum. Övgüye gerek yok; işe yaramayacak, yanlış sonuç üretecek ya da ileride pahalıya patlayacak yerleri bul.

## 1. Proje

**metinhavuzu.com**: Tarihî (ilk olarak Kıpçak) ve çağdaş Türkçe metinlerdeki **sözdizimsel** farkları karşılaştırmak için bir derlem ve arama sitesi. Araştırmacı bir fiilin geçtiği cümleleri bulur, her tanığı kaynak sayfasında doğrular, sonra aynı yapıdaki kullanımları dönemler arasında karşılaştırır (ör. fiil hangi tümleçleri hangi hâllerle alıyor).

Alınan temel kararlar:
- Sınıflama **sözdizimseldir, anlamsal değildir**. Anlam etiketi ilk sürümde yok.
- Temel birim: **Universal Dependencies (UD)** ile çözümlenmiş, kaynak yerine bağlı cümle. UD Turkish BOUN kılavuzu temel alınacak; OTA-BOUN (geç Osmanlıca, Arap harfli ve Latin çevriyazılı çift katman, UDPipe ön etiketleme + elle düzeltme) yöntem örneği.
- Karşılaştırma çerçevesi: çatı, tümleç türü (ad öbeği / fiilimsi öbeği / ilgeç öbeği / yok), tümlecin hâli veya ilgeci, fiilin konumu (çekimli yüklem / sıfat-fiil / zarf-fiil / ad-fiil). Hâl oranı yalnız tümleç içeren kullanımlarda hesaplanır; tümleçsizler ayrı satırda sayılır. Belirsiz örnekler iki uca atanarak alt/üst sınır gösterilir; n < 5 ise oran gösterilmez. Metin türü, neşir ve kaynak dil zorunlu katman.
- Her öge için ayrı alanlar: bağımlılık türü, yüzey işareti, **fiilin yönettiği hâl** (baş adda “uygulanmaz”), okuma dayanağı (neşir / araştırmacı / belirsiz).
- Katmanlar birbirinin üzerine yazılmaz: görüntü, diplomatik metin, dizin okuması, arama biçimi (normalleştirilmiş, kural sürümlü), dilbilimsel etiket, çeviri.
- Etiketlemeyi proje ekibi kendisi, sitedeki bir ekranla yapacak (henüz yok). Pilotta en az 30 cümle iki kişiyle ya da aynı kişiyle iki hafta arayla etiketlenip uyuşma ölçülecek (kappa, LAS/UAS).

## 2. Pilot malzeme

- **Tarihî:** Codex Cumanicus II, Argunşah & Güner 2015 (Kesit Yayınları) neşri. Kullanım izni yalnız 188 sayfalık bir taramaya (kitap s. 328–901: CC II metni, Türkçe çevirisi ve CC II dizini) var. Kamusal gösterim izni henüz netleşmedi; site bu yüzden parolalı.
- **Pilot fiil:** doğ- (CC II'de *tuv-* ve *tog-*; ayrıca editörün “türemek” diye verdiği *töre-*; doğur- karşılıkları *tuvur-, togur-, togır-, töret-*).
- **Altın liste:** Neşrin kendi dizininden çıkarıldı ve 35 tanığın hepsi metin sayfasında kontrol edildi: doğ- 18 (tog- 7, tuv- 11), doğur- 15, töre- 2, ayrıca dizinin kaçırdığı 1 tanık (76a/23, kısaltmalı satırda editörün *tu[vurur]* diye açtığı yer).
- Örnek tanıklar (yer = CC yaprağı/satırı, dizinden): *Tėŋri sėnden kaçan tuvmış* 70a/12 (kitap s. 380); *barça zamanalardan burun Atadan tuvup turur* 74b/3-4 (İnanç Duası, Latinceden çeviri); *Hristus bizge togup turur arı kız Mariamdan* 73a/8; *ėtilmey, Ataga tözdeş tuvup turur* 74b/5 (*Ataga* yönelme hâlinde ama *tözdeş*'e bağlı); *kün tuvmasdan burun* 57b/19 (sözlük maddesi).
- Gerçek yanlış pozitifler: *tuv* “dağ keçisi” 60a/10, *tuvra* “doğru” 81a/5, *tuvus-* “tamamlamak”, *togu-* “dokumak” 82b/15, *togus* “dokuz” 71b/14.
- Bulgular: dizin pek çok tanığı ayraçlı yazar (*tu[v]gan*, *tog[g]ay*), metin sayfası aynı yeri ayraçsız basar; dizin *Ḫristus*, metin *Kristus* yazar. Düzyazıda metin sayfası satır numarası vermez, satır bilgisi yalnız dizinde. Tanıkların çoğu Latinceden çevrilmiş manzum ilahi.
- **Çağdaş taraf henüz yok.** Öneri: aynı dinî metinlerin (Ave Maria, İnanç Duası, Noel anlatısı) yayımlanmış çağdaş Türkçe çevirileri paralel kontrol, ayrıca bir özgün çağdaş düzyazı parçası. Neşrin kendi Türkçe çevirisi çağdaş derlem sayılmayacak.

## 3. Şu an çalışan pilot

- ABBYY OCR metninden satırlar konumlarıyla çıkarılıyor (pdftotext -bbox-layout). İki kitap sayfası tek PDF sayfasında; yarı ve sütun konumdan bulunuyor. Özel harfler (ė, ŋ, ḫ) ABBYY'de doğru; başka bir OCR örneği bunları ñ, è/ê, ḥ'ye bozmuştu.
- Türkçe çeviri eşleme: ilahilerde kıtanın yanındaki sütun (443 satır), sözlük bölümlerinde tırnak içi karşılık (352), düzyazıda “n. Kıpçakça paragraf ↔ n. Türkçe paragraf” sıra eşlemesi (88, doğrulanmadı). 1.356 Kıpçakça metin satırının 473'üne satır/kıta düzeyinde çeviri bağlanamadı; bunlarda bölümün tam çevirisi gösteriliyor.
- Arama: tarayıcıda, tek HTML sayfası + veri dosyası. Sanal klavye (ė ŋ ḫ, OCR harf envanterinden), kısa yollar (`e:` → ė). Gevşek kip: e = ė, n/ng = ŋ, h/x = ḫ, NFC/NFD ve büyük-küçük harf farkı yok sayılır; tam kip ayrıca var. Metin / dizin / dipnot katmanları ayrı.
- Tanık kimliği: kitap sayfası + satır metninin SHA-1 özetinin ilk 6 hanesi (ör. `380-ef3a5e`); yeniden üretimde değişmiyor, OCR düzeltilirse değişir.
- Altın liste testi 36/36 geçiyor, ama yalnız kökün doğru kitap sayfasında geçtiğine bakıyor, tam satırı eşlemiyor.
- Etiketleme ekranı, UD/CoNLL-U katmanı, TEI dışa aktarımı, karşılaştırma ekranı henüz yok.

## 4. Altyapı

- Kod özel GitHub deposunda; telifli veri de (depo özel kaldığı sürece) orada.
- Coolify (Hetzner) üzerinde, root olmayan nginx kapsayıcısı, Dockerfile. Sıkı CSP (inline script/stil yok), HSTS max-age 1 yıl, Permissions-Policy, noindex, robots Disallow, HTTP Basic Auth (parola ortam değişkeninden).
- Cloudflare: proxy açık, SSL Full (strict), Always Use HTTPS, www → kök 301 kuralı.
- Teknoloji kararı: ilk sürüm Python (+ ileride Django/PostgreSQL), veri sözleşmesi dilden bağımsız (CoNLL-U + PostgreSQL); arama ayrı bileşen; büyük ölçekte önce Grew-match / ANNIS / NoSketch Engine, gerekirse Rust.
- Logo: QuiverAI Arrow 2 Telos ile çizilmiş kaligrafik ŋ simgesi + yazıt harfli METİN HAVUZU; ekibin kendi tasarım kontrol listesi yapay zekâ görselini yasakladığı için bu bir istisna.

## 5. Senden istediklerim

Her bölümde en fazla 5 madde, önem sırasıyla. Her madde için: **sorun**, **neden önemli (somut hata senaryosu)**, **önerdiğin değişiklik**, **değişikliğin işe yaradığını gösterecek test**.

1. **Araştırma tasarımı:** Bu kurulumla “Kıpçakça ile çağdaş Türkçe arasında sözdizimsel fark var” denebilir mi? Tür (manzum çeviri), kaynak dil (Latince), tek neşir, az tanık ve OCR/neşir okuma farkları sonucu nasıl çarpıtır? Pilot fiil doğ- iyi bir seçim mi; yoksa hangi fiil(ler) daha bilgilendirici olur ve neden?
2. **UD uygulaması:** Kıpçakça için UD'de en zor kararlar hangileri (*-(I)p tur-* yardımcı fiil mi, zarf-fiil zincirleri, ilgeç/hâl, *kim* ile kurulan yan cümleler, iyelik/ilgi)? Bunları baştan karar kaydına bağlamazsak neler birleşmez? OTA-BOUN'dan ne alınmalı, ne alınmamalı?
3. **Veri modeli ve kalıcılık:** Tanık kimliği, katmanlar, ayraçlı/ayraçsız okuma, dizin ile metin farkı, çeviri eşleme türleri için tasarımda göremediğim zayıflık var mı? TEI ve CoNLL-U birlikte nasıl tutulmalı?
4. **Değerlendirme:** Altın liste testi, OCR hata oranı, etiketleyici uyuşması ve duyarlılık testi yeterli mi? Neyi ölçmüyoruz?
5. **Sonraki 4–6 hafta için yol haritası:** Somut, sıralı adımlar; her adımın “bitti” ölçütüyle. Hangi işi şimdi yapmak boşa emek olur?
6. **Altyapı ve güvenlik:** Statik pilot + Basic Auth + Cloudflare kurulumunda risk; telifli verinin özel GitHub deposunda durması; ileride kamuya açılırken dikkat edilecekler.
7. **Ürün:** Bir Türkoloğun bu siteyi gerçekten kullanması için eksik olan en önemli 3 şey.

Kurallar:
- Kıpçakça tanık uyduracaksan uydurma. Tanık verirsen eser, neşir ve yer bilgisini ver; doğrulayamıyorsan “doğrulanmadı” yaz. Kendi ürettiğin örnek cümleleri açıkça “üretilmiş” diye işaretle.
- Kaynak gösterdiğin her yayın gerçek olsun; emin değilsen yazma.
- Genel tavsiye değil, bu projeye özgü öneri ver.
- Sonda, benim bilmediğim ama karar vermek için bilmem gereken en fazla 3 soruyu yaz.
