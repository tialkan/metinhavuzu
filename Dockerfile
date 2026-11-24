# Metin Havuzu: statik pilot, root olmayan nginx ile (Coolify "Dockerfile" yapı paketi).
FROM nginxinc/nginx-unprivileged:1.27-alpine
USER root
RUN apk add --no-cache openssl \
 && rm -f /etc/nginx/conf.d/default.conf
COPY deploy/nginx.conf /etc/nginx/conf.d/metinhavuzu.conf
COPY deploy/basliklar.inc /etc/nginx/conf.d/basliklar.inc
COPY --chmod=755 deploy/40-parola.sh /docker-entrypoint.d/40-parola.sh
COPY pilot/ /usr/share/nginx/html/
RUN rm -f /usr/share/nginx/html/hazirla.py /usr/share/nginx/html/*.md \
 && rm -rf /usr/share/nginx/html/veri/_kaynak /usr/share/nginx/html/veri/.git /usr/share/nginx/html/veri/README.md \
 && mkdir -p /srv/kayit && chown 101:101 /srv/kayit
# Etiket kayıtları kalıcı birimde durur (Coolify: Persistent Storage → /srv/kayit).
USER 101
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://127.0.0.1:8080/saglik || exit 1
