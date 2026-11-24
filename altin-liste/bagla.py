"""Altın liste tanıklarını kalıcı satır kimliğine bağlar (satır düzeyi).
Her satır için hedef sözcük biçimi (tanıkta kökle başlayan sözcük) metin katmanında, aynı yaprakta ve
tanığın öteki sözcükleriyle en çok örtüşen satırda aranır. Bağlama bir kez yapılır: `satir` sütunu doluysa dokunulmaz.
Kullanım: python3 altin-liste/bagla.py"""
import json, re, unicodedata
from pathlib import Path
KOK = Path(__file__).resolve().parent.parent
V = json.loads((KOK / "pilot/veri/veri.js").read_text(encoding="utf-8")[len("window.VERI = "):-2])
METIN = [s for s in V["satirlar"] if s.get("d") == "cc2" and s["k"] == "metin"]
KOKLER = {"dog": ("tog", "tuv", "töre", "töret", "togır", "togur"), "kel": ("kėl", "kel"), "ber": ("bėr", "ber")}

def norm(t):
    t = unicodedata.normalize("NFC", t).lower().replace("[", "").replace("]", "")
    return t.replace("ḫ", "k").replace("x", "k")

def sozcukler(t): return re.findall(r"[\w-]+", norm(t))

def yaprak_no(y): return int(y[:-1]) * 2 + (y[-1] == "b")

def yaprak_araligi(s):
    """Satırın bölüm başlığındaki yaprak aralığı (ör. "69a/l - 72b/10" → 69a..72b); tek yapraklı başlıkta bir sonraki yaprağa dek."""
    ys = [yaprak_no(y) for y in re.findall(r"(\d{2}[ab])", s.get("b", "") + " " + s.get("yp", ""))]
    if not ys:
        return None
    return min(ys), max(ys) + (1 if len(set(ys)) == 1 else 0)

def bagla(satir, kokler):
    soz = sozcukler(satir["tanik"])
    hedef = [w for w in soz if w.startswith(kokler)]
    if not hedef:
        return None, None, "hedef biçim yok"
    # Dizin çözümü (ör. "t.-gan") madde başının gövdesine eklenince beklenen biçim çıkar; tanıktaki o biçim seçilir.
    govde = norm(satir["madde_basi"]).rstrip("-")
    ek = norm(satir.get("dizin_cozumu", "")).split("-", 1)[-1].strip(". ")
    tam = [w for w in hedef if w == govde + ek]
    yakin = [w for w in hedef if ek and w.startswith(govde) and w.endswith(ek[-2:])]
    bicim = (tam or yakin or hedef)[0]
    yaprak = yaprak_no(re.match(r"(\d+[ab])", satir["yer"]).group(1))
    adaylar = []
    for s in METIN:
        ws = sozcukler(s["t"])
        if bicim not in ws:
            continue
        ar = yaprak_araligi(s)
        puan = bool(ar and ar[0] <= yaprak <= ar[1]) * 10 + len(set(soz) & set(ws))
        adaylar.append((puan, s["id"]))
    if not adaylar:
        return None, bicim, "metinde yok"
    adaylar.sort(reverse=True)
    if len(adaylar) > 1 and adaylar[0][0] == adaylar[1][0]:
        return adaylar[0][1], bicim, "belirsiz: " + " ".join(i for p, i in adaylar if p == adaylar[0][0])
    if adaylar[0][0] < 10:
        return adaylar[0][1], bicim, "yaprak tutmuyor"
    return adaylar[0][1], bicim, ""

if __name__ == "__main__":
    for ad in ("dog", "kel", "ber"):
        yol = KOK / f"altin-liste/{ad}-CCII.tsv"
        satirlar = yol.read_text(encoding="utf-8").splitlines()
        bas = [l for l in satirlar if l.startswith("#")]
        govde = [l.split("\t") for l in satirlar if l and not l.startswith("#")]
        sutun = govde[0]
        for yeni in ("satir", "bicim", "bag_notu"):
            if yeni not in sutun:
                sutun.append(yeni)
        kayit = [dict(zip(sutun, r + [""] * (len(sutun) - len(r)))) for r in govde[1:]]
        sorun = 0
        for k in kayit:
            if not k["bag_notu"].startswith("elle:"):
                k["satir"], k["bicim"], k["bag_notu"] = [x or "" for x in bagla(k, KOKLER[ad])]
            if k["bag_notu"]:
                sorun += 1
                print(ad, k["yer"], k["tanik"][:40], "→", k["satir"], k["bicim"], "|", k["bag_notu"])
        yol.write_text("\n".join(bas + ["\t".join(sutun)] + ["\t".join(k[c] for c in sutun) for k in kayit]) + "\n", encoding="utf-8")
        print(f"{ad}: {len(kayit)} tanık, {sorun} elle bakılacak")
