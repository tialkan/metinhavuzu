"""Satır düzeyi altın test. Çalıştırma: python3 altin-liste/test_altin.py  (önce pilot/hazirla.py)
1) Her altın tanık kalıcı bir satır kimliğine bağlı; o satır var, metin katmanında ve beklenen biçimi bütün sözcük olarak içeriyor.
2) doğ- için gevşek aramanın bütün isabetleri ya altın tanık ya da olumsuz listede gerekçeli; açıklanmayan isabet kalmamalı.
3) Duyarlılık (altın / altın listesi), kesinlik (altın isabet / bütün isabet) raporlanır; olumsuz liste altınla çakışmamalı."""
import sys
from collections import Counter
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
from bagla import METIN, V, sozcukler, KOKLER, KOK

KIM = {s["id"]: s for s in V["satirlar"]}
def tablo(ad):
    L = [l.split("\t") for l in (KOK / "altin-liste" / ad).read_text(encoding="utf-8").splitlines() if l and not l.startswith("#")]
    return [dict(zip(L[0], r + [""] * (len(L[0]) - len(r)))) for r in L[1:]]

hata = []
for ad in ("dog", "kel", "ber"):
    rows = tablo(f"{ad}-CCII.tsv")
    gecen = 0
    for r in rows:
        s = KIM.get(r["satir"])
        if not s: hata.append(f"{ad} {r['yer']}: satır kimliği yok ({r['satir'] or 'boş'})"); continue
        if s["k"] != "metin": hata.append(f"{ad} {r['yer']}: {s['id']} metin katmanında değil"); continue
        if r["bicim"] not in sozcukler(s["t"]): hata.append(f"{ad} {r['yer']}: {s['id']} satırında '{r['bicim']}' yok"); continue
        gecen += 1
    altin = Counter((r["satir"], r["bicim"]) for r in rows)
    isabet = Counter((s["id"], w) for s in METIN for w in sozcukler(s["t"]) if w.startswith(KOKLER[ad]))
    dogru = sum(min(n, isabet[k]) for k, n in altin.items())
    print(f"{ad}: satır düzeyi {gecen}/{len(rows)}; gevşek arama isabeti {sum(isabet.values())}, altın {dogru}, kesinlik {dogru / sum(isabet.values()):.0%}")
    olumsuz_yol = KOK / "altin-liste" / f"olumsuz-{ad}-CCII.tsv"
    if olumsuz_yol.exists():
        olumsuz = {(r["satir"], r["bicim"]): r["tur"] for r in tablo(olumsuz_yol.name)}
        for k in olumsuz:
            if k in altin: hata.append(f"{ad}: {k} hem altın hem olumsuz")
            if k not in isabet: hata.append(f"{ad}: olumsuz {k} artık aramada çıkmıyor (kimlik ya da metin değişti)")
        acik = [k for k in isabet if k not in altin and k not in olumsuz]
        for k in acik: hata.append(f"{ad}: açıklanmayan isabet {k} | {KIM[k[0]]['t'][:60]}")
        print(f"   olumsuz: {dict(Counter(olumsuz.values()))}; açıklanmayan {len(acik)}")
for h in hata: print("HATA", h)
sys.exit(1 if hata else 0)
