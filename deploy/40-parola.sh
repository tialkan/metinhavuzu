#!/bin/sh
# PAROLA_KULLANICI ve PAROLA ortam değişkenleri verilirse site HTTP Basic Auth ile korunur.
set -eu
if [ -n "${PAROLA_KULLANICI:-}" ] && [ -n "${PAROLA:-}" ]; then
  printf '%s:%s\n' "$PAROLA_KULLANICI" "$(openssl passwd -apr1 "$PAROLA")" > /tmp/.htpasswd
  printf 'auth_basic "Metin Havuzu";\nauth_basic_user_file /tmp/.htpasswd;\n' > /tmp/parola.conf
  : > /tmp/kayit.conf
  echo "parola korumasi acik; etiket kaydi acik"
else
  : > /tmp/parola.conf
  printf 'return 403;\n' > /tmp/kayit.conf
  echo "UYARI: parola korumasi kapali; etiket kaydi kapali"
fi

# KAYNAK_ANAHTARI verilirse yalnız Cloudflare'in eklediği X-Metinhavuzu-Anahtar başlığını taşıyan istekler kabul edilir
# (Cloudflare'i atlayıp doğrudan sunucu IP'sine gelen istekler 403). Değer yalnız harf ve rakamdan, en az 24 karakter.
if [ -n "${KAYNAK_ANAHTARI:-}" ]; then
  case "$KAYNAK_ANAHTARI" in
    *[!A-Za-z0-9]*) echo "HATA: KAYNAK_ANAHTARI yalniz harf ve rakam olmali; denetim kapali"; : > /tmp/kaynak.conf ;;
    *) if [ ${#KAYNAK_ANAHTARI} -ge 24 ]; then
         printf 'if ($http_x_metinhavuzu_anahtar != "%s") { return 403; }\n' "$KAYNAK_ANAHTARI" > /tmp/kaynak.conf
         echo "kaynak denetimi acik"
       else echo "HATA: KAYNAK_ANAHTARI en az 24 karakter olmali; denetim kapali"; : > /tmp/kaynak.conf; fi ;;
  esac
else
  : > /tmp/kaynak.conf
  echo "UYARI: kaynak denetimi kapali (KAYNAK_ANAHTARI yok)"
fi
