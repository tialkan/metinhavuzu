"""Pilot verisini hazırlar: ABBYY metninden satırlar (konumlarıyla), Türkçe çeviri eşlemesi,
katman (metin/dizin), bölüm ve yaprak bilgisi, sayfa görüntüleri ve altın liste.

Kullanım: python3 pilot/hazirla.py /yol/188Sayfa_Codex_Cumanicus_II_ABBYY_Fine_Reader_ocred.pdf
Çıktılar pilot/veri/ altındadır ve telifli içerik taşıdığı için depoya eklenmez.

Çeviri eşleme türleri:
  yan sütun   ilahilerde Kıpçakça kıtanın yanındaki Türkçe kıta (konuma göre)
  satır içi   sözlük bölümlerinde satırdaki tırnak içi Türkçe karşılık
  paragraf    düzyazıda bölümün n. Kıpçakça paragrafı ile n. Türkçe paragrafı (yalnız sayılar eşitse)
"""
import csv
import html
import os
import json
import re
import statistics
import subprocess
import sys
import unicodedata
from collections import Counter
from pathlib import Path

KOK = Path(__file__).resolve().parent
VERI = KOK / "veri"
GORSEL = VERI / "sayfalar"
TEMEL = set("abcçdefgğhıijklmnoöprsştuüvyzqwxâîû")
KIPCAK_HARF = set("ėŋḫĖŊḪ")
BOLUM_RE = re.compile(r"^\d{2}[ab][\s:/-]")  # ör. 61b/1-11, 73a: 6-19
YAPRAK_RE = re.compile(r"^(\d{2}[ab])\b")
BASLIK_RE = re.compile(r"^\d{1,2}\.\s+[A-ZÇĞİÖŞÜ][\w'’]+.*\s\S+")  # ör. "9. Meleğin çobana ..."; sözlük maddeleri küçük harfle başlar


KIMLIK = KOK.parent / "kimlik"


def inceleme_atiflari():
    """Ünsal 2019 tezinde örnek olarak geçen satırlar: kimlik -> tez sayfaları (yalnız sayfa numarası; alıntı yayımlanmaz)."""
    yol = VERI / "tanik" / "unsal2019.tsv"
    if not yol.exists():
        return {}
    out = {}
    for r in csv.DictReader(yol.open(encoding="utf-8"), delimiter="\t"):
        if float(r["skor"] or 0) < 0.8:
            continue
        for k in filter(None, r["kimlik"].split(",")):
            out.setdefault(k, set()).add(int(r["tez_sayfa"]))
    return {k: sorted(v) for k, v in out.items()}


def olumsuz_listeler():
    """Gevşek aramada gelen ama tanık olmayan biçimler (altin-liste/olumsuz-*-CCII.tsv), madde başı sayfası için."""
    out = {}
    for ad in ("dog", "kel", "ber"):
        yol = KOK.parent / "altin-liste" / f"olumsuz-{ad}-CCII.tsv"
        if yol.exists():
            L = [l.split("\t") for l in yol.read_text(encoding="utf-8").splitlines() if l and not l.startswith("#")]
            out[ad] = [dict(zip(L[0], r)) for r in L[1:]]
    return out


def kimlik_ata(satirlar, ad, onek):
    """Kalıcı kimlik. Her satır ilk görüldüğünde neşirdeki yerinden kimlik alır ve kimlik/<ad>.tsv'de dondurulur.
    Sonraki üretimlerde satır önce aynı gruptaki aynı metin özetiyle, sonra aynı konumla (dy < 3) eşlenir;
    metin değişse de kimlik değişmez, yalnız "dg" (kayıttan sonra değişti) işareti alır. Kimlik yeniden kullanılmaz.
    satirlar: (satir_sozlugu, grup, konum, eski_id) dörtlüleri. Dosya metin taşımaz (telif)."""
    import hashlib
    yol = KIMLIK / f"{ad}.tsv"
    kayit = []
    if yol.exists():
        for l in yol.read_text(encoding="utf-8").splitlines()[1:]:
            k, eski, grup, konum, ozet = l.split("\t")
            kayit.append({"id": k, "eski": eski, "grup": grup, "konum": float(konum), "ozet": ozet})
    kullanilan = set()
    grupta = {}
    for r in kayit:
        grupta.setdefault(r["grup"], []).append(r)
    bekleyen = []
    for s, grup, konum, eski in satirlar:
        ozet = hashlib.sha1(s["t"].encode("utf-8")).hexdigest()[:10]
        adaylar = [r for r in grupta.get(grup, []) if r["id"] not in kullanilan]
        r = min((r for r in adaylar if r["ozet"] == ozet), key=lambda r: abs(r["konum"] - konum), default=None) \
            or min((r for r in adaylar if abs(r["konum"] - konum) < 3), key=lambda r: abs(r["konum"] - konum), default=None)
        if r:
            kullanilan.add(r["id"]); s["id"] = r["id"]
            if r["ozet"] != ozet:
                s["dg"] = 1
            if r["eski"] and r["eski"] != r["id"]:
                s["eid"] = r["eski"]
        else:
            bekleyen.append((s, grup, konum, eski, ozet))
    for s, grup, konum, eski, ozet in bekleyen:  # yeni satırlar: grubun sonraki boş numarası
        sira = 1 + max([int(r["id"].rsplit(".", 1)[1]) for r in grupta.get(grup, [])], default=0)
        r = {"id": f"{onek}.{grup}.{sira:02d}", "eski": eski or "", "grup": grup, "konum": konum, "ozet": ozet}
        grupta.setdefault(grup, []).append(r); kayit.append(r); kullanilan.add(r["id"]); s["id"] = r["id"]
        if eski and eski != r["id"]:
            s["eid"] = eski
    KIMLIK.mkdir(exist_ok=True)
    yol.write_text("kimlik\teski\tgrup\tkonum\tozet\n" + "".join(
        f'{r["id"]}\t{r["eski"]}\t{r["grup"]}\t{r["konum"]:g}\t{r["ozet"]}\n' for r in kayit), encoding="utf-8")
    return len(bekleyen)


def nfc(s):
    return unicodedata.normalize("NFC", s)


def satirlari_oku(pdf, p):
    cikti = subprocess.run(["pdftotext", "-f", str(p), "-l", str(p), "-bbox-layout", str(pdf), "-"],
                           capture_output=True, text=True, check=True).stdout
    genislik = float(re.search(r'<page width="([\d.]+)"', cikti).group(1))
    satirlar = []
    for m in re.finditer(r'<line xMin="([\d.]+)" yMin="([\d.]+)" xMax="([\d.]+)" yMax="([\d.]+)">(.*?)</line>', cikti, re.S):
        sozler = [html.unescape(w) for w in re.findall(r">([^<]*)</word>", m.group(5))]
        t = nfc(" ".join(sozler)).strip()
        if t:
            x0, y0, x1, y1 = map(float, m.groups()[:4])
            satirlar.append({"x": x0, "y": y0, "h": y1 - y0, "x1": x1, "t": t})
    return genislik, satirlar


def kitap_sayfalari(satirlar):
    return sorted({int(s["t"]) for s in satirlar if re.fullmatch(r"\d{3}", s["t"]) and 320 <= int(s["t"]) <= 910})


def metin_turu(baslik, yaprak):
    """CC II bölüm başlığından metin türü: karşılaştırmada sözlük maddeleri tam cümle olmadığı için ayrı tutulur."""
    b = baslik.replace("İ", "i").replace("I", "ı").lower()  # Türkçe küçük harf (İ → i, I → ı)
    if "sözler" in b or "gramer" in b or "bir cümle" in b:
        return "bilmece" if yaprak in ("60a", "60b") else "sozluk"
    if "ilahi" in b or "ave maria" in b:
        return "ilahi"
    if "duası" in b or "iman açıklaması" in b or "on emir" in b or "meryem'e sesleniş" in b:
        return "dua"
    if re.match(r"^\d+\.\s", baslik) and not re.search(r"\b(liber|scrissit|furatur|[iı]ncepcio)\b", b):
        return "vaaz"
    return "diger"


def kipcak_mi(metin):
    return any(c in KIPCAK_HARF for c in metin)


KAYNAKLAR = KOK.parent / "kaynaklar"
DERLEMLER = {
    "cc2": {"ad": "Codex Cumanicus II", "donem": "Kıpçak (14. yy.)", "tur": "çoğu Latinceden çeviri: ilahi, vaaz, dua; sözlük", "kunye": "Argunşah & Güner 2015, Kesit"},
    "ttl-cc": {"ad": "TTL · Kodeks Kumanikus", "donem": "Kıpçak (14. yy.)", "tur": "ders kitabı seçkisi: dua, ilahi, atasözü, bilmece", "kunye": "Tarihî Türk Lehçeleri (ed. H. Develi), Kıpçak bölümü: M. Argunşah"},
    "ttl-ermeni": {"ad": "TTL · Ermeni harfli Kıpçak", "donem": "Kıpçak (16.-17. yy.)", "tur": "ders kitabı seçkisi: Algış Bitigi (mezmur çevirisi), Uslu Ḫikar sözleri, Töre Bitigi (hukuk); büyük ölçüde Ermeniceden çeviri", "kunye": "Tarihî Türk Lehçeleri (ed. H. Develi), Kıpçak bölümü: M. Argunşah"},
    "ttl-memluk": {"ad": "TTL · Memluk Kıpçak", "donem": "Memluk Kıpçak (13.-15. yy.)", "tur": "ders kitabı seçkisi: Gülistan Tercümesi (Farsçadan, manzum ve düzyazı), İrşâdü’l-Mülûk (Arapçadan fıkıh), Kitâb fî ‘İlmi’n-Nüşşâb (okçuluk), Baytaratü’l-Vâzıh (baytarlık); çeviri", "kunye": "Tarihî Türk Lehçeleri (ed. H. Develi), Kıpçak bölümü: M. Argunşah"},
    "boun": {"ad": "UD Turkish BOUN", "donem": "Çağdaş Türkçe", "tur": "özgün düzyazı (Türkçe Ulusal Derlem'den: haber, deneme, kurgu, anı vb.)", "kunye": "Türk vd., UD v2.7+, CC BY-SA 4.0"},
}
KONUM_AD = {"Fin": "çekimli yüklem", "Part": "sıfat-fiil", "Conv": "zarf-fiil", "Vnoun": "ad-fiil", "Conv+tur": "-(I)p tur- yapısı"}


def konum_cc(cozum):
    """Dizindeki ek çözümünden fiilin konumu (kaba, elle denetlenecek)."""
    c = cozum.replace("t.-", "").strip()
    if not c or c.startswith("("):
        return ""
    if c.startswith("up turur"):
        return "Conv+tur"
    if c.startswith("up-sėn"):
        return "Fin"  # -(I)p + kişi eki: çekimli
    if c.startswith("up") or c.startswith("masdan"):
        return "Conv"
    if c.startswith(("gan", "ganı", "maganı")):
        return "Part"
    return "Fin"


def boun_satirlari(bas):
    """UD Turkish BOUN'un tamamı: her cümle bir satır; UD sözcükleri sıkıştırılmış dizi olarak.
    sözcük = [no, biçim, madde başı, tür, özellikler, baş, ilişki]"""
    klasor = KAYNAKLAR / "ud-boun"
    out = []
    for f in sorted(klasor.glob("tr_boun-ud-*.conllu")):
        for blok in f.read_text(encoding="utf-8").strip().split("\n\n"):
            meta, toks = {}, []
            for l in blok.splitlines():
                if l.startswith("#"):
                    k, _, v = l[2:].partition(" = ")
                    meta[k] = v
                elif l.strip():
                    t = l.split("\t")
                    if t[0].isdigit():
                        toks.append([int(t[0]), t[1], t[2], t[3], t[5] if t[5] != "_" else "", int(t[6]) if t[6].isdigit() else 0, t[7]])
            if not toks:
                continue
            sid = meta.get("sent_id", str(len(out)))
            out.append({"i": bas + len(out), "id": f"boun-{sid}", "d": "boun", "k": "metin", "t": meta.get("text", ""),
                        "b": sid, "bs": f.stem.split("-")[-1], "ud": toks})
    return out


def ttl_satirlari(bas):
    """Tarihî Türk Lehçeleri ders kitabının Kıpçak metin çözümlemeleri (pilot/veri/_kaynak/ttl-kipcak/parca-*.md; telifli, özel veri deposunda).
    Her “Çeviri yazı” satırı bir tanık satırıdır; metnin “Çeviri”si bölüm çevirisi, çözümlemeleri ayrı tutulur."""
    import hashlib
    klasor = VERI / "_kaynak" / "ttl-kipcak"
    satir, metinler = [], {}
    bolum = alt = ""
    derlem = "ttl-kipcak"
    kitap_s = "?"
    pdf_s = 0
    kisim = None
    for f in sorted(klasor.glob("parca-*.md")):
        for l in f.read_text(encoding="utf-8").splitlines():
            m = re.match(r"<!-- PDF s\. (\d+) · kitap s\. ([^ ]+) -->", l)
            if m:
                pdf_s, kitap_s = int(m.group(1)), m.group(2)
                if not kitap_s.isdigit():
                    kitap_s = f"{pdf_s + 4}~"  # basılı numara yok; komşu sayfalardan (PDF + 4) tahmin
                continue
            if l.startswith("## "):
                bolum, alt = l[3:].strip(), ""
                b = bolum.lower()
                if "kumanikus" in b or "kodeks" in b:
                    derlem = "ttl-cc"
                elif "ermeni" in b:
                    derlem = "ttl-ermeni"
                elif "memluk" in b or b.startswith("c."):
                    derlem = "ttl-memluk"
                continue
            if l.startswith("### "):
                alt = l[4:].strip()
                continue
            if l.startswith("#### "):
                kisim = l[5:].strip().lower()
                continue
            t = l.strip()
            if t.startswith("<!--"):
                continue
            yaz = re.match(r"^(?:\(tıpkıbasım görüntüsü[^)]*\)\s*)?([A-ZÇĞİÖŞÜ][^\[\]]{2,60}\[\d+[ab]\].*)$", t)
            if yaz and len(t) < 90:
                alt = yaz.group(1).strip()
                continue
            t = re.sub(r"\*\*?([^*]+)\*\*?", r"\1", t)
            if not t or t.startswith("(önceki sayfadan") or t.startswith("(devamı") or t.startswith("(boş") or t.startswith("(tıpkıbasım"):
                continue
            anahtar = f"{bolum} / {alt}" if alt else bolum
            mt = metinler.setdefault(anahtar, {"ceviri": [], "cozum": [], "d": derlem, "bolum": bolum, "alt": alt})
            if kisim == "çeviri yazı":
                ozet = hashlib.sha1(t.encode("utf-8")).hexdigest()[:6]
                satir.append({"i": bas + len(satir), "id": f"ttl-{kitap_s}-{ozet}", "d": derlem, "k": "metin", "t": t,
                              "b": alt or bolum, "bs": bolum, "bc": "ttl:" + anahtar, "ks": kitap_s, "ps": pdf_s})
            elif kisim == "çeviri":
                mt["ceviri"].append(t)
            elif kisim and kisim.startswith("dil bilgisi"):
                mt["cozum"].append(l.rstrip())
    gorulen = Counter()
    sira = Counter()
    atanacak = []
    for s in satir:
        gorulen[s["id"]] += 1
        if gorulen[s["id"]] > 1:
            s["id"] += f"-{gorulen[s['id']]}"
        sira[s["ks"]] += 1
        atanacak.append((s, str(s["ks"]).replace("~", "t"), sira[s["ks"]], s["id"]))
    print(f"TTL kalıcı kimlik: {kimlik_ata(atanacak, 'ttl', 'ttl')} yeni satır")
    ceviri = {"ttl:" + k: "\n".join(v["ceviri"]) for k, v in metinler.items() if v["ceviri"]}
    cozum = {"ttl:" + k: "\n".join(v["cozum"]) for k, v in metinler.items() if v["cozum"]}
    return satir, ceviri, cozum


def paralel_metinler():
    """CC II bölümleri için Latince asıl ve Türkçe çeviri (kaynaklar/ klasöründen)."""
    def bolumler(dosya):
        p = KAYNAKLAR / dosya
        if not p.exists():
            return {}
        s = p.read_text(encoding="utf-8")
        parcalar = re.split(r"^## (.+)$", s, flags=re.M)
        return {b.strip(): t.strip() for b, t in zip(parcalar[1::2], parcalar[2::2])}
    la, tr = bolumler("latince-metinler.md"), bolumler("turkce-metinler.md")
    bul = lambda d, anahtar: next((v for k, v in d.items() if k.startswith(anahtar)), "")
    return {
        "9.": {"ad": "Luka 2:1-20", "la": bul(la, "Luka 2"), "tr": bul(tr, "Luka 2"), "tr_kaynak": "Kitab-ı Mukaddes 1941 (Vikikaynak)"},
        "12.": {"ad": "Matta 2:1-12", "la": bul(la, "Matta 2"), "tr": bul(tr, "Matta 2"), "tr_kaynak": "Kitab-ı Mukaddes 1941 (Vikikaynak)"},
        "33.": {"ad": "Credo (İznik-İstanbul İnanç Bildirgesi)", "la": bul(la, "Credo"), "tr": "", "tr_kaynak": "çağdaş Türkçe çevirisi henüz yok"},
        "27.": {"ad": "Ave Maria", "la": bul(la, "Ave Maria"), "tr": bul(tr, "Ave Maria"), "tr_kaynak": "Vikipedi, CC BY-SA 4.0"},
        "32.": {"ad": "Vexilla regis (Venantius Fortunatus)", "la": bul(la, "Vexilla regis"), "tr": "", "tr_kaynak": "Türkçe çevirisi yok"},
        "35.": {"ad": "A solis ortus cardine (Sedulius)", "la": bul(la, "A solis ortus"), "tr": "", "tr_kaynak": "Türkçe çevirisi yok"},
    }


TURKCE_SOZ = {"ve", "için", "ile", "gibi", "tanrı", "olan", "onlara", "onun", "şöyle", "dedi", "bize", "benim", "size", "bütün", "her", "kendi", "olarak", "çok"}


def turkce_mi(metin):
    if kipcak_mi(metin):
        return False
    sozler = set(re.findall(r"[\wçğıöşü]+", metin.lower().replace("'", " ").replace("’", " ")))
    return "ğ" in metin or len(sozler & TURKCE_SOZ) >= 2


def duzeltmeleri_oku():
    f = KOK / "ocr-duzeltme.tsv"
    if not f.exists():
        return {}
    satir = [l.split("\t") for l in f.read_text(encoding="utf-8").splitlines() if l and not l.startswith("#")]
    out = {}
    for r in satir[1:]:
        d = dict(zip(satir[0], r))
        out.setdefault(int(d["pdf"]), []).append(d)
    return out


DUZELTMELER = duzeltmeleri_oku()


def main():
    pdf = Path(sys.argv[1])
    sayfa_sayisi = int(re.search(r"Pages:\s+(\d+)", subprocess.run(["pdfinfo", str(pdf)], capture_output=True, text=True).stdout).group(1))
    GORSEL.mkdir(parents=True, exist_ok=True)
    sayfalar, tum = [], []
    envanter = Counter()
    for p in range(1, sayfa_sayisi + 1):
        genislik, ham = satirlari_oku(pdf, p)
        sayfa = {"pdf": p, "kitap": kitap_sayfalari(ham)}
        sayfa["dizin"] = sum(1 for s in ham if re.search(r"\[=\d+\]", s["t"])) >= 3
        sayfalar.append(sayfa)
        for d in DUZELTMELER.get(p, []):
            if d["islem"] == "ekle":
                once = next((x for x in ham if x["t"].startswith(d["onceki_satir_baslangici"])), None)
                if once:
                    yeni = dict(once, t=nfc(d["yeni_metin"]), y=once["y"] + 0.5, duzeltme=d["gerekce"])
                    ham.insert(ham.index(once) + 1, yeni)
                else:
                    print("UYARI: düzeltme uygulanamadı", d)
        govde = [s for s in ham if 55 < s["y"] < 645 and not re.fullmatch(r"\d{3}", s["t"])
                 and not re.match(r"^(Codex Cumanicus|Prof\. Dr\. Mustafa)", s["t"])]
        if govde:
            yukseklik = statistics.median(s["h"] for s in govde)
        for s in govde:
            s["pdf"], s["yari"] = p, int(s["x"] >= genislik / 2)
            s["dipnot"] = s["h"] < 0.8 * yukseklik
        for yari in (0, 1):
            ys = [s for s in govde if s["yari"] == yari]
            if not ys:
                continue
            minx = min(s["x"] for s in ys)
            for s in ys:
                s["sutun"] = int(s["x"] > minx + 120)
                s["girinti"] = s["x"] > minx + 12
        govde.sort(key=lambda s: (s["yari"], s["sutun"], s["y"]))
        # Dipnot: sayfa yarısının altında, tek başına numara ya da "Luka 2/8-14:" gibi kaynak göstermeyle başlayan satırdan sonrası.
        for yari in (0, 1):
            dipte = False
            for s in sorted((s for s in govde if s["yari"] == yari), key=lambda s: s["y"]):
                if s["y"] > 380 and (re.match(r"^[^\W\d][\w ]{1,25} \d+/\d+(-\d+)?:", s["t"])
                                     or re.match(r"^\d{1,2}\s+\S.*\b(1[5-9]\d\d|20[0-2]\d)\b", s["t"])):
                    dipte = True
                if dipte:
                    s["dipnot"] = True
        tum.extend(govde)
        for s in govde:
            for ch in s["t"].lower():
                if ch.isalpha() and ch not in TEMEL:
                    envanter[ch] += 1
        hedef = GORSEL / f"s{p:03d}.jpg"
        if not hedef.exists():
            subprocess.run(["pdftoppm", "-f", str(p), "-l", str(p), "-r", "90", "-jpeg", "-singlefile", str(pdf), str(hedef.with_suffix(""))], check=True)

    # Okunamayan kitap sayfa numaralarını komşulardan çıkar.
    for i, s in enumerate(sayfalar):
        if not s["kitap"] and 0 < i < len(sayfalar) - 1:
            once, sonra = sayfalar[i - 1]["kitap"], sayfalar[i + 1]["kitap"]
            if once and sonra and min(sonra) - min(once) == 4:
                s["kitap"], s["tahmini"] = [min(once) + 2, min(once) + 3], True
    # Dizin kitabın sonunda kesintisiz bir bloktur: ilk dizin sayfasından sonrası dizindir.
    ilk_dizin = min((s["pdf"] for s in sayfalar if s["dizin"]), default=10**6)
    for s in sayfalar:
        s["dizin"] = s["pdf"] >= ilk_dizin
    dizin = {s["pdf"] for s in sayfalar if s["dizin"]}

    # Bölüm ve yaprak bilgisi (okuma sırasında en son görülen başlık).
    bolum = yaprak = baslik = ""
    for s in sorted(tum, key=lambda s: (s["pdf"], s["yari"], s["y"])):  # başlıklar ortalı olduğundan sütuna bakmadan
        if s["pdf"] in dizin:
            continue
        if BASLIK_RE.match(s["t"]) and not kipcak_mi(s["t"]) and s["t"].count('"') == 0:
            baslik = s["t"]
        if BOLUM_RE.match(s["t"] + " ") and len(s["t"]) < 25:
            bolum, s["bolum_satiri"] = s["t"], True
            yaprak = YAPRAK_RE.match(s["t"]).group(1)
        elif YAPRAK_RE.fullmatch(s["t"]):
            yaprak = s["t"]
        s["bolum"], s["yaprak"], s["baslik"] = bolum, yaprak, baslik

    # 1) Yan sütun: aynı yarıda, Kıpçakça sütunundaki kıtanın hizasındaki Türkçe satırlar.
    from itertools import groupby
    for (p, yari), grup in groupby(tum, key=lambda s: (s["pdf"], s["yari"])):
        grup = list(grup)
        sol = [s for s in grup if s["sutun"] == 0 and not s["dipnot"]]
        sag = [s for s in grup if s["sutun"] == 1 and not s["dipnot"]]
        if p in dizin or not sag:
            continue
        kitalar, k = [], []
        for s in sorted(sol, key=lambda s: s["y"]):
            if k and s["y"] - k[-1]["y"] > 22:
                kitalar.append(k); k = []
            k.append(s)
        if k:
            kitalar.append(k)
        for k in kitalar:
            y0, y1 = k[0]["y"] - 12, k[-1]["y"] + 12
            ceviri = [s for s in sorted(sag, key=lambda s: s["y"]) if y0 <= s["y"] <= y1]
            if ceviri and any(kipcak_mi(s["t"]) for s in k):
                for c in ceviri:
                    if not kipcak_mi(c["t"]):  # sözlük sayfalarında sağ sütun da Kıpçakça olabilir
                        c["yan_ceviri"] = True  # sağ sütundaki Türkçe çeviri satırı: metin katmanına girmez
                metin = " / ".join(s["t"] for s in ceviri)
                kita = " / ".join(s["t"] for s in k if not re.fullmatch(r"\d{1,3}", s["t"]))
                for s in k:
                    s["c"], s["ct"], s["kita"] = metin, "yan sütun", kita

    # 2) Satır içi: sözlük maddelerindeki tırnak içi karşılık.
    for s in tum:
        if "c" not in s and s["pdf"] not in dizin and '"' in s["t"]:
            tirnak = re.findall(r'"([^"]+)"', s["t"])
            if tirnak and re.match(r"^\d+(-\d+)?\s*[bc]?[.\s]", s["t"]):  # sözlük maddesi: "19. kün tuvmasdan burun "..."
                s["c"], s["ct"] = "; ".join(tirnak), "satır içi"

    # 3) Paragraf: düzyazı bölümlerinde n. Kıpçakça paragraf ↔ n. Türkçe paragraf.
    # Paragraf eşlemesi yalnız düzyazı (vaaz, dua) için; sözlük bölümlerinde her maddenin kendi karşılığı vardır ve sıra eşlemesi kayar (denetim: 24 Kasım 2026).
    akis = [s for s in tum if s["pdf"] not in dizin and "c" not in s and not s["dipnot"] and s["sutun"] == 0 and not s.get("bolum_satiri")
            and metin_turu(s.get("baslik", ""), s.get("yaprak", "")) not in ("sozluk", "bilmece")]
    bolum_ceviri = {}
    for bolum_adi, grup in groupby(akis, key=lambda s: (s["bolum"], s["baslik"])):
        grup = list(grup)
        paragraflar, par = [], []
        for s in grup:
            if BASLIK_RE.match(s["t"]) and not kipcak_mi(s["t"]):
                continue
            if par and s["girinti"]:
                paragraflar.append(par); par = []
            par.append(s)
        if par:
            paragraflar.append(par)
        # Neşirde bölüm önce Kıpçakça, sonra Türkçe çeviri olarak basılır: ilk açıkça Türkçe paragraf sınırdır.
        # Sınır: son Kıpçakça paragraftan sonraki Türkçe paragraflar çeviridir (önceki dipnot/açıklama paragrafları sayılmaz).
        metinler = [" ".join(s["t"] for s in p) for p in paragraflar]
        son_k = max((i for i, m in enumerate(metinler) if kipcak_mi(m)), default=-1)
        ilk_k = min((i for i, m in enumerate(metinler) if kipcak_mi(m)), default=0)
        kp = [p for i, p in enumerate(paragraflar) if ilk_k <= i <= son_k and not turkce_mi(metinler[i])]
        tp = [p for i, p in enumerate(paragraflar) if i > son_k and turkce_mi(metinler[i])]
        if kp and tp:
            anahtar = bolum_adi[0] or bolum_adi[1]
            bolum_ceviri[anahtar] = "\n".join(" ".join(s["t"] for s in p) for p in tp)
            for p in kp:
                for s in p:
                    s["bc"] = anahtar
        if kp and len(kp) == len(tp):
            for a, b in zip(kp, tp):
                metin = " ".join(s["t"] for s in b)
                for s in a:
                    s["c"], s["ct"] = metin, "paragraf"

    # Eski (sayfa + özet) kimlik yalnız yönlendirme için hesaplanır; kalıcı kimlik kimlik_ata ile verilir.
    import hashlib
    gorulen = Counter()
    satirlar, atanacak = [], []
    for i, s in enumerate(sorted(tum, key=lambda s: (s["pdf"], s["yari"], s["sutun"], s["y"]))):
        ks = sayfalar[s["pdf"] - 1]["kitap"]
        sayfa_etiket = str(ks[s["yari"]] if len(ks) > s["yari"] else f"p{s['pdf']}{'ab'[s['yari']]}")
        ozet = hashlib.sha1(s["t"].encode("utf-8")).hexdigest()[:6]
        anahtar = f"{sayfa_etiket}-{ozet}"
        gorulen[anahtar] += 1
        if gorulen[anahtar] > 1:
            anahtar += f"-{gorulen[anahtar]}"
        k = {"i": i, "id": None, "pdf": s["pdf"], "t": s["t"], "k": "dizin" if s["pdf"] in dizin else "metin",
             "b": s.get("bolum", ""), "yp": s.get("yaprak", ""), "bs": s.get("baslik", ""),
             "tur": metin_turu(s.get("baslik", ""), s.get("yaprak", ""))}
        if s["dipnot"]:
            k["k"] = "dipnot"
        elif re.search(r"\b(yazılmıştır|biçiminde|okunmalıdır|olmalıdır|okunmuştur)\b", s["t"]):
            k["k"] = "not"  # editörün metin içi açıklaması
        elif s.get("yan_ceviri"):
            k["k"] = "ceviri"
        elif (s["pdf"] not in dizin and turkce_mi(s["t"]) and not kipcak_mi(s["t"])
              and not (re.match(r"^\s*\d", s["t"]) and re.search(r"[\"“”„'’]", s["t"]))):
            k["k"] = "ceviri"  # metin katmanına sızmış Türkçe çeviri/açıklama satırı (sözlük maddeleri hariç)
        if "c" in s:
            k["c"], k["ct"] = s["c"], s["ct"]
        if "bc" in s:
            k["bc"] = s["bc"]
        if "kita" in s:
            k["kt"] = s["kita"]
        if "duzeltme" in s:
            k["dz"] = s["duzeltme"]
        satirlar.append(k)
        atanacak.append((k, f"{sayfa_etiket}{'ab'[s['sutun']]}", s["y"], anahtar))
    yeni = kimlik_ata(atanacak, "cc2", "cc2")
    # Ölçütlerin yakalayamadığı kısa Türkçe satırlar (elle; kalıcı kimlikle).
    ELLE_CEVIRI = {"cc2.339a.10"}  # "O kelebek." (bilmece cevabının çevirisi)
    for k in satirlar:
        if k["id"] in ELLE_CEVIRI:
            k["k"] = "ceviri"
    print(f"Kalıcı kimlik: {yeni} yeni satır, {sum(1 for k in satirlar if k.get('dg'))} satırın metni kayıttan sonra değişmiş")

    for s in satirlar:
        s.setdefault("d", "cc2")

    tsv = (KOK.parent / "altin-liste" / "dog-CCII.tsv").read_text(encoding="utf-8").splitlines()
    tablo = [l.split("\t") for l in tsv if l and not l.startswith("#")]
    altin = [dict(zip(tablo[0], r)) for r in tablo[1:]]
    for a in altin:  # altın listedeki tanığı metin satırına bağla (kökün ilk geçtiği satır, beklenen kitap sayfasında)
        a["konum"] = konum_cc(a["dizin_cozumu"])
    kel = (KOK.parent / "altin-liste" / "kel-CCII.tsv").read_text(encoding="utf-8").splitlines()
    kt = [l.split("\t") for l in kel if l and not l.startswith("#")]
    altin_kel = [dict(zip(kt[0], r)) for r in kt[1:]]
    bt = [l.split("\t") for l in (KOK.parent / "altin-liste" / "ber-CCII.tsv").read_text(encoding="utf-8").splitlines() if l and not l.startswith("#")]
    altin_ber = [dict(zip(bt[0], r)) for r in bt[1:]]
    boun = boun_satirlari(len(satirlar))
    ttl, ttl_ceviri, ttl_cozum = ttl_satirlari(len(satirlar) + 10**6)
    ttl_pdf = os.environ.get("TTL_PDF")
    if ttl_pdf:
        (VERI / "ttl").mkdir(exist_ok=True)
        for ps in sorted({t["ps"] for t in ttl}):
            hedef = VERI / "ttl" / f"s{ps:03d}.jpg"
            if not hedef.exists():
                subprocess.run(["pdftoppm", "-f", str(ps), "-l", str(ps), "-r", "80", "-jpeg", "-singlefile", ttl_pdf, str(hedef.with_suffix(""))], check=True)
    satirlar.extend(ttl)
    bolum_ceviri.update(ttl_ceviri)
    veri = {"kaynak": "Argunşah & Güner 2015, Codex Cumanicus, Kesit; izinli CC II bölümü (ABBYY OCR) · UD Turkish BOUN (CC BY-SA 4.0)",
            "sayfalar": sayfalar, "satirlar": satirlar, "bolum_ceviri": bolum_ceviri, "envanter": envanter.most_common(), "altin": altin,
            "paralel": paralel_metinler(), "derlemler": DERLEMLER, "cozumleme": ttl_cozum, "altin_kel": altin_kel, "altin_ber": altin_ber, "olumsuz": olumsuz_listeler(), "inceleme": inceleme_atiflari(), "kayitli_conllu": "\n".join(f.read_text(encoding="utf-8") for f in sorted((KOK.parent / "etiketler").glob("*.conllu")))}
    (VERI / "veri.js").write_text("window.VERI = " + json.dumps(veri, ensure_ascii=False) + ";\n", encoding="utf-8")
    (VERI / "boun.js").write_text("window.VERI.satirlar.push(..." + json.dumps(boun, ensure_ascii=False, separators=(",", ":")) + ");\n", encoding="utf-8")
    print(f"BOUN: {len(boun)} cümle")
    metin = [s for s in satirlar if s["k"] == "metin"]
    kip = [s for s in metin if kipcak_mi(s["t"])]
    sayac = Counter(s.get("ct", "yok") for s in kip)
    print(f"{sayfa_sayisi} sayfa ({len(dizin)} dizin), {len(satirlar)} satır; Kıpçakça metin satırı {len(kip)}; çeviri: {dict(sayac)}")


if __name__ == "__main__":
    main()
