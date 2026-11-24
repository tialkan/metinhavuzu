"""Metin Havuzu tipografik logo: harfler yalnız düz çizgilerden kurulur (Orhon yazıtlarının oyma çizgisinden esinlenme)."""
INK, ACC = "#1b2a44", "#2a9d96"
H, W, S, G = 100, 64, 11, 26   # yükseklik, harf genişliği, çizgi kalınlığı, harf arası

def harf(c, x):
    w = W
    P = lambda *pts: [(x + a, b) for a, b in pts]
    d = {
        "M": [P((0,100),(0,0),(w/2,58),(w,0),(w,100))],
        "E": [P((w,0),(0,0),(0,100),(w,100)), P((0,50),(w*.78,50))],
        "T": [P((0,0),(w,0)), P((w/2,0),(w/2,100))],
        "N": [P((0,100),(0,0),(w,100),(w,0))],
        "H": [P((0,0),(0,100)), P((w,0),(w,100)), P((0,50),(w,50))],
        "A": [P((0,100),(w/2,0),(w,100)), P((w*.24,64),(w*.76,64))],
        "V": [P((0,0),(w/2,100),(w,0))],
        "U": [P((0,0),(0,66),(w/2,100),(w,66),(w,0))],
        "Z": [P((0,0),(w,0),(0,100),(w,100))],
    }
    if c == "İ":
        return [P((0,0),(0,100))], 0, (x, -24)
    return d[c], w, None

def yol(pts):
    # Dış kenarlar 0 ve 100 çizgisine otursun: uç noktalar yarım çizgi içeri alınır, kare uçlar geri tamamlar.
    yy = lambda b: S / 2 if b == 0 else (H - S / 2 if b == 100 else b)
    return "M" + " L".join(f"{a:.1f} {yy(b):.1f}" for a, b in pts)

def kelime(metin, x0=0, y0=0):
    x, yollar, nokta = x0, [], []
    for c in metin:
        if c == " ":
            x += G * 1.6; continue
        ps, w, n = harf(c, x)
        yollar += ps
        if n: nokta.append(n)
        x += w + G
    return yollar, nokta, x - G

def svg(metin, alt=None, pad=24, ark=None):
    yollar, nokta, genis = kelime(metin)
    yuk = H + 34 + (46 if alt else 0)
    vb_w, vb_h = genis + 2 * pad + S, yuk + 2 * pad + S
    g = f'<g transform="translate({pad + S/2} {pad + S/2 + 34})">'
    g += f'<path d="{" ".join(yol(p) for p in yollar)}" fill="none" stroke="{INK}" stroke-width="{S}" stroke-linejoin="miter" stroke-miterlimit="1.5" stroke-linecap="square"/>'
    for nx, ny in nokta:  # İ'nin noktası: ė'nin noktasını da çağrıştıran eşkenar dörtgen, vurgu renginde
        r = 9
        g += f'<path d="M{nx} {ny-r} L{nx+r} {ny} L{nx} {ny+r} L{nx-r} {ny} Z" fill="{ACC}"/>'
    if alt:
        g += f'<text x="0" y="{H + 40}" font-family="Helvetica Neue, Arial, sans-serif" font-size="19" letter-spacing="5.2" fill="{ACC}">{alt}</text>'
    g += "</g>"
    arka = f'<rect width="100%" height="100%" fill="{ark}"/>' if ark else ""
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {vb_w:.0f} {vb_h:.0f}" width="{vb_w:.0f}" height="{vb_h:.0f}" role="img" aria-label="Metin Havuzu">{arka}{g}</svg>'

open("logo-yatay.svg", "w").write(svg("METİN HAVUZU"))
open("logo-yatay-altyazili.svg", "w").write(svg("METİN HAVUZU", alt="TARİHÎ VE ÇAĞDAŞ TÜRKÇE METİNLER"))
# İşaret: M ile H ortak bir dikey çizgiyi paylaşır
ps = [[(0,100),(0,0),(32,58),(64,0),(64,100)], [(64,50),(118,50)], [(118,0),(118,100)]]
pad = 22
iw, ih = 118+2*pad+S+6, 134+2*pad+S
isaret = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {iw:.0f} {ih:.0f}" width="{iw:.0f}" height="{ih:.0f}" role="img" aria-label="Metin Havuzu"><g transform="translate({pad+S/2+3} {pad+S/2+34})"><path d="{" ".join(yol(p) for p in ps)}" fill="none" stroke="{INK}" stroke-width="{S}" stroke-linejoin="miter" stroke-miterlimit="1.5" stroke-linecap="square"/><path d="M91 -33 L100 -24 L91 -15 L82 -24 Z" fill="{ACC}"/></g></svg>'
open("logo-isaret.svg", "w").write(isaret)
print("ok")
