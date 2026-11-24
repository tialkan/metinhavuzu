"""Claude'un ön etiketleri: doğ-/töre- tanıklarını içeren 17 cümle ve bėr- tanıklarını içeren 6 cümle (Codex Cumanicus II).
Biçim: her sözcük "biçim | madde başı | UPOS | özellikler | baş | ilişki | yönetilen hâl | not".
Çıktı: etiketler/on-etiket-claude-2026-11-24.conllu. Bu etiketler denetlenmemiştir; araştırmacı onayı gerekir.
"""
import json, re, sys
from pathlib import Path

KOK = Path(__file__).resolve().parent.parent
V = json.loads((KOK / "pilot/veri/veri.js").read_text(encoding="utf-8")[len("window.VERI = "):-2])
METIN = {s["id"]: s for s in V["satirlar"] if s.get("d") == "cc2"}
LATINCE = []  # doğ- ve bėr- altın listelerindeki Latince eşleme
for _ad in ("dog", "ber"):
    _L = [l.split("\t") for l in (KOK / f"altin-liste/{_ad}-CCII.tsv").read_text(encoding="utf-8").splitlines() if l and not l.startswith("#")]
    LATINCE += [dict(zip(_L[0], r)) for r in _L[1:]]

def satir_id(parca):
    adaylar = [s["id"] for s in METIN.values() if s["k"] == "metin" and parca in s["t"]]
    if not adaylar:
        sys.exit("bulunamadı: " + parca)
    return adaylar[0]

V3 = "Number=Sing|Person=3"
CUMLELER = [
 ("Lukas 61b/1-4 · kaçan Kristus togdı, kėldi", ["kaçan Kristus togdı", "frişte yışda ayttı"], """
Arı|arı|ADJ||2|amod||
Lukas|Lukas|PROPN||3|nsubj||
aytır|ayt|VERB|Aspect=Hab|Mood=Ind|Tense=Pres|{V3}|0|root||
Evangelim|Evangelim|PROPN||5|nmod:poss||
içinde|iç|NOUN|Case=Loc|Number[psor]=Sing|Person[psor]=3|3|obl|Loc|
,|,|PUNCT||14|punct||
nėçik|nėçik|SCONJ||14|mark||aktarılan söz için “nasıl ki” (K5'e benzer)
bugün|bugün|ADV||14|advmod||
,|,|PUNCT||12|punct||
kaçan|kaçan|SCONJ||12|mark||
Kristus|Kristus|PROPN||12|nsubj||
togdı|tog|VERB|Mood=Ind|Tense=Past|{V3}|14|advcl||doğ- tanığı 61b/1-2
,|,|PUNCT||12|punct||
kėldi|kėl|VERB|Mood=Ind|Tense=Past|{V3}|3|ccomp||kėl- tanığı 61b/1-2
frişte|frişte|NOUN|Case=Nom|14|nsubj||
yışda|yış|NOUN|Case=Loc|17|obl|Loc|
ayttı|ayt|VERB|Mood=Ind|Tense=Past|{V3}|14|conj||
kütövçige|kütövçi|NOUN|Case=Dat|17|obl|Dat|K4: yönelme hâlli alıcı obl
kim|kim|SCONJ||21|mark||K5 açık: ilgi
koylar|koy|NOUN|Case=Nom|Number=Plur|21|obj||belirtisiz nesne
küter|küt|VERB|Aspect=Hab|Tense=Pres|{V3}|18|acl||
.|.|PUNCT||3|punct||
"""),
 ("61b/3-4 · kim bugün togdı", ["kim bugün togdı barça"], """
"|"|PUNCT||3|punct||
Mėn|mėn|PRON|Case=Nom|Number=Sing|Person=1|3|nsubj||
tanıklatır-mėn|tanıklat|VERB|Aspect=Hab|Tense=Pres|Number=Sing|Person=1|0|root||kişi eki ayrı sözcük değil (sözcükleme kararı açık)
sizge|siz|PRON|Case=Dat|Number=Plur|Person=2|3|obl|Dat|
ulu|ulu|ADJ||6|amod||
sövünç|sövünç|NOUN|Case=Nom|3|obj||belirtisiz nesne
,|,|PUNCT||10|punct||
kim|kim|SCONJ||10|mark||K5 açık
bugün|bugün|ADV||10|advmod||
togdı|tog|VERB|Mood=Ind|Tense=Past|{V3}|3|ccomp||doğ- tanığı 61b/3-4; Luka 2:11 natus est vobis
barça|barça|DET||12|det||
ėlni|ėl|NOUN|Case=Acc|13|obj|Acc|
kutkardaçı|kutkar|VERB|VerbForm=Part|Tense=Fut|10|nsubj||ad gibi kullanılan sıfat-fiil (baş ad yok)
.|.|PUNCT||3|punct||
"""),
 ("61b/22-23 · Mariamdan togdı", ["Mariamdan togdı."], """
Bugün|bugün|ADV||5|advmod||
sėkizinçi|sėkizinçi|ADJ|NumType=Ord|3|amod||
kün|kün|NOUN|Case=Nom|5|obj||belirtisiz nesne; çeviri “günü”
,|,|PUNCT||5|punct||
agırlalık|agırla|VERB|Mood=Opt|Number=Plur|Person=1|0|root||
nėçik|nėçik|SCONJ||12|mark||
Bėyimiz|bėy|NOUN|Case=Nom|Number[psor]=Plur|Person[psor]=1|12|nsubj||
Tėŋeri|Tėŋri|PROPN||7|flat||
arı|arı|ADJ||10|amod||
kız|kız|NOUN||11|nmod||
Mariamdan|Mariam|PROPN|Case=Abl|12|obl|Abl|K3 kaynak
togdı|tog|VERB|Mood=Ind|Tense=Past|{V3}|5|advcl||doğ- tanığı 61b/22-23
.|.|PUNCT||5|punct||
"""),
 ("61b/39-40 · Haydatur ol kim togdı", ["Haydatur ol kim togdı"], """
"|"|PUNCT||2|punct||
Haydatur|kayda|ADV||0|root||ad cümlesi: kayda+dur
ol|ol|PRON|Case=Nom|Number=Sing|Person=3|2|nsubj||
kim|kim|PRON||5|nsubj||K5 açık: ilgi zamiri olarak özne
togdı|tog|VERB|Mood=Ind|Tense=Past|{V3}|3|acl||doğ- tanığı 61b/39-40
,|,|PUNCT||8|punct||
Cuhutlar|Cuhut|NOUN|Number=Plur|8|nmod:poss||
ḫanı|ḫan|NOUN|Number[psor]=Sing|Person[psor]=3|3|appos||
?|?|PUNCT||2|punct||
"""),
 ("62a/1-2 · Betlemde toggay", ["Betlemde toggay", "paygambardan."], """
Körgüzdiler|körgüz|VERB|Mood=Ind|Tense=Past|Number=Plur|Person=3|0|root||
alarga|ol|PRON|Case=Dat|Number=Plur|Person=3|1|obl|Dat|
kim|kim|SCONJ||6|mark||K5 açık
Kristus|Kristus|PROPN||6|nsubj||
Betlemde|Betlem|PROPN|Case=Loc|6|obl|Loc|
toggay|tog|VERB|Mood=Opt|{V3}|1|ccomp||doğ- tanığı 62a/1-2; dizinde tog[g]ay
,|,|PUNCT||10|punct||
burun|burun|ADV||10|advmod||
alay|alay|ADV||10|advmod||
aytıldı|ayt|VERB|Mood=Ind|Tense=Past|Voice=Pass|{V3}|1|parataxis||
paygambardan|paygambar|NOUN|Case=Abl|10|obl|Abl|edilgen eylemde eden
.|.|PUNCT||1|punct||
"""),
 ("73a/6-8 kıta 1 · Kristus bizge togup turur", ["Sövünç bizge bolup turur", "dünyege tirilik bėrilip turur", "Kristus bizge togup turur", "arı kız Mariamdan."], """
Sövünç|sövünç|NOUN|Case=Nom|3|nsubj||
bizge|biz|PRON|Case=Dat|Number=Plur|Person=1|3|obl|Dat|
bolup|bol|VERB|VerbForm=Conv|0|root||K1: -(I)p tur- yapısında asıl fiil kök
turur|tur|AUX|Aspect=Hab|{V3}|3|aux||
,|,|PUNCT||8|punct||
dünyege|dünye|NOUN|Case=Dat|8|obl|Dat|
tirilik|tirilik|NOUN|Case=Nom|8|nsubj||edilgen özne
bėrilip|bėr|VERB|VerbForm=Conv|Voice=Pass|3|conj||
turur|tur|AUX|Aspect=Hab|{V3}|8|aux||
,|,|PUNCT||13|punct||
Kristus|Kristus|PROPN||13|nsubj||
bizge|biz|PRON|Case=Dat|Number=Plur|Person=1|13|obl|Dat|K4 yararlanıcı (Rol=yararlanici); Luka 2:11 vobis
togup|tog|VERB|VerbForm=Conv|3|conj||doğ- tanığı 73a/8
turur|tur|AUX|Aspect=Hab|{V3}|13|aux||
arı|arı|ADJ||16|amod||
kız|kız|NOUN||17|nmod||
Mariamdan|Mariam|PROPN|Case=Abl|13|obl|Abl|K3 kaynak; yüklemden sonra: Latince nakarat dizesi de virgine Maria (In hoc anni circulo), birebir kalk
.|.|PUNCT||3|punct||
"""),
 ("73a/14-15 kıta 6 · kimden Bėyimiz togdı", ["Ė, ol algışlı", "kimden Bėyimiz togdı,", "dünye yazuḫın yuldı."], """
Ė|ė|INTJ||5|discourse||
,|,|PUNCT||1|punct||
ol|ol|DET||5|det||
algışlı|algışlı|ADJ||5|amod||
ḫatun|ḫatun|NOUN|Case=Nom|13|vocative||
,|,|PUNCT||9|punct||
kimden|kim|PRON|Case=Abl|9|obl|Abl|K3 kaynak; ilgi zamiri; Lat. cujus ventris sarcina (ilgi hâli): hâl Latinceden bağımsız
Bėyimiz|bėy|NOUN|Case=Nom|Number[psor]=Plur|Person[psor]=1|9|nsubj||
togdı|tog|VERB|Mood=Ind|Tense=Past|{V3}|5|acl||doğ- tanığı 73a/14-15
,|,|PUNCT||13|punct||
dünye|dünye|NOUN||12|nmod:poss||
yazuḫın|yazuḫ|NOUN|Case=Acc|Number[psor]=Sing|Person[psor]=3|13|obj|Acc|
yuldı|yul|VERB|Mood=Ind|Tense=Past|{V3}|0|root||öznesi bağlamdan (Bėyimiz)
.|.|PUNCT||13|punct||
"""),
 ("70a/12 kıta 27 · Tėŋri sėnden kaçan tuvmış", ["Ave kız, kimniŋ kovatı", "ėrdi Arı Tın mihiri;", "boyıŋ anda çiçeklenmiş,", "Tėŋri sėnden kaçan tuvmış."], """
Ave|ave|INTJ||2|discourse||Latince selamlama
kız|kız|NOUN|Case=Nom|13|vocative||
,|,|PUNCT||9|punct||
kimniŋ|kim|PRON|Case=Gen|5|nmod:poss||
kovatı|kovat|NOUN|Number[psor]=Sing|Person[psor]=3|9|nsubj||
ėrdi|ė|AUX|Tense=Past|{V3}|9|cop||
Arı|arı|ADJ||8|amod||
Tın|tın|NOUN||9|nmod:poss||
mihiri|mihir|NOUN|Number[psor]=Sing|Person[psor]=3|2|acl||ad yüklemli ilgi cümlesi
;|;|PUNCT||13|punct||
boyıŋ|boy|NOUN|Case=Nom|Number[psor]=Sing|Person[psor]=2|13|nsubj||
anda|anda|ADV||13|advmod||
çiçeklenmiş|çiçeklen|VERB|Evident=Nfh|Tense=Past|{V3}|0|root||
,|,|PUNCT||18|punct||
Tėŋri|Tėŋri|PROPN||18|nsubj||
sėnden|sėn|PRON|Case=Abl|Number=Sing|Person=2|18|obl|Abl|K3 kaynak; Lat. quando Christus te genuit (belirtme): hâl Latinceden bağımsız
kaçan|kaçan|SCONJ||18|mark||
tuvmış|tuv|VERB|Evident=Nfh|Tense=Past|{V3}|13|advcl||doğ- tanığı 70a/12
.|.|PUNCT||13|punct||
"""),
 ("69b/15 kıta 21 · kurtley tuvup", ["Ave kız, kimden atasız", "kurtley tuvup Bėyimiz", "burulıp turgan ılannı", "basıp yançtı, ėrksiz kıldı."], """
Ave|ave|INTJ||2|discourse||
kız|kız|NOUN|Case=Nom|13|vocative||
,|,|PUNCT||7|punct||
kimden|kim|PRON|Case=Abl|7|obl|Abl|K3 kaynak; ilgi zamiri; Lat. de cuius germine: birebir kalk
atasız|atasız|ADJ||7|advmod||durum bildiren
kurtley|kurt|NOUN|Case=Equ|7|obl|Equ|eşitlik hâli -lAy
tuvup|tuv|VERB|VerbForm=Conv|13|advcl||doğ- tanığı 69b/15
Bėyimiz|bėy|NOUN|Case=Nom|Number[psor]=Plur|Person[psor]=1|13|nsubj||
burulıp|burul|VERB|VerbForm=Conv|11|acl||K1: -(I)p tur- sıfat-fiil
turgan|tur|AUX|VerbForm=Part|9|aux||
ılannı|ılan|NOUN|Case=Acc|12|obj|Acc|
basıp|bas|VERB|VerbForm=Conv|13|advcl||
yançtı|yanç|VERB|Mood=Ind|Tense=Past|{V3}|0|root||
,|,|PUNCT||16|punct||
ėrksiz|ėrksiz|ADJ||16|xcomp||
kıldı|kıl|VERB|Mood=Ind|Tense=Past|{V3}|13|conj||
.|.|PUNCT||13|punct||
"""),
 ("69a/23-24 kıta 12 · kimniŋ tuvganı", ["Ave, kız, kimniŋ tuvganı", "iç közimizniŋ yarığı", "ėrip, azanını kutkardı", "ölüminde uyutmadı."], """
Ave|ave|INTJ||3|discourse||
,|,|PUNCT||1|punct||
kız|kız|NOUN|Case=Nom|14|vocative||
,|,|PUNCT||6|punct||
kimniŋ|kim|PRON|Case=Gen|6|nmod:poss||
tuvganı|tuv|VERB|VerbForm=Part|Number[psor]=Sing|Person[psor]=3|14|nsubj||doğ- tanığı 69a/23-24; başsız sıfat-fiil özne
,|,|PUNCT||10|punct||
iç|iç|NOUN||9|compound||
közimizniŋ|köz|NOUN|Case=Gen|Number[psor]=Plur|Person[psor]=1|10|nmod:poss||
yarığı|yarık|NOUN|Number[psor]=Sing|Person[psor]=3|6|appos||
ėrip|ėr|VERB|VerbForm=Conv|14|advcl||
,|,|PUNCT||14|punct||
azanını|azan|NOUN|Case=Acc|Number[psor]=Sing|Person[psor]=3|14|obj|Acc|okuma belirsiz (çeviri “adamı”)
kutkardı|kutkar|VERB|Mood=Ind|Tense=Past|{V3}|0|root||
,|,|PUNCT||17|punct||
ölüminde|ölüm|NOUN|Case=Loc|Number[psor]=Sing|Person[psor]=3|17|obl|Loc|
uyutmadı|uyut|VERB|Mood=Ind|Polarity=Neg|Tense=Past|{V3}|14|conj||
.|.|PUNCT||14|punct||
"""),
 ("72a/13-14 kıta 68 · Tėŋri tuvgan söz", ["Ave, kimge yaş yaşından", "us övretmiş Tėŋri tuvgan", "söz kim anıŋ köp taŋlarm", "ayta bilip-sėn barçasın."], """
Ave|ave|INTJ||0|root||hitap edilen “sen” iki ilgi cümlesiyle nitelenir
,|,|PUNCT||7|punct||
kimge|kim|PRON|Case=Dat|7|obl|Dat|ilgi zamiri
yaş|yaş|ADJ||5|amod||
yaşından|yaş|NOUN|Case=Abl|Number[psor]=Sing|Person[psor]=3|7|obl|Abl|
us|us|NOUN|Case=Nom|7|obj||belirtisiz nesne
övretmiş|övret|VERB|Evident=Nfh|Tense=Past|{V3}|1|acl||
Tėŋri|Tėŋri|PROPN|Case=Nom|9|nsubj|Nom|Lat. Verbum Patris (Ave porta paradisi 68. dörtlük; krş. 59: Verbum, Deus quod genuit): Tanrı'nın doğurduğu söz, tuv- geçişli; kaynak değil özne
tuvgan|tuv|VERB|VerbForm=Part|10|acl||doğ- tanığı 72a/13-14
söz|söz|NOUN|Case=Nom|7|nsubj||
kim|kim|SCONJ||16|mark||K5 açık
anıŋ|ol|PRON|Case=Gen|Number=Sing|Person=3|14|nmod:poss||
köp|köp|ADJ||14|amod||
taŋlarm|taŋ|NOUN|Number=Plur|15|obj||OCR/neşir: taŋların olmalı (çeviri “mucizelerinin”)
ayta|ayt|VERB|VerbForm=Conv|16|xcomp||-A bil- yeterlik
bilip-sėn|bil|VERB|Evident=Nfh|Number=Sing|Person=2|7|conj||
barçasın|barça|PRON|Case=Acc|Number[psor]=Sing|Person[psor]=3|14|appos|Acc|
.|.|PUNCT||1|punct||
"""),
 ("71b/15-16 kıta 59 · Tėŋriden tuvar", ["Ave, kim bolmış-sėn aar", "ana kim Tėŋriden tuvar", "sözley; alay bizge tėydi,", "ten kėyinip, Tėŋri sözi."], """
Ave|ave|INTJ||0|root||
,|,|PUNCT||4|punct||
kim|kim|SCONJ||4|mark||K5 açık
bolmış-sėn|bol|VERB|Evident=Nfh|Number=Sing|Person=2|1|acl||
aar|ol|PRON|Case=Dat|Number=Sing|Person=3|4|obl|Dat|
ana|ana|NOUN|Case=Nom|4|xcomp||
kim|kim|SCONJ||9|mark||K5 açık
Tėŋriden|Tėŋri|PROPN|Case=Abl|9|obl|Abl|K3 kaynak; Lat. Verbum, Deus quod genuit (özne): hâl Latinceden bağımsız
tuvar|tuv|VERB|VerbForm=Part|Aspect=Hab|10|acl||doğ- tanığı 71b/15-16; geniş zaman sıfat-fiili
sözley|söz|NOUN|Case=Equ|4|obl|Equ|eşitlik hâli -lAy
;|;|PUNCT||14|punct||
alay|alay|ADV||14|advmod||
bizge|biz|PRON|Case=Dat|Number=Plur|Person=1|14|obl|Dat|
tėydi|tėy|VERB|Mood=Ind|Tense=Past|{V3}|1|parataxis||
,|,|PUNCT||17|punct||
ten|ten|NOUN|Case=Nom|17|obj||
kėyinip|kėyin|VERB|VerbForm=Conv|14|advcl||
,|,|PUNCT||20|punct||
Tėŋri|Tėŋri|PROPN||20|nmod:poss||
sözi|söz|NOUN|Number[psor]=Sing|Person[psor]=3|14|nsubj||
.|.|PUNCT||1|punct||
"""),
 ("74b/3-5 İnanç Duası · yalguz tuvgan, Atadan tuvup turur, tözdeş tuvup turur", ["Dagı bir Bėyimiz Yesus Kristusga", "zamanalardan burun Atadan tuvup turur", "çın Tėŋriden, ėtilmey, Ataga tözdeş"], """
Dagı|dagı|CCONJ||5|cc||
bir|bir|NUM|NumType=Card|3|nummod||
Bėyimiz|bėy|NOUN|Number[psor]=Plur|Person[psor]=1|5|nmod||
Yesus|Yesus|PROPN||5|compound||
Kristusga|Kristus|PROPN|Case=Dat|0|root|Dat|eksiltili: önceki cümlenin “ınanır-mėn” yükleminin yönelme tümleci kök yapıldı
,|,|PUNCT||10|punct||
Tėŋriniŋ|Tėŋri|PROPN|Case=Gen|10|nmod:poss||
yalguz|yalguz|ADJ||9|advmod||
tuvgan|tuv|VERB|VerbForm=Part|10|acl||doğ- tanığı 74b/3; Lat. unigenitum
ovlu|ovul|NOUN|Number[psor]=Sing|Person[psor]=3|11|xcomp||
dėp|dė|VERB|VerbForm=Conv|5|acl||
kim|kim|SCONJ||17|mark||K5 açık; Lat. qui
barça|barça|DET||14|det||
zamanalardan|zamana|NOUN|Case=Abl|Number=Plur|17|obl|uygulanmaz|çıkma hâlini “burun” ilgeci yönetir
burun|burun|ADP||14|case||
Atadan|ata|NOUN|Case=Abl|17|obl|Abl|K3 kaynak; Lat. ex Patre natum: birebir kalk
tuvup|tuv|VERB|VerbForm=Conv|5|acl||doğ- tanığı 74b/3-4
turur|tur|AUX|Aspect=Hab|{V3}|17|aux||K1
,|,|PUNCT||20|punct||
Tėŋri|Tėŋri|PROPN||5|appos||Lat. Deum de Deo
Tėŋriden|Tėŋri|PROPN|Case=Abl|20|nmod||
,|,|PUNCT||23|punct||
Yarıḫ|yarıḫ|NOUN||20|conj||
Yarıḫtan|yarıḫ|NOUN|Case=Abl|23|nmod||
,|,|PUNCT||27|punct||
çın|çın|ADJ||27|amod||
Tėŋri|Tėŋri|PROPN||20|conj||
çın|çın|ADJ||29|amod||
Tėŋriden|Tėŋri|PROPN|Case=Abl|27|nmod||
,|,|PUNCT||31|punct||
ėtilmey|ėt|VERB|VerbForm=Conv|Polarity=Neg|Voice=Pass|35|advcl||Lat. non factum
,|,|PUNCT||35|punct||
Ataga|ata|NOUN|Case=Dat|34|obl|uygulanmaz|yönelme hâlini “tözdeş” yönetir, tuv- değil (bağlanma testi)
tözdeş|tözdeş|ADJ||35|xcomp||Lat. consubstantialem
tuvup|tuv|VERB|VerbForm=Conv|17|conj||doğ- tanığı 74b/5
turur|tur|AUX|Aspect=Hab|{V3}|35|aux||
,|,|PUNCT||42|punct||
andan|ol|PRON|Case=Abl|Number=Sing|Person=3|42|obl|Abl|
ulam|ulam|ADP||38|case||“aracılığıyla”; okuma belirsiz
bar|bar|ADJ||41|amod||
barça|barça|PRON|Case=Nom|42|nsubj||
bolgan|bol|VERB|VerbForm=Part|17|conj||
turur|tur|AUX|Aspect=Hab|{V3}|42|aux||
.|.|PUNCT||5|punct||
"""),
 ("76a/13-14 kıta 10 · kızdan Atası töredi, yaŋla tuvdı", ["Munıŋ dėy taŋış kim kördi", "kuru çıbuḫ yėmiş bėrdi", "kızdan Atası töredi,", "töretteçi yaŋla tuvdı."], """
Munıŋ|bu|PRON|Case=Gen|3|nmod||
dėy|dėy|ADP||1|case||“gibi”
taŋış|taŋış|NOUN|Case=Nom|5|obj||
kim|kim|PRON|Case=Nom|5|nsubj||soru zamiri
kördi|kör|VERB|Mood=Ind|Tense=Past|{V3}|0|root||
,|,|PUNCT||10|punct||
kuru|kuru|ADJ||8|amod||
çıbuḫ|çıbuḫ|NOUN|Case=Nom|10|nsubj||
yėmiş|yėmiş|NOUN|Case=Nom|10|compound:lvc||bėr- birleşik fiil (dizin anlam 3)
bėrdi|bėr|VERB|Mood=Ind|Tense=Past|{V3}|5|parataxis||bėr- tanığı 76a/13
,|,|PUNCT||14|punct||
kızdan|kız|NOUN|Case=Abl|14|obl|Abl|K3 kaynak
Atası|ata|NOUN|Number[psor]=Sing|Person[psor]=3|14|nsubj||
töredi|töre|VERB|Mood=Ind|Tense=Past|{V3}|5|parataxis||töre- tanığı 76a/13-14
,|,|PUNCT||18|punct||
töretteçi|töret|NOUN||18|nsubj||yaratan
yaŋla|yaŋla|ADV||18|advmod||
tuvdı|tuv|VERB|Mood=Ind|Tense=Past|{V3}|5|parataxis||doğ- tanığı 76a/14
.|.|PUNCT||5|punct||
"""),
 ("76a/1-2 kıta 1 · kız anadan dėp töredi", ["Kün tuvuşnıŋ buçgakından", "batışdagı kırıvga dėyin", "ėrkli Kristusnı öveli,", "kız anadan dėp töredi."], """
Kün|kün|NOUN||2|compound||“kün tuvuş” doğu
tuvuşnıŋ|tuvuş|NOUN|Case=Gen|3|nmod:poss||türemiş ad (K3 kapsamı)
buçgakından|buçgak|NOUN|Case=Abl|Number[psor]=Sing|Person[psor]=3|9|obl|Abl|
batışdagı|batış|ADJ||5|amod||+dagı
kırıvga|kırıv|NOUN|Case=Dat|9|obl|uygulanmaz|yönelme hâlini “dėyin” ilgeci yönetir
dėyin|dėyin|ADP||5|case||
ėrkli|ėrkli|ADJ||8|amod||
Kristusnı|Kristus|PROPN|Case=Acc|9|obj|Acc|
öveli|öv|VERB|Mood=Opt|Number=Plur|Person=1|0|root||
,|,|PUNCT||14|punct||
kız|kız|NOUN||12|nmod||
anadan|ana|NOUN|Case=Abl|14|obl|Abl|K3 kaynak; Lat. natum Maria virgine (ablatif): birebir kalk
dėp|dė|SCONJ||14|mark||“diye” yüklemden önce (çeviri/manzum sırası)
töredi|töre|VERB|Mood=Ind|Tense=Past|{V3}|9|advcl||töre- tanığı 76a/1-2
.|.|PUNCT||9|punct||
"""),
 ("76a/17 kıta 13 · tuvgan ovluna", ["Tuvurur Ataga ögünç", "tuvgan ovluna bėyenç", "Arı Tınga sövünç bolsun", "tėŋ tabuḫ üç tėŋdeşge tėysin"], """
Tuvurur|tuvur|VERB|VerbForm=Part|Aspect=Hab|2|acl||doğur- tanığı 76a/17
Ataga|ata|NOUN|Case=Dat|3|nmod|Dat|eksiltili: “bolsun” paylaşılıyor
ögünç|ögünç|NOUN|Case=Nom|11|conj||
,|,|PUNCT||7|punct||
tuvgan|tuv|VERB|VerbForm=Part|6|acl||doğ- tanığı 76a/17
ovluna|ovul|NOUN|Case=Dat|Number[psor]=Sing|Person[psor]=3|7|nmod|Dat|
bėyenç|bėyenç|NOUN|Case=Nom|11|conj||
,|,|PUNCT||11|punct||
Arı|arı|ADJ||10|amod||
Tınga|tın|NOUN|Case=Dat|12|obl|Dat|
sövünç|sövünç|NOUN|Case=Nom|12|nsubj||
bolsun|bol|VERB|Mood=Imp|{V3}|0|root||
,|,|PUNCT||18|punct||
tėŋ|tėŋ|ADJ||15|amod||
tabuḫ|tabuḫ|NOUN|Case=Nom|18|nsubj||
üç|üç|NUM|NumType=Card|17|nummod||
tėŋdeşge|tėŋdeş|NOUN|Case=Dat|18|obl|Dat|
tėysin|tėy|VERB|Mood=Imp|{V3}|12|conj||
.|.|PUNCT||12|punct||
"""),
 ("57b/19 sözlük · kün tuvmasdan burun", ["kün tuvmasdan burun"], """
kün|kün|NOUN|Case=Nom|2|nsubj||
tuvmasdan|tuv|VERB|VerbForm=Conv|Polarity=Neg|0|root||doğ- tanığı 57b/19; -mAsdAn burun “-madan önce”
burun|burun|ADP||2|case||sözlük maddesi: cümle değil
"""),
 # --- bėr- "vermek" (kılavuz 0.2) ---
 ("63b/29 Babamız · bizge bugün bėrgil", ["Kündegi ötmekimizni bizge bugün bėrgil"], """
Kündegi|kündegi|ADJ||2|amod||kün+DA+kI
ötmekimizni|ötmek|NOUN|Case=Acc|Number[psor]=Plur|Person[psor]=1|5|obj|Acc|Lat. panem nostrum
bizge|biz|PRON|Case=Dat|Number=Plur|Person=1|5|obl|Dat|K4 alıcı; Lat. nobis (datif örtüşüyor, bėr- için Kıpçakçada da doğal)
bugün|bugün|ADV||5|advmod||Lat. hodie
bėrgil|bėr|VERB|Mood=Imp|Number=Sing|Person=2|0|root||bėr- tanığı 63b/29; cümle “dagı …” ile sürüyor (ilk istek)
"""),
 ("66b/8 On emir · tanıḫlık bėrmegil", ["Yalgan tanıḫlık bėrmegil"], """
Yalgan|yalgan|ADJ||2|amod||
tanıḫlık|tanıḫlık|NOUN|Case=Nom|3|obj||belirtisiz nesne; birleşik fiil adayı (compound:lvc?); Lat. loqueris … falsum testimonium
bėrmegil|bėr|VERB|Mood=Imp|Number=Sing|Person=2|Polarity=Neg|0|root||bėr- tanığı 66b/8
.|.|PUNCT||3|punct||
"""),
 ("72a/5 kıta 64 · yėmiş bėrgen", ["Ave, yėr-sėn yemiş bėrgen", "Hava sıgıtın kėtergen", "aŋar kimler kim ınangay", "Tėŋrini körüp kovangay"], """
Ave|ave|INTJ||0|root||
,|,|PUNCT||3|punct||
yėr-sėn|yėr|NOUN|Case=Nom|Number=Sing|Person=2|1|parataxis||ad yüklem + 2. kişi eki (-mėn/-sėn kararı açık)
yemiş|yėmiş|NOUN|Case=Nom|5|obj||belirtisiz nesne
bėrgen|bėr|VERB|VerbForm=Part|3|acl||bėr- tanığı 72a/5; Lat. terra ferens Fructum (birebir kalk)
,|,|PUNCT||9|punct||
Hava|Hava|PROPN||8|nmod:poss||eksiz tamlayan
sıgıtın|sıgıt|NOUN|Case=Acc|Number[psor]=Sing|Person[psor]=3|9|obj|Acc|Lat. qui detersit Evae luctum
kėtergen|kėter|VERB|VerbForm=Part|5|conj||
,|,|PUNCT||14|punct||
aŋar|ol|PRON|Case=Dat|Number=Sing|Person=3|14|obl|Dat|ınan- yönelme istemi
kimler|kim|PRON|Number=Plur|18|nsubj||
kim|kim|SCONJ||14|mark||K5 açık
ınangay|ınan|VERB|Mood=Opt|{V3}|12|acl||Lat. quod qui pie confitentur
,|,|PUNCT||18|punct||
Tėŋrini|Tėŋri|PROPN|Case=Acc|17|obj|Acc|
körüp|kör|VERB|VerbForm=Conv|18|advcl||
kovangay|kovan|VERB|Mood=Opt|{V3}|1|parataxis||Lat. vultu Dei perfruentur
.|.|PUNCT||18|punct||
"""),
 ("71b/14 kıta 58 · karavnı saa bėrdi", ["Ave, mėŋü tınç konuşıŋ", "ėrür yėri arılarnıŋ;", "bu karavnı saa bėrdi,", "togus ay kim sėnde kondı."], """
Ave|ave|INTJ||0|root||
,|,|PUNCT||5|punct||
mėŋü|mėŋü|ADJ||5|amod||
tınç|tınç|ADJ||5|amod||Lat. quieta commoratio
konuşıŋ|konuş|NOUN|Case=Nom|Number[psor]=Sing|Person[psor]=2|7|nsubj||
ėrür|ėr|AUX|Aspect=Hab|{V3}|7|cop||ek-fiil
yėri|yėr|NOUN|Case=Nom|Number[psor]=Sing|Person[psor]=3|1|parataxis||Lat. sanctorum mansio
arılarnıŋ|arı|NOUN|Case=Gen|Number=Plur|7|nmod:poss||
;|;|PUNCT||7|punct||
bu|bu|DET||11|det||
karavnı|karav|NOUN|Case=Acc|13|obj|Acc|
saa|sėn|PRON|Case=Dat|Number=Sing|Person=2|13|obl|Dat|K4 alıcı
bėrdi|bėr|VERB|Mood=Ind|Tense=Past|{V3}|1|parataxis||bėr- tanığı 71b/14; Latincede vermek fiili yok (Kıpçakça seçim)
,|,|PUNCT||13|punct||
togus|togus|NUM||16|nummod||
ay|ay|NOUN|Case=Nom|19|obl||süre (eklenti); obl:tmod adayı
kim|kim|SCONJ||19|mark||K5 açık
sėnde|sėn|PRON|Case=Loc|Number=Sing|Person=2|19|obl|Loc|
kondı|kon|VERB|Mood=Ind|Tense=Past|{V3}|11|acl||karav'ı niteler
.|.|PUNCT||13|punct||
"""),
 ("70b/12 kıta 38 · birikgenni bėrdi saa", ["Ave saa kim tözlikiŋ", "yöpsinip yaratkanıŋ", "biriktiriptir ogluŋa,", "birikgenni bėrdi saa."], """
Ave|ave|INTJ||0|root||
saa|sėn|PRON|Case=Dat|Number=Sing|Person=2|1|obl|Dat|selamın yöneldiği kişi
kim|kim|SCONJ||7|mark||K5 açık
tözlikiŋ|tözlik|NOUN|Number[psor]=Sing|Person[psor]=2|7|obj||belirtme eki yüzeyde yok (iyelikli nesne?); Lat. cuius substantia; okuma belirsiz
yöpsinip|yöpsin|VERB|VerbForm=Conv|6|advcl||
yaratkanıŋ|yarat|VERB|VerbForm=Part|Number[psor]=Sing|Person[psor]=2|4|acl||çözümleme belirsiz
biriktiriptir|biriktir|VERB|Evident=Nfh|Tense=Past|{V3}|2|acl||
ogluŋa|ogul|NOUN|Case=Dat|Number[psor]=Sing|Person[psor]=2|7|obl|Dat|
,|,|PUNCT||7|punct||
birikgenni|birik|VERB|VerbForm=Part|Case=Acc|11|obj|Acc|başsız sıfat-fiil
bėrdi|bėr|VERB|Mood=Ind|Tense=Past|{V3}|7|conj||bėr- tanığı 70b/12; Latincede vermek fiili yok (Kıpçakça seçim)
saa|sėn|PRON|Case=Dat|Number=Sing|Person=2|11|obl|Dat|K4 alıcı
.|.|PUNCT||11|punct||
"""),
 ("61b/21 Stefanos · canın Tėŋeri ėline bėrdi", ["01 sözni ayttı da canın Tėŋeri ėline bėrdi."], """
01|ol|DET||2|det||OCR: Ol
sözni|söz|NOUN|Case=Acc|3|obj|Acc|
ayttı|ayt|VERB|Mood=Ind|Tense=Past|{V3}|0|root||
da|da|CCONJ||8|cc||
canın|can|NOUN|Case=Acc|Number[psor]=Sing|Person[psor]=3|8|obj|Acc|
Tėŋeri|Tėŋeri|PROPN||7|nmod:poss||eksiz tamlayan
ėline|ėl|NOUN|Case=Dat|Number[psor]=Sing|Person[psor]=3|8|obl|Dat|K4 alıcı (“Tanrı'nın eline”)
bėrdi|bėr|VERB|Mood=Ind|Tense=Past|{V3}|3|conj||bėr- tanığı 61b/21; krş. Elç. 7:59 (elde yok)
.|.|PUNCT||3|punct||
"""),
]

def kur():
    cikti, uyari = [], []
    for ad, parcalar, govde in CUMLELER:
        ids = [satir_id(p) for p in parcalar]
        satirlar = [l for l in govde.strip("\n").split("\n")]
        toks = []
        for l in satirlar:
            p = l.format(V3=V3).split("|")
            # biçim|madde|upos|özellikler (| içerebilir)|baş|ilişki|hâl|not
            form, lemma, upos = p[0], p[1], p[2]
            nott, hal, deprel, head = p[-1], p[-2], p[-3], p[-4]
            feats = "|".join(p[3:-4]) or "_"
            toks.append([form, lemma, upos, feats, head, deprel, hal, nott])
        n = len(toks)
        kok = [i for i, t in enumerate(toks) if t[5] == "root"]
        if len(kok) != 1:
            uyari.append(f"{ad}: kök sayısı {len(kok)}")
        for i, t in enumerate(toks):
            h = int(t[4])
            if h < 0 or h > n or h == i + 1:
                uyari.append(f"{ad}: {i+1} geçersiz baş {h}")
            if (h == 0) != (t[5] == "root"):
                uyari.append(f"{ad}: {i+1} root/0 uyumsuz")
        for i in range(n):  # döngü
            gorulen, k = set(), i + 1
            while k and k not in gorulen:
                gorulen.add(k); k = int(toks[k - 1][4])
            if k:
                uyari.append(f"{ad}: döngü {i+1}"); break
        # Cümle kimliği bir kez verilince değişmez: önce doğ- kökü geçen ilk satır (ilk 17 cümlenin kuralı), yoksa bėr- geçen ilk satır.
        kokler = ("bėr",) if "bėr" in ad else ("tog", "tuv", "töre")  # bėr- cümleleri adında “bėr” taşır
        sid = ids[0] if len(ids) == 1 else next(i for i in ids if any(w in METIN[i]["t"] for w in kokler))
        bas = [f"# sent_id = {sid}", f"# text = {' '.join(t[0] for t in toks)}", f"# kaynak_satirlar = {' '.join(ids)}",
               "# etiketleyici = Claude (ön etiket, denetlenmedi)", "# tarih = 2026-11-24", "# kilavuz = 0.2", f"# not = {ad}"]
        lat = [a for a in LATINCE if a["satir"] in ids and a.get("latince_kaynak")]
        if lat:
            a = lat[0]
            bas.append(f"# latince_kaynak = {a['latince_kaynak']}")
            if a.get("latince"):
                bas.append(f"# latince = {a['latince']}")
            bas.append("# kopya_supesi = " + " ".join(sorted({x['bicim'] + ':' + x['kopya_supesi'] for x in lat})))
        govde = []
        for i, t in enumerate(toks, 1):
            misc = []
            if t[6]:
                misc.append("YonetilenHal=" + t[6])
            misc.append("Okuma=nesir")
            if t[1] == "tur" and t[5] == "aux":
                misc.append("Periphrasis=Ip_tur")  # K1 (kılavuz 0.2)
            if t[7]:
                misc.append("Not=" + re.sub(r"[\s|=]+", "_", t[7]))
            govde.append("\t".join([str(i), t[0], t[1] or "_", t[2], "_", t[3], t[4], t[5], "_", "|".join(misc)]))
        cikti.append("\n".join(bas + govde) + "\n")
    return cikti, uyari

if __name__ == "__main__":
    c, u = kur()
    hedef = KOK / "etiketler" / "on-etiket-claude-2026-11-24.conllu"
    hedef.write_text("\n".join(c), encoding="utf-8")
    print(len(c), "cümle,", sum(sum(1 for l in x.splitlines() if l and not l.startswith("#")) for x in c), "sözcük ->", hedef)
    print("UYARILAR:", u or "yok")
