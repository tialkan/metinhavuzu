# Metin Havuzu | Orkestrasyon belgesi

Hedef adres **metinhavuzu.com**. Bu belge araştırma amacını, veri sözleşmesini, iş paylaşımını ve canlıya çıkış ölçütlerini bir arada tutar. Çalışma klasöründe henüz kaynak metin, uygulama veya dağıtım yapılandırması bulunmuyor. İlk taslak `ORKESTRATOR.v1.md` dosyasında saklanır.

## Amaç

Metin Havuzu, tarihî (ilk olarak Kıpçak) ve çağdaş Türkçe metinlerdeki sözdizimsel farkları karşılaştırmak için kurulur. Temel birim, bağımlılık çözümlemeli ve kaynak yerine bağlı cümledir. Şema Universal Dependencies'e (UD) dayanır, gerekirse projeye özgü alanlarla genişletilir. Fiil istemi karşılaştırması bu çözümleme üzerinde çalışan ilk sorgudur. Sözcük dizilişi, yan cümle kurma yolu, ilgeç ve hâl seçimi aynı veriden sonra sorgulanır. Karşılaştırmalar elle doğrulanmış örneklem üzerinden yapılır. Metin türü, neşir ve kaynak dil her karşılaştırmada zorunlu katmandır. Sınıflama sözdizimseldir: ilk sürümde anlam etiketi yoktur.

## Dayanılacak kaynaklar (24 Kasım 2026 taraması)

| Kaynak | Ne işe yarar | Sınırı |
| --- | --- | --- |
| [UD Turkish BOUN](https://arxiv.org/abs/2002.10416) ve diğer UD Türkçe ağaç bankaları | Çağdaş Türkçe ön etiketleyiciyi eğitmek ve etiketleme kılavuzu örneği | BOUN 9.761 elle etiketlenmiş cümle. Türkçe bankalar arasında etiketleme tutarlılığı tam değil, tek bir bankanın kılavuzu seçilmeli. |
| [OTA-BOUN v2.0](https://aclanthology.org/2026.lrec-1.551/) (LREC 2026) | Tarihî Türkçe için en yakın yöntem örneği: UDPipe ön etiketleme + elle düzeltme, özgün yazı ve Latin çevriyazının sözcük düzeyinde hizalanması | Geç Osmanlıca (1.742 cümle). Kıpçakça değil, ama çift yazı katmanı ve yarı otomatik akış doğrudan örnek alınabilir. |
| [UD Old Turkish Clausal](https://universaldependencies.org/treebanks/otk_clausal) | Eski Türkçe için UD uygulamasının var olduğunu gösterir | 23 cümle, biçim özellikleri ve madde başı yok. Model eğitmeye yetmez. |
| UD [Kazakh KTB](https://universaldependencies.org/treebanks/kk_ktb), [Kyrgyz TueCL](https://universaldependencies.org/treebanks/ky_tuecl/), Tatar NMCTT | Çağdaş Kıpçak dillerinde ilişki ve özellik kararları için karşılaştırma | Çağdaş dillerdir. Tarihî Kıpçakçaya ön etiketleyici olarak ancak deneme amaçlı kullanılabilir. |
| Kıpçakça neşirler (ör. [Codex Cumanicus çalışması](https://acikerisim.ege.edu.tr/items/bfe589b3-b268-41b5-bd91-fd284eca8e24/full), [Ermeni harfli Kıpçakça mahkeme tutanakları](https://openaccess.marmara.edu.tr/entities/publication/663a9fd5-860a-4550-92df-ac117f17f1f7)) | Pilot metin adayları: çevriyazı, dizin ve çoğunda tıpkıbasım | Taramada aranabilir bir Kıpçakça sözdizimsel derlem bulunamadı. Kullanım izni ve sayfa/satır düzeni her neşir için ayrı denetlenir. |

Sonuç: Kıpçakça için hazır ağaç bankası yok. Proje bu boşluğu dolduracağı için katkısı bu noktadadır, ama ilk Kıpçakça etiketlemeler elle yapılacaktır. Yöntem OTA-BOUN'un çift katmanlı yarı otomatik akışını örnek alır.

**Eğitim.** [DTKM Dijital Türkolog Bootcamp 2026](https://digitalturcologych.com/tr/bilgi-transferi/bootcamp-2026/) tarihî Türk dillerine odaklanıyor, ilkeleri (insan denetimi, kanıtla doğrulama, izlenebilirlik, yeniden üretilebilirlik) bu belgeyle örtüşüyor. 2026 dönemi başvuruları kapandı (eğitim 21 Eylül–11 Aralık 2026). Sonraki dönem için bu proje başvuruda araştırma fikri olarak sunulabilir.

## Bir araştırmacının yapabilmesi gereken iş

Araştırmacı bir madde başı (örneğin **başla-**) yazar, bir veya birden çok dönem ve eser seçer. Sistem, seçilen belgelerde bu madde başına bağlanan kullanımları araştırmacının seçtiği kapsam düzeyinde aday olarak getirir ve geçtiği cümlede vurgular:

- **K0:** özgün yazım, birebir
- **K1:** çekimli biçimler ve fiilimsiler
- **K2:** çatı ekli biçimler
- **K3:** türemiş fiiller ve sözlükselleşmiş adlar

Her sonuçta kapsam düzeyi ve adayın durumu (onaylı, ret, belirsiz) görünür. Reddedilen adaylar silinmez. Elle işaretlenmiş örneklemle kapsamı ölçülmemiş sonuç “kapsamı ölçülmemiş” olarak gösterilir.

Araştırmacı bir sonuca tıklayarak özgün yazımı, biçimbirim çözümünü, bağımlılık ağacını ve sayfadaki yeri görür. Ardından kullanımları sözdizimsel çerçevelerine göre dönemler arasında yan yana açar.

## Kabul örnekleri (sentetik)

Aşağıdaki cümleler kabul testi için üretilmiştir. Tarihî tanık veya dönem farkına kanıt olarak kullanılamaz.

| Test cümlesi | Beklenen kayıt |
| --- | --- |
| Öğrenciler dün **derse başladılar**. | başla-dı-lar · çekimli yüklem · etken. “derse” ad öbeği, yönetilen hâl yönelme. “dün” belirteç, tümleç sayılmaz. |
| Çocuklar **başlamışlar**. | Tümleç yok. Hâl oranına girmez, “tümleçsiz” satırında sayılır. Tümlecin yokluğu fiilin yönelme tümleci almadığını göstermez. |
| Pazartesi öğrenciler metni **çevirmeye başladılar**. | “çevirmeye” başla-'ya bağlı fiilimsi öbeği (yönelme). “metni” çevir-'e bağlı nesne. Başla- + belirtme sorgusu bu tanığı getirmez. Fiilimsi tümleç ad tümleçten ayrı satırda sayılır. |
| **Derse başlayan** öğrencileri öğretmen tek tek selamladı. | başla- sıfat-fiil. “öğrencileri” başla- için baş ad, yönetilen hâl “uygulanmaz” (belirtme eki selamla-'dan gelir). Başla- + belirtme sorgusu getirmez, başla- + baş ad sorgusu getirir. |
| Askerlerin **başları** açıktı. | baş+lAr+I. Başla- aramasında aday çıkabilir, onaylı kullanım sayılmaz. Ret kaydı korunur. |

Her test bir tarihî tanık eklendiğinde özgün yazım ve kaynak konumu üzerinden tekrarlanır.

## Veri sözleşmesi

| Birim | Tutulacak bilgiler |
| --- | --- |
| Eser ve belge | Kalıcı kimlik, başlık, dönem veya saha, metin türü (özgün düzyazı, çeviri, gramer/sözlük örneği, manzum…), varsa kaynak dil, tarihleme ve belirsizliği, nüsha veya neşir, editör, kullanım izni, belge sürümü. Telif tarihi ile istinsah tarihi ayrı alanlardır. |
| Metin parçası | Sayfa/varak, satır veya paragraf, özgün metin, varsa çevriyazı ve normalleştirilmiş arama metni. Katmanlar aynı kaynak aralığına bağlanır. Karakter aralıkları NFC normalizasyonlu çevriyazı katmanında sayılır. Editörün cümle sınırı belirsizse satır ve çevre bağlamı gösterilir. |
| Cümle (UD) | Parça kimliği ve aralığı, CoNLL-U uyumlu sözcük satırları: biçim, madde başı, sözcük türü, biçim özellikleri (Case, Voice, VerbForm, Mood, Tense, Aspect, Person, Number, Polarity), baş, ilişki. Etiketleme durumu: otomatik, düzeltilmiş, iki kişiyle doğrulanmış. |
| Projeye özgü öge alanları | Yüzey işareti (ek veya ilgeç olduğu gibi), yönetilen hâl (baş adda “uygulanmaz”), okuma dayanağı (neşir okuması, araştırmacı okuması, belirsiz), yüzeyde bulunmayan öge. |
| Madde başı ve varyant | Dönemsel madde başı kimliği, ortak madde başına bağ ve bağın türü (yazım varyantı, köken ilişkisi). Neşre özgü kök varyant tablosu, gerekçesiyle. |
| Değerlendirme kaydı | Her düzeltmede kapsam (sözcük, cümle, madde başı), dayanak, öneren kişi/araç, inceleme durumu ve önceki sürüm saklanır. |

Kimlikler yeniden içe aktarmada korunur. Aynı tanık çoğalmaz, uzman düzeltmeleri kaybolmaz.

## Arama ve karşılaştırma

- **Arama.** Ham arama bütün metinlerde çalışır (K0–K3). Sözdizimsel sorgular yalnız UD ile etiketlenmiş cümlelerde çalışır ve sonuçta bu ayrım görünür.
- **Çevriyazı harfleriyle arama.** Arama kutusunun altında neşrin harf envanterinden gelen düğmeler bulunur (ė ŋ ḫ ve büyükleri); tıklanan harf imlecin bulunduğu yere eklenir. Klavyeden kısa yollar da çalışır: `e:` → ė, `n:` → ŋ, `h:` → ḫ (tablo neşre göre ayarlanır). Arama iki kipte çalışır: **tam** (yazılan harf aynen aranır) ve **gevşek** (varsayılan; e = ė, n ve ng = ŋ, h ve x = ḫ, büyük-küçük harf ve Unicode birleşik/ayrık yazım farkı yok sayılır). Gevşek kipte sonuçta eşleşen özgün yazım vurgulanır ve sonucun hangi kiple bulunduğu görünür. Gevşek denklikler ayrı bir tabloda tutulur ve sürümlenir. Kabul testleri: (1) `tengri` gevşek kipte *Tėŋri* tanıklarını getirir, tam kipte getirmez; (2) `Tėŋri` NFC ve NFD biçimlerinde yazıldığında aynı sonucu verir; (3) `ulah` gevşek kipte *ulaḫ*'ı getirir; (4) düğmeyle ve kısa yolla yazılan *ŋ* aynı karakterdir (U+014B).
- **Tarihî eşleştirme.** Kıpçak Türkçesinde arama neşrin çevriyazısını korur. Benzer yazılan biçimler kendiliğinden birleştirilmez. Varyant bağları neşre özgü tabloda tutulur.
- **Sonuç satırı.** Sol bağlam, vurgulu sözcük, sağ bağlam, eser ve yer bilgisi. Ayrıntıda tam cümle, komşu satırlar, biçimbirim dizisi, bağımlılık ağacı ve belirsiz okumalar.
- **Karşılaştırma.** Kullanımlar yalnız sözdizimsel çerçeveye göre gruplanır: çatı, tümleç türü (ad öbeği, fiilimsi öbeği, ilgeç öbeği, yok), tümlecin hâli veya ilgeci ve fiilin konumu (çekimli yüklem, sıfat-fiil, zarf-fiil, ad-fiil). Hâl oranları yalnız tümleç içeren kullanımlar üzerinden hesaplanır; tümleçsiz kullanımlar ayrı satırda sayılır. Her hücrede kullanım sayısı, belge sayısı, bağımsız bağlam sayısı ve belirsizlerin iki uca atanmasıyla bulunan alt ve üst sınır gösterilir. n < 5 olan hücrede oran gösterilmez, yalnız tanıklar listelenir. Karşılaştırılan sütunlar metin türü, neşir veya kaynak dilde ayrışıyorsa uyarı görünür. Belirsizler iki uca atandığında farkın yönü değişiyorsa sonuç “karar verilemez” olarak işaretlenir. Her hücre ilgili tanıklara açılır.
- **Araştırma çıktısı.** Filtreler, belge ve etiketleme sürümleri, künye ve tanık kimlikleriyle CSV ve CoNLL-U dışa aktarımı. Alıntı metninin görünürlüğü belge iznine bağlıdır.

## İş paylaşımı

**Ortak sözleşme (görevlerden önce dondurulur).** Karakter aralığının ait olduğu katman ve Unicode normalizasyonu; belge, parça, cümle ve sözcük kimlikleri; madde başı kimlikleri; UD ilişki ve özellik kümesi ile projeye özgü alanlar; belirsizlik gösterimi; dayanak ve sürüm alanları. Değişiklikleri orkestratör bu dosyaya kaydeder.

Pilot sırasında A ve B araştırmacıyla tek bir işaretleme döngüsü olarak yürür. C ve D, pilot denemeleri geçtikten sonra başlar. Gerçek belgeler görülmeden ekran, yayın ve genel bir Kıpçakça biçimbilim çözümleyicisi tasarlanmaz.

| Görev | Girdi → teslim | Bitiş ölçütü |
| --- | --- | --- |
| A · Derlem ve kaynak | İzinli pilot belgeler → sürümlü parçalar, künye ve izin kaydı | Her tanık kaynak yerine açılır. Yeniden içe aktarma kimlikleri korur. |
| B · Etiketleme | A'nın parçaları → UD ile etiketlenmiş cümleler, kök varyant tablosu, aday/ret kayıtları | Çağdaş metin ön etiketleyici + düzeltmeyle, Kıpçakça elle. Pilot denemeleri 1–5 raporlanır. |
| C · Arama ve araştırmacı ekranı | Dondurulmuş sözleşme ve pilot verisi → arama, bağlam, karşılaştırma, dışa aktarım | Hücredeki sayı açılan benzersiz tanıklarla uyuşur. Alt/üst sınır ve uyarılar görünür. |
| D · Doğrulama ve yayın | Birleşik pilot → kabul raporu, yayın sürümü, geri dönüş kaydı | metinhavuzu.com üzerinde kabul örnekleri ve kaynak bağlantısı doğrulanır. |

## Pilot

Malzeme: bir çağdaş ve bir Kıpçakça belgeden sürekli birer aralık. Her birinden yaklaşık 30–50 tam cümle UD ile etiketlenir. Etiketleme tek kişiyle yapılıyorsa örneklem 30 cümleye indirilebilir. Pilot fiil iki aralıkta da geçen bir fiil olarak seçilir.

1. **Kapsam:** Araştırmacı aralıktaki bütün pilot fiil tanıklarını elle işaretler. K1 düzeyinde geri getirim ve kesinlik raporlanır. Kaçırılan her örnek nedeniyle sınıflanır (varyant, ek, satır bölünmesi, okuma).
2. **Etiket tutarlılığı:** Yaklaşık 30 cümle iki kişi tarafından bağımsız etiketlenir. Tek kişi varsa aynı cümleler en az iki hafta arayla yeniden etiketlenir. Uyuşmazlıklar ilişki türüne göre raporlanır, gerekirse kılavuz değiştirilir.
3. **Duyarlılık:** Belirsizler iki uca atanır. Dönem farkının yönü değişiyorsa sonuç “karar verilemez” olur.
4. **Yeniden içe aktarma:** Aynı belge yeniden yüklenir. Tanık çoğalmamalı, düzeltmeler korunmalıdır.
5. **Kaynak kontrolü:** Raporlanan her sayıdan rastgele beş tanık kaynak sayfada kontrol edilir.

## Akademik yöntem: kodlama, normalleştirme, etiketleme

Amaç, her sonucun başka bir araştırmacı tarafından aynı kaynaktan yeniden üretilebilmesidir. Bunun için her katman ayrı, belgelenmiş ve sürümlüdür.

**1. Katmanlar (hiçbiri öbürünün üzerine yazılmaz).**

| Katman | İçerik | Kaynağı | Değiştiren |
| --- | --- | --- | --- |
| K0 görüntü | Sayfa taraması | İzinli PDF'ler | — |
| K1 diplomatik metin | OCR'dan gelen ve elle düzeltilen neşir metni, ayraçlar ve yazım olduğu gibi | ABBYY + düzeltme | Düzeltici (kayıtlı) |
| K2 dizin okuması | Neşir dizinindeki biçim (ör. *tu[v]gan*) | Dizin | — |
| K3 arama biçimi | Unicode NFC, küçük harf; gevşek denklik tablosuna göre katlanmış biçim | Kural dosyası | Kural sürümü |
| K4 dilbilimsel etiket | Biçimbirim, madde başı, UD özellik ve bağımlılık | Etiketleyici | Etiketleyici (kayıtlı) |
| K5 çeviri | Neşrin Türkçe çevirisi ve eşleme türü | Neşir | Eşleme kuralı |

**2. Kodlama.** Metin UTF-8, NFC. Harf envanteri (`envanter.tsv`): her karakter için Unicode kod noktası, adı, neşirdeki işlevi ve gevşek denkliği. Envanter dışı karakter içe aktarmada hata verir. Ayraçlar (`[ ]` editör tamamlaması, `( )`, `~` varyant, `/` satır sonu) ayrı birer işaret türü olarak kodlanır, metinden silinmez. Dışa aktarım biçimleri: CoNLL-U (etiketler), TEI XML (metin, sayfa/yaprak/satır ve editör işaretleri; `<pb/>`, `<lb/>`, `<supplied>`, `<choice>`), CSV (tanık listeleri).

**3. Normalleştirme.** K1 hiç normalleştirilmez. Normalleştirme yalnız K3'te, kural dosyası üzerinden yapılır: NFC, büyük-küçük harf (Türkçe kurallarıyla), gevşek denklikler (e = ė, n/ng = ŋ, h/x = ḫ). Her arama sonucu kullanılan kural sürümünü taşır. Kural değişikliği yeni sürümdür; eski sonuçlar eski sürümle yeniden üretilebilir.

**4. Etiketleme kılavuzu.** `kilavuz/` klasöründe tutulur: UD Türkçe (BOUN) kılavuzu temel alınır; Kıpçakçaya özgü kararlar (ör. *-(I)p tur-* yardımcı fiil mi, baş ad, ilgeç/hâl) karar kaydı olarak yazılır: tarih, örnek tanık (kalıcı adresiyle), seçilen çözüm, gerekçe, alternatif. Pilotta ilk 10–20 cümle kılavuzu sınar; kılavuz sürümü her etikette saklanır.

**5. Güvenilirlik.** Etiketlerin bir bölümü (en az %10, pilotta 30 cümle) iki kişi tarafından bağımsız etiketlenir. Biçim özellikleri için Cohen'in kappası, bağımlılık için LAS/UAS uyuşması raporlanır. Uyuşmazlıklar karar kaydına dönüşür. OCR için 5 sayfalık elle düzeltilmiş örnekte karakter hata oranı ve özel harf hata oranı ölçülür. Tanık bulma için altın listeye karşı geri getirim ve kesinlik raporlanır.

**6. Kaynak gösterme ve sürüm.** Her tanığın kalıcı kimliği vardır (kitap sayfası + metin özeti). Derlemin her yayımlanan hâli sürüm numarası alır (ör. 0.1.0) ve bir sürüm notu (ne eklendi, hangi kural/kılavuz sürümü) ile yayımlanır. Yayında künye önerisi verilir: “Metin Havuzu, sürüm X, erişim tarihi, tanık kimliği”. Kalıcı arşiv için ileride Zenodo DOI'si alınabilir (yalnız kendi ürettiğimiz etiket ve kodlar; telifli neşir metni değil).

**7. Telif ve yayın.** Neşir metni ve sayfa görüntüleri Kesit Yayınları'nın telifindedir. Kamuya açık yayında ne gösterileceği izin belgesine göre belirlenir; izin kamusal gösterimi kapsamıyorsa site parola korumalı çalışır ve kamuya yalnız künye, tanık kimliği ve kısa bağlam açılır.

## Teknoloji kararı (24 Kasım 2026)

- **Kalıcı olan dil değil, veri sözleşmesidir.** Cümleler CoNLL-U, tanık ve sürüm kayıtları PostgreSQL'de, aralarındaki bağ kalıcı kimliklerle tutulur. Uygulama dili değişse de veri olduğu gibi taşınır.
- **Pilot ve ilk sürüm: Python + Django + PostgreSQL.** UD araçları (conllu, Stanza, UDPipe, UD doğrulayıcısı) ve OCR/PDF işleme Python'dadır; şema pilotta sık değişecektir.
- **Arama motoru ayrı bir bileşendir.** Uygulama aramayı tanımlı bir arayüzden çağırır. Böylece büyüdüğünde arama, uygulamanın geri kalanına dokunmadan değiştirilebilir.
- **Rust'a geçiş ölçütü.** Derlem birkaç milyon sözcüğü aştığında ve tipik bir sözdizimsel sorgu birkaç saniyeden uzun sürdüğünde, önce hazır motorlar denenir (ör. Grew-match, ANNIS, NoSketch Engine). Bunlar yetmezse yalnız arama bileşeni Rust'la yazılır.

## Canlıya çıkış

Barındırma ve alan adı belirlendiğinde sürüm yedeği alınır, geri yükleme denenir, HTTPS yapılandırılır. Kamuya kapalı içerik arama, doğrudan bağlantı ve dışa aktarım üzerinden denetlenir. Yayın sonrası kabul örnekleri metinhavuzu.com üzerinde çalıştırılır ve sonuç bu belgeye tarih ve sürümle işlenir.

## Pilot kararları (24 Kasım 2026)

- **Tarihî metin: Codex Cumanicus.** Latin harfli, İtalyan ve Alman yazıcı geleneklerinde yazılmış. Neşirler arasında okuma farkı beklenir, bu yüzden tek neşir seçilir ve künyesi kaydedilir. Yer bilgisi yaprak (varak a/b) ve satır düzeyinde tutulur. Dinî metinlerin önemli kısmı Latinceden çeviridir: metin türü “çeviri”, kaynak dil “Latince” olarak işaretlenir. Sözlük bölümündeki tek sözcüklük maddeler sözdizimsel karşılaştırmaya girmez.
- **Neşir: Argunşah, Mustafa ve Güner, Galip (2015). *Codex Cumanicus*. İstanbul: Kesit Yayınları. ISBN 978-605-9100-59-5.** İnceleme yazılarına göre içerik: dil özellikleri ve yazım (ünlü/ünsüz yazımı, yak. s. 37–58), CC I metni (yak. s. 131–235), CC II metni (yak. s. 239–325), CC I dizini, kaynakça ve iki bölümün tıpkıbasımları (yak. s. 911–1079). Alman bölümünü Argunşah, İtalyan bölümünü Güner hazırlamıştır; iki bölümün çevriyazı tercihleri ayrı ayrı denetlenir. Sayfa aralıkları kitaptan doğrulanacak. Her tanık için üç yer tutulur: neşrin sayfa/satırı, yazmanın yaprağı (neşir veriyorsa) ve tıpkıbasım sayfası. Neşir metni telifli olduğundan kamusal gösterim için yayınevi izni gerekir; izin gelene kadar tam metin yalnız giriş yapmış etiketleyicilere açıktır, kamuya yalnız künye, yer ve kısa bağlam gösterilir.
- **Pilot fiil: doğ-.** İzinli CC II metninde *tuv-* ve *tog-* olarak geçer (dizin tanıkları aşağıda); *töre-* de aynı anlamda kullanılır. *Doğur-* ettirgen ve ayrı madde başıdır (K3); karşılaştırmaya ayrı satırla girer.
- **Doğ- için sözdizimsel sorgular:** kaynak bildiren öge (çıkma hâli mi, ilgeç mi?), yer/zaman belirteçleri, sıfat-fiil kullanımı (*doğan*, *doğmuş*). Çeviri etkisi uyarısı bu sorgularda özellikle görünür: Latince *natus ex …* gibi kalıpların Kıpçakça kuruluşa yansıması dönem farkı sayılmaz.
- **Çağdaş karşılaştırma metni:** biri türce yakın (dinî/çeviri), biri özgün düzyazı olmak üzere iki küçük parça. Böylece dönem farkı ile tür farkı ayrılabilir.
- **Etiketlemeyi araştırmacılar yapar, metinhavuzu.com üzerinde.** Bu nedenle sitenin ilk parçası etiketleme ekranıdır (aşağıda E görevi). Ekran kılavuz sınanmadan donmasın diye: ilk 10–20 cümle sitedeki en küçük ekranla etiketlenir, karar listesi güncellenir, ekran ondan sonra genişletilir. Etiketler her zaman CoNLL-U olarak dışa ve içe aktarılabilir; ekran değişse de veri kaybolmaz.

| Görev | Girdi → teslim | Bitiş ölçütü |
| --- | --- | --- |
| E · Etiketleme ekranı (metinhavuzu.com) | Ortak sözleşme → giriş yapan araştırmacının cümle seçip sözcüklere madde başı, özellik, baş ve ilişki atadığı ekran; projeye özgü alanlar; düzeltme geçmişi | Bir cümle etiketlenip CoNLL-U olarak dışa aktarılır, yeniden içe aktarılır, fark çıkmaz. İki kişinin aynı cümleye verdiği etiketler yan yana karşılaştırılır. Kaynak yaprak/satırına bağlantı açılır. |

Sıra: A (Codex Cumanicus neşri ve izin) → E'nin en küçük hâli → B (ilk 10–20 cümle, kılavuz güncellemesi) → pilot denemeleri → C ve D.

## İzinli malzeme ve ondan çıkan kararlar (24 Kasım 2026)

**Kapsam.** Kullanım izni yalnız `188Sayfa_Codex_Cumanicus_II_ABBYY_Fine_Reader_ocred.pdf` için vardır: Argunşah–Güner 2015, CC II metni, çevirisi ve CC II dizini. PDF'in her sayfası kitabın karşılıklı iki sayfasıdır (ör. PDF s. 30 = kitap s. 380–381). Eser kaydının izin alanı bu dosya ve sayfa aralığıyla sınırlanır; sistem bu aralık dışından içe aktarmayı reddeder. CC I bu pilotta yoktur.

**OCR durumu.** ABBYY metni özel harfleri (ė, ŋ, ḫ) büyük ölçüde korur. Sorunlar: iki kitap sayfası tek PDF sayfasında, Kıpçakça ile Türkçe çeviri yan yana sütunlarda, sağ sayfa eğik. İçe aktarmada önce sayfa ve sütun ayrılır, Kıpçakça satır ile çeviri satırı kıta/madde numarasından eşlenir, her parçaya kitap sayfası ve CC yaprağı (ör. 70a) bağlanır.

**İkinci tarama ve OCR karşılaştırması.** `Codex_Cumanicus.pdf` (186 sayfa, 53,8 MB) aynı kitap aralığının (s. 328–901) daha yüksek çözünürlüklü taramasıdır, metin katmanı yoktur. Kullanım izni bu taramayı da kapsar (araştırmacı teyidi, 24 Kasım 2026). Rol paylaşımı: görüntü katmanı bu taramadan (tanık doğrulama ve kaynak bağlantısı için), metin katmanı ABBYY çıktısından alınır. Bu taramadan üretilen markdown biçimli bir OCR örneğinde özel harfler sistemli biçimde yanlış eşlenmiştir: basılı *ŋ* → *ñ*, *ė* → *è/ê/é*, *ḫ* → *ḥ* (ör. *Tėŋri* → *Tèñri*). ABBYY bu harfleri doğru tanımıştır. Yeni bir OCR çıktısı kullanılmadan önce: (1) neşrin harf envanteri (ė, ŋ, ḫ, ğ, ö, ü, ı, ç, ş ve büyük biçimleri) bir dosyada tanımlanır; (2) envanter dışı her karakter içe aktarmada raporlanır; (3) 5 sayfalık elle düzeltilmiş örnekte karakter hata oranı ve özel harf hata oranı ayrı ölçülür; (4) altın listedeki 36 tanığın OCR'da birebir bulunma oranı raporlanır. Envanter eşlemesi (ñ → ŋ gibi) yalnız ölçümden sonra ve kayıtlı bir dönüşüm olarak uygulanır.

**Neşrin dizini altın listedir.** Dizin her tanığı yaprak/satırla verir (ör. *tuv-* t.-mış … 70a/12). Sistemin aday listesi dizinle otomatik karşılaştırılır; geri getirim elle işaretleme yapılmadan ölçülür. Dizinde olup sistemin bulamadığı ve sistemin bulup dizinde olmayan her örnek raporlanır. Dizin hatası da olabilir; ayrım kitap sayfasında yapılır.

**Dizinden çıkan tanık listesi (CC II, Argunşah–Güner 2015).** Yer = CC yaprağı/satırı, dizindeki gibi. ✓ = kitap sayfa görüntüsünde kontrol edildi.

| Madde başı | Tanık | Yer | Sözdizimsel not |
| --- | --- | --- | --- |
| tuv- | Tėŋri sėnden kaçan tuvmış | 70a/12 (kitap s. 380, kıta 27) ✓ | kaynak: çıkma hâli (*sėnden*); *kaçan* yan cümlesi |
| tuv- | Atadan tuvup turur | 74b/3–4 | kaynak: çıkma hâli; zarf-fiil + *tur-*; İnanç Duası çevirisi (Lat. *ex Patre natum*) |
| tuv- | Tėŋriden tuvar | 71b/15–16 | kaynak: çıkma hâli |
| tuv- | kimden atasız kurtley tu[v]up Bėy[i]miz Yesus | 69b/15 | kaynak: çıkma hâli; zarf-fiil |
| tuv- | kün tuvmasdan b[u]run | 57b/19 | *-mAsdAn burun* zarf-fiil yapısı; “Sözler” bölümü |
| tuv- | Tėŋri tuvgan söz | 72a/13–14 | sıfat-fiil |
| tuv- | Tėŋriniŋ yalguz tu[v]gan ovlu | 74b/3 | sıfat-fiil |
| tuv- | töret[t]eçi yaŋla tuvdı | 76a/14 | çekimli yüklem, belirteç |
| tog- | Hristus bizge togup t[u]rur arı kız Mariamdan | 73a/8 | *bizge* yönelme (yararlanıcı) + kaynak çıkma hâli |
| tog- | kimden Bėyimiz togdı | 73a/14–15 | kaynak: çıkma hâli, ilgi yan cümlesi |
| tog- | Bėy[i]miz Tėŋeri arı kız Mariamdan togdı | 61b/22–23 | kaynak: çıkma hâli; düzyazı vaaz |
| tog- | bugün togdı barça ėlni kutkardaçı | 61b/3–4 | düzyazı; İncil alıntısı |
| tog- | Betlemde tog[g]ay | 62a/1–2 | yer: bulunma hâli; istek kipi |

**Altın liste: `altin-liste/dog-CCII.tsv`.** Dizinin kitap s. 846, 850 ve 855–856'daki girişleri sayfa görüntüsünden eksiksiz aktarıldı; sayılar dizinin kendi [=n] toplamlarıyla uyuşur:

| Grup | Madde başları (dizin sayısı) | Tanık |
| --- | --- | --- |
| doğ- | tog- (7), tuv- (11) | 18 |
| doğur- | tuvur- (11), togur- (2), togır- (1), töret- (1) | 15 |
| töre- | töre- (2) — editör anlamı “türemek” | 2 |

Ayrıca dizinde ad olarak *tuvurdaçı* (3), *tuvurguçı* (1), *kün tuvuş*, *kün toguş* vardır; fiil sayılmaz. `metin_kontrol` sütununa göre 35 dizin tanığının hepsi metin sayfasında görüldü (24 Kasım 2026); kitap sayfası, bölüm/kıta ve okuma farkları dosyadadır. Dosyada bir de dizin dışı tanık vardır (76a/23).

**Dizinden çıkan yöntem kararları.**
- **Metin ile dizin aynı tanığı farklı yazar (35 tanığın hepsi metin sayfasında kontrol edildi).** Dizin pek çok tanıkta editör ayracı kullanır (*tu[v]gan*, *tog[g]ay*, *töre[t]diŋ*, *tu[v]ur[u]r*), metin sayfası aynı yerleri ayraçsız basar (*tuvgan*, *toggay*, *töretdiŋ*, *tuvurur*). Dizin *Ḫristus*, metin *Kristus* yazar. Hangisinin yazmayı yansıttığı izinli malzemeden (tıpkıbasım yok) çözülemez. Karar: metin katmanı metin sayfasından alınır; dizinin ayraçlı biçimi her tanığa “dizin okuması” olarak eklenir; ikisi farklıysa tanık “okuma farkı” bayrağı taşır. Arama iki katmanda da çalışır.
- **Dizinin de kaçırdığı tanık var.** Kitap s. 398'deki kısaltmalı satırda (76a/23) editör *tu* kısaltmalarını *tu[vurdaçı]* ve *tu[vurur]* diye açar; bu *tuvur-* tanığı dizinin listesinde yoktur. Özgün yazımda yalnız *tu* durduğu için hiçbir biçim araması bulamaz. Altın listeye “dizin dışı” olarak eklendi. Sonuç: dizin geri getirim ölçütü olarak kullanılır ama kusursuz sayılmaz.
- **Satır numarası yalnız dizinde.** Düzyazı metinlerde metin sayfası yalnız bölüm aralığını verir (ör. 61b/1-11); ilahilerde kıta numarası vardır. Tanığın satır yeri dizinden alınır, metin sayfası ve kıta/bölüm ayrı alanda tutulur.
- **Editörün dilbilgisel yorumu ayrı alandır.** Dizin *tur-* maddesinde *-(I/U)p turur* yapısını “öğrenilen/görülen geçmiş zaman” olarak sınıflar (kitap s. 853). UD'de bunun yardımcı fiil (aux) mi, ayrı yüklem mi sayılacağı proje kararıdır; editörün sınıflaması okuma dayanağı alanında saklanır, ilişki etiketine kendiliğinden dönüşmez.
- **Bağlanma testi (gerçek).** *ėtilmey, Ataga tözdeş tu[v]up turur* (74b/5): *Ataga* yönelme hâlindedir ama *tözdeş*'e bağlıdır, *tuv-*'a değil. *Tuv- + yönelme* sorgusu bu tanığı getirmemelidir. *Hristus bizge togup t[u]rur* (73a/8) ise getirmelidir.
- **Yer bilgisi.** Bazı yerler sütun harfi taşır (ör. *66b/20 b*). Yer alanı yaprak, yüz, satır ve sütun olarak ayrı tutulur.

**Gözlemler (pilot sorusu, kanıt değil).**
- Kaynak bildiren öge bu tanıklarda düzenli olarak çıkma hâlindedir. Çağdaş Türkçede de *-DAn doğ-* olduğundan bu noktada dönem farkı beklenmez; pilot bunu sınar.
- *Bizge togup turur* (73a/8) çağdaş *bizim için doğdu* karşısında yönelme hâlli bir yararlanıcı gösterir; karşılaştırmaya değer ilk sözdizimsel fark adayıdır. Tek tanıktır.
- *-(I)p tur-* yapısı (74b/3–4, 73a/8) ayrı bir sözdizimsel sorgu olarak izlenir.
- Tanıkların çoğu ilahi (manzum) ve Latinceden çeviridir. Manzum metinde sözcük dizilişi vezin ve kafiyeye bağlıdır; diziliş karşılaştırmasına girmez. Metin türü her parça için “manzum çeviri / düzyazı vaaz / sözlük maddesi / bilmece” olarak işaretlenir.
- Doğ- karşılığı olarak *töre-* de geçer (ör. *kız anadan dėp töredi*). Biçim araması bunu getirmez. Pilotta *tuv-*, *tog-*, *töre-* üç ayrı madde başı olarak izlenir; birleştirme araştırmacı kararıdır.

**Kabul testine eklenecek yanlış pozitifler (gerçek, aynı neşirden).**
- *tuv* “dağ keçisi”: *kulan alan tuv turur* 60a/10 → fiil sayılmaz.
- *tuvra* “doğru”: *tuvra mu arkrı mu* 81a/5 → sayılmaz.
- *tuvus-/tavus-* “tamamlamak” → sayılmaz.
- *togu-* “dokumak” (*böz togur* 82b/15), *togus* “dokuz” (71b/14) → *tog-* aramasında sayılmaz.

**Çağdaş karşılaştırma metni.** Neşrin Türkçe çevirisi çağdaş derlem olarak kullanılmaz: kaynak metni satır satır izler ve editörün tercihidir. Tür etkisini ayırmak için aynı dinî metinlerin (Ave Maria, İnanç Duası, Noel anlatısı) yayımlanmış çağdaş Türkçe çevirileri paralel kontrol metni olarak önerilir; izin ayrıca alınır. Bunun yanında bir özgün çağdaş düzyazı parçası kullanılır.

**Sayı uyarısı.** Pilotta doğ- için 20 civarında tanık vardır. Karşılaştırma ekranı bu pilotta oran göstermez; yalnız tanıkları çerçevelerine göre yan yana dizer.

**Kaynak eklemeleri (24 Kasım 2026).** `kaynaklar/` klasörüne UD Turkish BOUN (doğ-/doğur- 54 cümle), Latince asıllar, 1941 Türkçe Luka 2 ve Matta 2, Ave Maria Türkçesi ve hocanın verdiği *Tarihî Türk Lehçeleri* ders kitabı için notlar eklendi (`kaynaklar/KAYNAKLAR.md`). Kitaptan çıkan iki karar: (1) CC II'nin söz dizimi Alman yazıcıların çevirisi olduğu için “çoklukla kuralsız”dır; atasözü ve bilmeceler ayrı alt küme olarak işaretlenir ve dönem karşılaştırmasında çeviri metinlerden ayrı raporlanır. (2) Kök varyant tablosuna *tov-* eklenir (*tog- > tov- ~ tuv-*).

## Kapsam genişlemesi: pilottan derlem v0.1'e (24 Kasım 2026)

Elimizdeki kaynaklarla çalışma tek fiilli pilottan çıkar; ama karşılaştırma ilkeleri (tür, kaynak dil, belirsizlik, n < 5) aynen geçerlidir.

| Derlem | Dönem | Durum | Kullanım |
| --- | --- | --- | --- |
| Codex Cumanicus II (Argunşah & Güner 2015, izinli bölüm) | Kıpçak, 14. yy. | Aranabilir, çeviri eşlemeli, UD etiketi yok | Parolalı sitede |
| UD Turkish BOUN (9.761 cümle, CC BY-SA 4.0) | Çağdaş Türkçe, özgün düzyazı | Aranabilir, tam UD | Sitede (ShareAlike: türetilen veri CC BY-SA kalır) |
| Latince asıllar ve 1941 Türkçe çeviriler | Kaynak ve çağdaş-öncesi Türkçe | CC II bölümlerine paralel metin olarak bağlı | Sitede |
| *Tarihî Türk Lehçeleri* ders kitabı metin çözümlemeleri (Karahanlı, Harezm, Kıpçak: CC, Ermeni harfli, Memluk) | Karahanlı, Harezm, Kıpçak | **OCR düzeltmesi gerekli** (ŋ → “l)/lJ”, ḫ → “b” gibi sistemli hatalar; Tesseract ŋ'yi kaybediyor) | Telifli; izin netleşene kadar yalnız çalışma kopyası |

**Karşılaştırma ekranı (`#/karsilastir`).** Herhangi bir fiil için: Kıpçakça kök(ler) + hariç tutulacak biçimler ve çağdaş madde başı girilir. CC II tarafı otomatik ek tahminiyle (çekimli / sıfat-fiil / zarf-fiil / -(I)p tur- / ad-fiil / belirsiz), BOUN tarafı UD etiketleriyle sınıflanır; BOUN için tümleç türü ve hâli de sayılır. **Doğrulama:** doğ- için otomatik CC sınıflaması altın listeyle birebir örtüştü (19 kullanım = 18 altın tanık + 1 fiil olmayan *tuv*, belirsiz satırında). Başka fiiller için aynı doğrulama yapılmadan CC sütunu “otomatik, denetlenmedi” olarak okunur.

**Sıradaki adımlar (öncelik sırasıyla).**
1. ✓ (24 Kasım 2026) Ders kitabının Kıpçak metin çözümlemeleri (PDF s. 345–401) sayfa görüntülerinden çevriyazıya aktarıldı (`pilot/veri/_kaynak/ttl-kipcak/`), 179 satır üç derlem olarak eklendi: TTL·Kodeks Kumanikus, TTL·Ermeni harfli, TTL·Memluk. Örnek denetim: PDF 353 ve 381 görüntüyle harfi harfine örtüştü. Basılı sayfa numarası olmayan sayfalarda kitap sayfası “~” ile tahmindir (PDF + 4). Not (çevriyazıdan sonra): Bu metinler de çeviridir (Gülistan Farsçadan, İrşâdü’l-Mülûk Arapçadan, Algış Bitigi Ermeniceden). Yararı “özgün” olmaları değil, kaynak dillerinin farklı olmasıdır: bir yapı Latince, Farsça/Arapça ve Ermeniceden çevrilen metinlerin hepsinde görülüyorsa çeviri kalıbı olma olasılığı azalır.
2. ✓ (24 Kasım 2026) *kėl-* altın listesi (`altin-liste/kel-CCII.tsv`, dizin kitap s. 731–732, 37 tanık, konumlar elle). Otomatik sınıflama ile karşılaştırma: **bulma 37/37**; **konum 36/37** (kurallar eklendikten sonra; ilk sürümde 28/37). Eklenen kurallar: *-GAndIr* → yüklem, *-GAlI* → zarf-fiil, *-(I)yIr / -(I)yor* → çekimli. Kalan tek hata *kėlir aynada* “gelecek cuma” (63a/22): biçimce *-ir* ama işlevce sıfat-fiil; ekten çözülemez, söz dizimi etiketi gerekir. Ayrıca sözlük satırlarında Türkçe karşılık artık aranmıyor ve editörün metin içi notları (“… biçiminde yazılmıştır”) ayrı katmana (`not`) alındı. 
3. ✓ (24 Kasım 2026) *bėr-* altın listesi (`altin-liste/ber-CCII.tsv`, dizin kitap s. 656–657, 24 tanık; dizinin üç kullanım ayrımı korundu: vermek 17, tezlik yardımcı fiili 2, birleşik fiil 5). İlk denemede bulma 19/24 çıktı: hariç tutma listesindeki *bėri* öneki (“beri” zarfı için) *bėrir, bėriŋiz, bėriptir, bėrip turur* biçimlerini de kesiyordu. Hariç listesine tam sözcük eşleşmesi (`=bėri`) eklendi; *-(I)ptIr* kuralı eklendi; olumsuz emir *bėrmegil* ad-fiil sanılıyordu, düzeltildi. Bir tanık (82a/23 b *aytıp ye bėriŋiz*) OCR'da hiç yoktu: **kayıtlı OCR düzeltme katmanı** kuruldu (`pilot/ocr-duzeltme.tsv`: sayfa, işlem, gerekçe, denetleyen, tarih); düzeltilen satır tanık sayfasında işaretlenir. Son durum: **bulma 24/24, konum 24/24**.

**Üç fiilin toplu sonucu (CC II, otomatik sınıflama ↔ altın liste):** doğ- 18/18 bulma, 18/18 konum; kėl- 37/37, 36/37; bėr- 24/24, 24/24. Toplam 79 tanıkta 78 doğru konum. Tek hata söz dizimine bağlı (işlevce sıfat-fiil olan *kėlir*). İki ders: (1) hariç tutma listesi araştırmacı kararıdır ve sonucu doğrudan etkiler, bu yüzden her karşılaştırmanın adresinde saklanır; (2) altın liste OCR'ın atladığı satırları da yakalar.
3. CC II'nin atasözü ve bilmece bölümleri (ders kitabına göre söz dizimi genel Türkçeyle aynı) ayrı alt küme olarak işaretlenir.
4. ✓ (24 Kasım 2026) **UD etiketleme ekranı** (`#/etiketler`, `#/etiketle/<tanık>`; kod `pilot/etiket.js`). Satır seçilir, gerekirse önceki/sonraki satırla cümle kurulur (K8); her sözcük için madde başı, UPOS, özellikler, baş, ilişki ve proje alanları (yönetilen hâl, yüzey işareti, okuma dayanağı) girilir. Ağaç anında denetlenir (tek kök, eksik baş, döngü). Taslaklar tarayıcıda; kalıcı kayıt CoNLL-U dışa aktarımıyla `etiketler/` klasörüne. İki etiketleyicinin dosyalarından UAS, LAS ve UPOS / ilişki / hâl için Cohen κ hesaplanır. Önerilen ilk küme: depodaki kayıtlı cümleler (eski “14 satır” kuyruğu kaldırıldı; altın tanık yerine sayfada kökün ilk geçtiği satırı seçiyordu). Karar kaydı: `kilavuz/KARARLAR.md` (sürüm 0.1; K1–K8, çoğu açık). **Sınır:** sunucu tarafı kayıt yok; iki kişi aynı anda çalışırsa dosyaları ayrı ayrı indirmeli.
   - ✓ (24 Kasım 2026) **Ön etiket:** doğ- ve töre- tanıklarını içeren 17 cümle (295 sözcük) Claude tarafından ön etiketlendi (`etiketler/on-etiket-claude-2026-11-24.conllu`, üretici betik `etiketler/on-etiket.py`). Hepsi geçerli ağaç; her biçim kaynak satırla harfi harfine eşleşti. Etiketleyici alanı “Claude (ön etiket, denetlenmedi)”: **araştırmacı denetimi olmadan uyuşma ya da karşılaştırma için kullanılmaz.** Depodaki `etiketler/*.conllu` dosyaları siteye “kayıtlı etiket” olarak yüklenir; açılıp düzeltilir, araştırmacının adıyla yeniden dışa aktarılır. Ön etiketlemede çıkan dikkat noktaları: *Tėŋri tuvgan söz* (72a/13-14) yüzeyde çıkma eki yok ama çeviri “Tanrı'dan”; *taŋlarm* (72a/14) OCR ya da neşir hatası olabilir; *kız anadan dėp töredi* (76a/2) “dėp” yüklemden önce; İnanç Duası cümlesi eksiltili (yüklemi önceki cümlede).
5. Karahanlı ve Harezm metinleri, 1. adımdaki düzeltme yöntemi işe yararsa.

**Başlangıç durumu.** Görevler bekliyor. Açık ihtiyaçlar: Argunşah–Güner neşrinin dijital metni (kitaptan aktarım mı, yayınevinden dosya mı?), satır ve yaprak numaralandırmasının kitapta nasıl verildiği, Kesit Yayınları'ndan kamusal gösterim izni; çağdaş metinlerin seçimi; etiketleyecek kişilerin hesapları. Gerçek tarihî kullanım veya dönem farkı henüz doğrulanmadı.

## Kalıcı kimlik (24 Kasım 2026)
Tanık kimliği artık `derlem.kitapsayfası+sütun.sıra` (ör. `cc2.394a.01`, `ttl.353.12`). İlk üretimde `kimlik/cc2.tsv` ve `kimlik/ttl.tsv` içinde dondurulur (dosyalar metin taşımaz: kimlik, eski kimlik, grup, konum, metin özeti). Yeniden üretimde satır önce özetle, sonra konumla eşlenir; OCR düzeltmesi kimliği değiştirmez, satır "kayıttan sonra değişti" işareti alır; araya eklenen satır yeni numara alır, kimlikler yeniden kullanılmaz. Eski `sayfa-özet` kimlikleri yönlendirilir, tarayıcıdaki taslaklar ve içe aktarılan CoNLL-U kendiliğinden çevrilir. Test: `python3 kimlik/test_kimlik.py` (çakışma 0, nakarat, tek harf, araya ekleme).
Açık: yazma yaprak/satır (`74b/3`) satır düzeyinde yalnız dizinden çıkarılabilir; neşrin metin sayfalarında yazma satır numarası yok. Yaprak bilgisi bölüm düzeyinde duruyor.

## Satır düzeyi altın test (24 Kasım 2026)
Altın listelerdeki her tanık (`dog` 36, `kel` 37, `bėr` 24) `satir` + `bicim` sütunlarıyla kalıcı satır kimliğine bağlandı (`altin-liste/bagla.py`; bağ bir kez kurulur, elle bağlananlar `bag_notu = elle: …`). `altin-liste/test_altin.py` satırın var olduğunu, metin katmanında olduğunu ve biçimi bütün sözcük olarak içerdiğini sınar; doğ- için gevşek aramanın bütün isabetlerinin ya altın ya `olumsuz-dog-CCII.tsv`'de gerekçeli olmasını ister. Sonuç: 97/97 satır düzeyinde; gevşek arama kesinliği doğ- %63, kėl- %69, bėr- %77. Bozma denemesi (tuvmış → luvmış, fazladan tuvdı) test tarafından yakalanıyor.
Bulgular: 2 Türkçe çeviri satırı metin katmanına sızmış (cc2.382b.04, cc2.398b.14); dizinde yok-metinde var: 76a/23 tu[vurur] (doğ- tanıklarının 1/36'sı). Bölüm başlığı "70b" görünen ilahi satırları aslında 69a–72b aralığında (yaprak bilgisi bölüm düzeyinde güvenilir değil).
kėl- ve bėr- olumsuz listeleri eklendi: kėl- 17 isabet (kelepen "cüzamlı" 8, Türkçe karşılık/çeviri/not 5, kėlin "gelin", kėltir- 2, belirsiz keleşim 1), bėr- 7 isabet (bėri ilgeci, Türkçe karşılık 2, bėril-/bėrin-/bėriş- 4). Üç fiilde açıklanmayan isabet 0. Katman sızıntısı toplam 4 satır (cc2.382b.04, cc2.398b.14, cc2.339a.10, cc2.344a.28). Açık: keleşim (60a) sözlükte bakılmalı.

## Sunucuda etiket kaydı (24 Kasım 2026)
Etiketler artık etiketleyici adına sunucuda: `/kayit/<ad>.conllu` (nginx PUT, Coolify kalıcı birimi `/srv/kayit`). Tarayıcıdaki taslak ile sunucudaki dosya cümle cümle birleştirilir; her cümlede `# zaman` alanı daha yeni olan kalır, böylece başka bilgisayardan aynı adla girildiğinde taslaklar gelir ve hiçbir kayıt ötekinin üzerine körlemesine yazılmaz. Günlük yedek dosyası tutulur. Uyuşma ölçümü sunucudaki iki etiketleyici seçilerek yapılır (dosya yükleme yedek seçenek). Sınır: giriş ortak parolayla olduğundan kimlik, yazılan etiketleyici adıdır; kişi başı giriş Cloudflare Access ile gelecek.
Yerel sınama: gerçek nginx yapılandırmasıyla (parolasız 401, yazma yalnız `[a-z0-9-]{1,60}.conllu`, DELETE 403, 4 MB üstü 413, parola kapalıyken 403) ve tarayıcıda iki etiketleyiciyle uçtan uca.

## Latince eşleme (24 Kasım 2026)
doğ- altın listesindeki 36 tanığa `latince_kaynak`, `latince`, `eslesme` (birebir/yakin/kalip/aday/yok) ve `kopya_supesi` (birebir_kalk/olasi_kalk/yok/belirlenemez) eklendi; kaynak yalnız elimizdeki kamu malı Latince metinler (`kaynaklar/latince-metinler.md`). Sonuç: birebir kalk 5 (Credo 74b/3, 74b/3-4, 74b/5; Matta 2:2 61b/39-40; A solis ortus cardine 76a/1-2), olası kalk 4, Latincede karşılığı olmayan Kıpçakça seçim 5, belirlenemez 22 (çoğu 27. Ave Maria ilahisi ve 29. ilahi).
Sonuç için anlamı: Credo'daki *Atadan tuvup* (ex Patre natum), *Ataga tözdeş* (consubstantialem Patri) gibi hâl tanıkları kalk; dönem karşılaştırmasına girerken ayrı tutulmalı. Kopya şüphesi "yok" olan 5 tanık (61b/1-2, 61b/4-5, 61b/36-37, 76a/5-6 ×2) Kıpçakça seçime en güçlü kanıt.
Açık: 29. ilahinin aday kaynağı *Laetabundus* (yulduz kuyaşnı togurdı ~ sol de stella) ve 35. ilahinin doksolojisi doğrulanmadı; 27. Ave ilahisinin Latince aslı bulunmalı. Eşleme tek kişinin (Claude) önerisidir, Latince bilen biri denetlemeli.
Güncelleme: 27. Ave ilahisinin aslı bulundu: *Ave, porta paradisi* (Theophilus de St. Aubin, 76 dörtlük; neşrin dipnotu s. 375 de aynı yazarı veriyor). Latince metin `kaynaklar/latince-metinler.md` içinde, numaralı; dörtlük numaraları Kıpçakça kıta numaralarıyla örtüşüyor. Ave tanıklarından 12'si dörtlüğüne bağlandı (69b/1 örtüşmedi). Yeni dağılım: birebir kalk 9, olası kalk 4, Latincede yok 12, belirlenemez 11. Öne çıkan: Latince *te genuit* (belirtme) → Kıpçakça *sėnden tuvmış* (ayrılma); *Verbum, Deus quod genuit* → *Tėŋriden tuvar söz*; *Verbum Patris* → *Tėŋri tuvgan söz* (ön etiketteki "eksiz kaynak" sorusunun açıklaması). 29. ilahinin adayı *Laetabundus* değil, nakaratından *Verbum caro factum est / In hoc anni circulo* (Latince metin henüz elde yok); Venantius Fortunatus dipnotu 28. ilahiye ait. Metin lyricstranslate.com'dan alındı: Drimba 1973 / Garkavets 2006 ile karşılaştırılmalı.
Güncelleme 2: 29. ilahinin aslı bulundu: *Verbum caro factum est / In hoc anni circulo* (anonim, 12. yy.; Almanya-Bohemya biçimi). Kıpçakça kıtalar 1-6 Latince dörtlüklerle eşleşti (`kaynaklar/latince-metinler.md`). 73a/8 *bizge togup turur … Mariamdan* = *nato nobis parvulo de virgine Maria* (birebir kalk; yüklem sonrası diziliş nakarattan), 73a/10 *yulduz kuyaşnı togurdı* = *stella solem protulit* (birebir kalk), 73a/14-15 *kimden Bėyimiz togdı* ~ *cujus ventris sarcina* (hâl Latinceden bağımsız). Son dağılım: birebir kalk 11, olası kalk 4, Latincede yok 13, belirlenemez 8.

## Telif ve güvenlik (24 Kasım 2026)
- Önbellek: bütün yanıtlar `Cache-Control: private` (Cloudflare paylaşılan önbelleğine girmez), `X-Robots-Tag: noarchive`.
- Doğrudan IP: `KAYNAK_ANAHTARI` + Cloudflare Transform Rule (`X-Metinhavuzu-Anahtar`) ile Cloudflare'i atlayan istekler 403. **24 Kasım 2026 13:10 itibarıyla açık**; sınandı: doğrudan IP'den /, /veri/veri.js, /kayit/, /index.html → 403 (parola sorulmadan), Cloudflare üzerinden → 401 (parola ekranı), /saglik açık. Değer yalnız Cloudflare ve Coolify panelinde (Coolify'da derleme sırasında kapalı).
- Giriş: site herkese açık; yalnız etiket kaydı (`/kayit/`) ortak parolayla korunuyor. Etiket ekranında “giriş yapın” bağlantısı `/kayit/giris`'e gider, tarayıcı parolayı kayıt alanı için hatırlar (karar: kullanıcı, 24 Kasım 2026). Neşrin metni, çevirisi ve sayfa görüntüleri herkese açık; iznin yayımı kapsadığı kullanıcının sorumluluğunda (kullanıcıya hatırlatıldı). Arama motoru kapalı (`noindex`) kalıyor.
- Telifli veri ayrıldı: `pilot/veri` artık özel `tialkan/metin-havuzu-veri` deposunun alt modülü; `_kaynak/` altında ders kitabı çevriyazıları (ttl-kipcak), lisansı yayıma izin vermeyen PDF'ler (ota-boun, ud-kilavuz) ve Kuun taraması. Yayın imajından `_kaynak` silinir. Kod deposunun geçmişi yeniden yazılmadı (karar: kullanıcı): **kod deposu hiçbir zaman herkese açılmaz**; açılması gerekirse önce `git filter-repo` ile `pilot/veri` ve bu klasörler geçmişten temizlenmeli.

## K1 kesinleşti ve bėr- ön etiketi (24 Kasım 2026)
- Kılavuz 0.2: K1 (*-(I)p tur-* → sözlüksel fiil baş, *tur-* `aux`) BOUN kılavuzundan bilinçli sapma olarak yazıldı; BOUN ağaç derleminin kendisi *-Ip dur-*'da tutarsız (aux 4, compound:lvc 4, advcl 2). Aynı kural çağdaş tarafa uygulanacak; her *tur-* düğümü `Periphrasis=Ip_tur` taşıyor (duyarlılık analizi için).
- bėr- Latince eşleme: birebir kalk 1 (*yėmiş bėrgen* = *ferens Fructum*), olası kalk 1 (Babamız *bizge … bėrgil* = *da nobis*), Latincede yok 7, belirlenemez 15 (vaaz ve sözlük). Ave ilahisinde bėr- 7 tanığın 6'sında Latincede vermek fiili yok: istem (yönelme hâlli alıcı) Latinceden bağımsız.
- Ön etiket: 6 bėr- cümlesi eklendi (toplam 23 cümle, 365 sözcük; hepsi geçerli ağaç, bütün biçimler kaynak satırda). Hâlâ denetlenmedi.

## Katman sızıntısı ve karşılaştırma kuralları (24 Kasım 2026)
- Metin katmanına sızmış 394 Türkçe çeviri/açıklama satırı (metin katmanının ~%12'si) ayrı `ceviri` katmanına alındı (Türkçe görünen, Kıpçakça harf taşımayan, sözlük maddesi olmayan satırlar). Aramada varsayılan olarak çıkmaz. Kısa Türkçe satırlardan 3'ü (ör. *törenin tamamı ulaştı*) ölçüte takılmıyor; olumsuz listelerde `katman_sizintisi` olarak duruyor. Altın tanıkların hiçbiri etkilenmedi.
- Karşılaştırma ekranı: oran yalnız ≥5 tanık VE ≥3 metin birimi (CC/TTL: bölüm, BOUN: belge) varsa gösterilir; hücredeki tanıkların >%50'si tek birimden geliyorsa ⚠. “Latince kalk şüphelilerini çıkar” anahtarı (`kopya=1`) doğ-/bėr- altın listelerindeki birebir/olası kalkları çıkarır.
- İlk bulgu: doğ- için kalk şüphelileri çıkarılınca CC II'de *-(I)p tur-* 3 → 0. Bu yapının doğ- tanıkları yalnız Credo ve *In hoc anni circulo* kalklarında; Kıpçakça söz dizimine kanıt sayılmamalı (dönem karşılaştırmasında ayrı tutulmalı).

## Ek kaynak: Ünal 2010, CC I (24 Kasım 2026)
Orçun Ünal'ın *Kodeks Kumanikus 1a-55a* tezi (2010) CC'nin İtalyan bölümünü (Latince-Farsça-Kumanca sözlük) veriyor. Söz dizimi için metin olarak kullanılmaz, ama bir hakem sorusunu yanıtlıyor: 19a'daki “doğarım” dizisinde *tog-* asıl yazıcıya, *⟨tuarmen⟩* ikinci/üçüncü ele ait. Yani *tuv- ~ tog-* aynı fiilin yazıcı/ağız katmanı farkıdır; doğ- madde başında birleştirilmeleri doğru, karşılaştırmada ayrı fiil sayılmamalı. Tez özel veri deposunda; künye kaynaklar/KAYNAKLAR.md'de.
Yedek: Coolify'da etiket birimi için günlük yerel yedek planı açıldı; S3 hedefi olmadığı için yedek aynı sunucuda durur (sunucu kaybında yedek de gider). Uzak yedek için bir S3 uyumlu depolama hesabı gerekir.
İzleme: saatlik GitHub Actions denetimi (`.github/workflows/izleme.yml`) yazıldı ama GitHub hesabında ödeme/harcama sınırı sorunu yüzünden işler başlamıyor; görev devre dışı. Ödeme düzelince: `gh workflow enable izleme.yml`.
34. notalı ilahinin Latincesi açık kaynaklarda bulunamadı (neşir dipnotu: Drimba 1973: 320).
