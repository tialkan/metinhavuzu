"""Kalıcı kimlik testleri. Çalıştırma: python3 kimlik/test_kimlik.py"""
import json, sys, tempfile
from pathlib import Path
KOK = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(KOK / "pilot"))
import hazirla

def satir(t): return {"t": t}

def calistir(girdi):
    return hazirla.kimlik_ata([(s, g, y, "") for s, g, y in girdi], "deneme", "x")

with tempfile.TemporaryDirectory() as d:
    hazirla.KIMLIK = Path(d)
    a = [satir("Ave Maria"), satir("nakarat"), satir("nakarat"), satir("son")]
    calistir([(a[0], "1a", 10), (a[1], "1a", 20), (a[2], "1a", 30), (a[3], "1a", 40)])
    ilk = [s["id"] for s in a]
    assert len(set(ilk)) == 4, "aynı metinli nakarat satırları ayrı kimlik almalı"
    # tek harf düzeltmesi + araya yeni satır (OCR düzeltme katmanı)
    b = [satir("Ave Marıa"), satir("nakarat"), satir("araya eklenen"), satir("nakarat"), satir("son")]
    calistir([(b[0], "1a", 10), (b[1], "1a", 20), (b[2], "1a", 25.5), (b[3], "1a", 30), (b[4], "1a", 40)])
    assert [b[0]["id"], b[1]["id"], b[3]["id"], b[4]["id"]] == ilk, "düzeltme ve ekleme eski kimlikleri kaydırmamalı"
    assert b[0].get("dg") == 1 and not b[1].get("dg"), "değişen satır işaretlenmeli"
    assert b[2]["id"] not in ilk, "yeni satır yeni kimlik almalı"

V = json.loads((KOK / "pilot/veri/veri.js").read_text(encoding="utf-8")[len("window.VERI = "):-2])
ids = [s["id"] for s in V["satirlar"]]
assert len(ids) == len(set(ids)), "kimlik çakışması"
eski = [s["eid"] for s in V["satirlar"] if s.get("eid")]
assert len(eski) == len(set(eski)) and not set(eski) & set(ids), "eski kimlik yönlendirmesi belirsiz"
kayitli = {l.split(" = ")[1] for l in V["kayitli_conllu"].splitlines() if l.startswith("# sent_id")}
assert kayitli <= set(ids), f"kayıtlı etiketin kaynağı yok: {kayitli - set(ids)}"
print(f"tamam: {len(ids)} kimlik, çakışma 0, {len(eski)} eski kimlik yönleniyor, {len(kayitli)} kayıtlı etiket bağlı")
