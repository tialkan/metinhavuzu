# Coolify'da yayına alma

## Bir kez
1. Kodu özel (private) bir Git deposuna koyun. `pilot/veri/` telifli içerik taşıdığı için `.gitignore`'dadır; Coolify'ın bulabilmesi için iki yol vardır:
   - **A (önerilen):** Veriyi depoya koymayın. Coolify sunucusunda kalıcı bir klasör (ör. `/data/metinhavuzu/veri`) oluşturun, `pilot/veri/` içeriğini oraya kopyalayın (`scp -r pilot/veri/* sunucu:/data/metinhavuzu/veri/`) ve Coolify'da **Persistent Storage** olarak `/usr/share/nginx/html/veri` yoluna bağlayın.
   - **B:** Depo özelse ve izin buna uygunsa `pilot/veri/` depoya eklenir (`.gitignore`'dan çıkarılır).
2. Coolify → Projects → **New Resource** → Private Repository (GitHub App ya da Deploy Key) → depo ve dal seçilir.
3. **Build Pack: Dockerfile**. Port: `80`.
4. **Environment Variables:** `PAROLA_KULLANICI` ve `PAROLA` (telif izni kamusal gösterimi kapsayana kadar zorunlu). Bunlar Coolify'da “secret” olarak işaretlenir; depoya yazılmaz.
5. **Domains:** `https://metinhavuzu.com` (ve istenirse `https://www.metinhavuzu.com`).

## Cloudflare DNS
- `A` kaydı: `metinhavuzu.com` → Coolify sunucusunun IP'si. `www` için `CNAME` → `metinhavuzu.com`.
- İlk sertifika alınırken kayıtları **DNS only** (gri bulut) tutun; Coolify (Traefik) Let's Encrypt sertifikasını alsın.
- Sonra proxy (turuncu bulut) açılacaksa SSL/TLS modu **Full (strict)** olmalıdır; “Flexible” yönlendirme döngüsü yapar.

## Yayından sonra kabul kontrolü
- `https://metinhavuzu.com/saglik` → `ok`
- Ana sayfa parola soruyor (parola tanımlıysa).
- `https://metinhavuzu.com/robots.txt` → `Disallow: /`
- `https://metinhavuzu.com/#/tanik/380-ef3a5e` → *Tėŋri sėnden kaçan tuvmış* ve çevirisi açılır.
- Altın liste sayfası 36/36.

## Etiket kayıtları (kalıcı birim)
- Persistent Storage → Volume mount: ad `metinhavuzu-kayit` (Coolify öneki ekler), hedef `/srv/kayit`. 24 Kasım 2026'da eklendi.
- Site `/kayit/<ad>.conllu` dosyalarını okur ve PUT ile yazar; `/kayit/` JSON listesidir. Yalnız parola korumasının arkasında açıktır; `PAROLA` boşsa kayıt uçları 403 döner.
- Her kayıtta ayrıca `<ad>-yedek-<gün>.conllu` yazılır (günlük yedek). Silme (DELETE) kapalıdır.
- Birim silinirse etiketler gider: Coolify'da bu birim için yedek açılması önerilir.

## Doğrudan IP erişimini kapatma (kaynak anahtarı)
Sıra önemli; ters sırada site Cloudflare üzerinden de 403 döner.
1. Bilgisayarınızda bir değer üretin (yalnız harf ve rakam): `openssl rand -hex 24`. Değeri sohbete ya da depoya yazmayın.
2. Cloudflare → metinhavuzu.com → Rules → Transform Rules → Modify Request Header → Create rule: ad "Kaynak anahtarı", koşul "All incoming requests", Set static: başlık `X-Metinhavuzu-Anahtar`, değer: ürettiğiniz değer. Deploy.
3. Coolify → uygulama → Environment Variables: `KAYNAK_ANAHTARI` = aynı değer. Kaydet, Redeploy.
4. Sınama: `https://metinhavuzu.com/saglik` → ok; `curl --resolve metinhavuzu.com:443:<SUNUCU_IP> https://metinhavuzu.com/` → 403.
Değer boşsa ya da geçersizse denetim kapalı kalır (site kilitlenmez); kapsayıcı günlüğünde "kaynak denetimi acik/kapali" yazar.
