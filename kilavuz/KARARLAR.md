# Etiketleme kılavuzu: karar kaydı

Temel: UD Turkish BOUN kılavuzu (universaldependencies.org/tr). Burada yalnız Kıpçakçaya özgü ya da BOUN'dan ayrılan kararlar durur. Her karar: tarih, örnek tanık (kalıcı adresiyle), seçilen çözüm, gerekçe, alternatif. Kılavuz sürümü her CoNLL-U dosyasına `# kilavuz = ` satırıyla yazılır.

Kılavuz sürümü: **0.2 (24 Kasım 2026)**; 0.2: K1 BOUN sapması olarak kesinleşti. Aşağıdaki kararların çoğu henüz **açık**: ilk 10–20 cümle etiketlenince kapanacak.

## Proje alanları (UD MISC sütununda)

| Alan | Değer | Anlamı |
| --- | --- | --- |
| `YonetilenHal` | Nom, Acc, Dat, Loc, Abl, Gen, Ins, Equ, `uygulanmaz` | Bu ögenin bağlı olduğu yüklemin istediği hâl. Baş ad (yan cümlenin dışındaki, fiilimsinin nitelediği ad) için `uygulanmaz`. |
| `YuzeyIsaret` | ek ya da ilgeç, olduğu gibi | Ögenin üzerinde görünen işaret (ör. `+dan`, `bile`). |
| `Okuma` | `nesir`, `arastirmaci`, `belirsiz` | Biçimin hangi okumaya dayandığı. |
| `Kaynak` | tanık kimliği | Satırın kalıcı kimliği (ör. `cc2.394a.01`: derlem, kitap sayfası, sütun, sıra; `kimlik/cc2.tsv` içinde dondurulur). |

## Açık kararlar

### K1. *-(I)p tur-* yapısı: BOUN'dan bilinçli sapma
Örnek: *Atadan tuvup turur* (74b/3-4, `cc2.394a.04`), *Kristus bizge togup turur* (73a/8, `cc2.389a.27`).
Seçenekler: (a) *tuvup* baş, *turur* `aux`; (b) *turur* baş, *tuvup* `advcl`/`xcomp`; (c) *turur* `compound:lvc`.
Dayanaklar:
- Neşrin dizini (Argunşah & Güner 2015, *tur-* maddesi, kitap s. 853) *-(I/U)p turur*'u bir geçmiş zaman çekimi olarak sınıflıyor; bu (a)'yı destekler.
- Latince karşılıklar da çekimli yüklem: *ex Patre natum*, *nato nobis* (kaynaklar/latince-metinler.md). Yani bu yapı karşılaştırmada çekimli yüklem sayılmalı.
- **BOUN kılavuzu** (Turkish_deprel_guidelines) `aux`'u yalnız soru eki için kullanır (`aux:q`): "Turkish lacks most auxiliary elements". Dolayısıyla (a) kılavuzdan **sapmadır**.
- **BOUN ağaç derleminin kendisi** tutarsız: *-(I)p dur-* 10 tanıkta *dur-* 4 kez `aux`, 4 kez `compound:lvc`, 2 kez `advcl`; derlemin bütününde *dur* 7 kez `aux` (sayım: kaynaklar/ud-boun, 24 Kasım 2026).

**Karar (sürüm 0.2): (a).** *-(I)p tur-* (ve ileride *yat-*, *otur-*, *bar-*, *kal-*, *bėr-* yardımcı kullanımları) sözlüksel “durmak” anlamını yitirmişse sözlüksel fiil baş, *tur-* `aux` (`UPOS=AUX`); bütün tümleçler sözlüksel fiile bağlanır. Her *tur-* düğümüne MISC `Periphrasis=Ip_tur` yazılır.
**Çağdaş tarafa aynı kural:** BOUN cümlelerinde *-Ip dur-* karşılaştırmaya girerken aynı çözümlemeye dönüştürülür (`advcl`/`compound:lvc` → baş sözlüksel fiil, *dur* `aux`). Böylece “fiilin konumu” sütunundaki fark kural farkından değil dilden gelir.
**Duyarlılık:** Karşılaştırma tabloları (b) çözümlemesiyle de üretilir; sonuç tersine dönüyorsa “dayanıksız” işaretlenir (`Periphrasis=Ip_tur` iki çözümlemeyi de geri kurmaya yeter).
Sözlüksel “durmak” tanısı: araya ayrı zarf/özne girebiliyorsa ya da *tur-* yer tümleci alıyorsa yardımcı değildir; o zaman (b).

### K2. Baş ad
Örnek (sentetik): *Derse başlayan öğrencileri…*; CC'de *Tėŋri tuvgan söz* (72a/13-14).
Karar: baş ad fiilimsiye değil, ana yükleme bağlanır; sıfat-fiil baş ada `acl` ile bağlanır. Baş adın `YonetilenHal=uygulanmaz`.

### K3. Çıkma hâliyle kaynak (*Atadan tuvup*, *kimden … togdı*)
Karar: `obl`, `Case=Abl`, `YonetilenHal=Abl`.

### K4. Yönelme hâlli yararlanıcı (*bizge togup turur*, *size doğdu*)
Seçenekler: `obl` ya da `iobj`. BOUN Türkçe yönelme hâlli yararlanıcıyı çoğunlukla `obl` etiketler. **Geçici karar: `obl`**, MISC'te `Rol=yararlanici` (bilgi amaçlı).

### K5. *kim* ile kurulan yan cümle (*Ave Maria, kim bizge…*)
Seçenekler: *kim* `mark` ya da `nsubj` (ilgi zamiri). Latinceden çeviri kalıbı (*qui/quae*). **Açık.**

### K6. İlgeç *bile* (*canım bile*, *Tėŋri erki bile*)
Karar: *bile* `case`, bağlı ad `obl`; `YuzeyIsaret=bile`.

### K7. Editör ayraçları
*tu[v]gan* gibi editör tamamlamaları: biçim (FORM) metin katmanındaki gibi (ayraçsız); dizin okuması farklıysa `MISC: DizinOkuma=tu[v]gan`.

### K8. Cümle sınırı
OCR satırı cümle değildir. Etiketleme birimi editörün noktalamasına göre cümledir; ilahilerde kıta, kıta içinde noktalı virgül/nokta. Sitede satır, önceki/sonraki satırlarla birleştirilerek cümle kurulur; `# kaynak_satirlar =` ile kayıt altına alınır.

## K9 · Hitap ve ünlemlerin kökü (*Ave*, *Ė*)
**Karar:** Cümlede bağımsız çekimli bir ana yüklem varsa *Ave* / *Ė* `discourse` olarak o yükleme bağlanır; kök yüklemdir. Bağımsız ana yüklem yoksa (satırın tamamı *Ave*'ye bağlı ilgi cümlesi ya da yönelme tümleci: *Ave, kimge … övretmiş*; *Ave saa kim …*) *Ave* kök kalır. Bu, UD'nin "yüklemi olmayan cümlede kök en önemli öğedir" ilkesine uyar.
**Tanıklar:** kök yüklem: cc2.385a.09 (*yėri … bėrdi*), cc2.386a.07 (*yėr-sėn … kovangay*), cc2.385a.13 (*tėydi*); *Ave* kök: cc2.386a.28, cc2.381a.31.
**BOUN'dan sapma:** Yok.
**Gerekçe:** Dış hakem incelemesi (2026-11-24) aynı ilahinin kıtalarında tutarsız kök seçimini saptadı; öneri olan "ünlem hiçbir zaman kök olamaz" kuralı yüklemsiz kıtalarda UD'ye aykırı olacağı için sınırlı biçimde kabul edildi.
