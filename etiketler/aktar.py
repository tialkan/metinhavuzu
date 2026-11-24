#!/usr/bin/env python3
"""Sitede (/kayit/) kaydedilen etiketleri depoya aktarır.

Kullanım:
  python3 etiketler/aktar.py <giris-dosyasi>                    # indir: etiketler/kayit/<ad>.conllu
  python3 etiketler/aktar.py <giris-dosyasi> --denetim <ad>     # ayrıca <ad>'ın düzelttiği cümleleri ön etiket dosyasına işle

<giris-dosyasi>: kendi bilgisayarınızda, depo dışında duran, tek satırlık "kullanici:parola" dosyası
(ör. ~/.metinhavuzu-giris, izinleri 600). Parola bu betiğe, sohbete ya da depoya yazılmaz.

--denetim: o etiketleyicinin sunucudaki sürümü, ön etiketi olan cümlelerde ön etiketin yerine geçer
(denetlenmiş sürüm). Ön etiketi olmayan cümleler yalnız etiketler/kayit/ altında kalır; ikinci
etiketleyicinin kör etiketleri ön etiket dosyasına asla karışmaz (uyuşma ölçümü bozulmasın).
"""
import base64, json, re, stat, sys, urllib.error, urllib.request
from pathlib import Path

SITE = "https://metinhavuzu.com"
KOK = Path(__file__).resolve().parent
ON_ETIKET = KOK / "on-etiket-claude-2026-11-24.conllu"
HEDEF = KOK / "kayit"


def giris(yol):
    p = Path(yol).expanduser()
    if p.resolve().is_relative_to(KOK.parent):
        sys.exit("Giriş dosyası depo içinde olmamalı.")
    if p.stat().st_mode & (stat.S_IRGRP | stat.S_IROTH):
        print("UYARI: giriş dosyası başkalarınca okunabilir; chmod 600 önerilir.")
    k = p.read_text(encoding="utf-8").strip()
    if ":" not in k:
        sys.exit("Giriş dosyası 'kullanici:parola' biçiminde tek satır olmalı.")
    return "Basic " + base64.b64encode(k.encode()).decode()


def al(yol, yetki):
    istek = urllib.request.Request(SITE + yol, headers={"Authorization": yetki, "User-Agent": "metinhavuzu-aktar"})
    try:
        with urllib.request.urlopen(istek, timeout=30) as y:
            return y.read().decode("utf-8")
    except urllib.error.HTTPError as e:
        if e.code == 401:
            sys.exit("Giriş reddedildi (401): giriş dosyasındaki kullanıcı adı ya da parola yanlış.")
        raise


def bloklar(metin):
    out = {}
    for b in metin.strip().split("\n\n"):
        m = re.search(r"^# sent_id = (\S+)", b, re.M)
        if m:
            out[m.group(1)] = b.strip()
    return out


def main():
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    yetki = giris(sys.argv[1])
    denetci = sys.argv[sys.argv.index("--denetim") + 1] if "--denetim" in sys.argv else None
    HEDEF.mkdir(exist_ok=True)
    dosyalar = [f["name"] for f in json.loads(al("/kayit/", yetki))
                if f.get("type") == "file" and re.fullmatch(r"[a-z0-9-]+\.conllu", f["name"]) and "-yedek-" not in f["name"]]
    if not dosyalar:
        print("Sunucuda kayıtlı etiket yok.")
    indirilen = {}
    for ad in dosyalar:
        metin = al("/kayit/" + ad, yetki)
        (HEDEF / ad).write_text(metin.rstrip("\n") + "\n", encoding="utf-8")
        indirilen[ad[:-7]] = bloklar(metin)
        print(f"indirildi: etiketler/kayit/{ad} · {len(indirilen[ad[:-7]])} cümle")
    if not denetci:
        return
    if denetci not in indirilen:
        sys.exit(f"'{denetci}' adlı kayıt yok. Var olanlar: {', '.join(indirilen) or '-'}")
    on = bloklar(ON_ETIKET.read_text(encoding="utf-8"))
    degisen = 0
    for sid, blok in indirilen[denetci].items():
        if sid not in on or blok == on[sid]:
            continue
        on[sid] = re.sub(r"^(# kilavuz = .*)$", r"\1\n# denetim = " + denetci + " (sitede düzeltildi; aktar.py)", blok, count=1, flags=re.M)
        degisen += 1
    ON_ETIKET.write_text("\n\n".join(on.values()) + "\n", encoding="utf-8")
    print(f"ön etiket dosyasına işlenen denetlenmiş cümle: {degisen}")


if __name__ == "__main__":
    main()
