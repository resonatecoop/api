FROM nginx:alpine as base

FROM base as dev-image

COPY local.dev.conf /etc/nginx/conf.d/default.conf

FROM base as prod-image

RUN apk add certbot certbot-nginx
RUN mkdir /etc/letsencrypt
RUN mkdir -p /var/www/html
RUN mkdir -p /var/lib/letsencrypt
# Copy entrypoint
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

COPY dev.resonate.coop.conf /etc/nginx/conf.d/default.conf
# RUN certbot certonly --webroot --webroot-path=/var/www/html -d dev.resonate.coop --email dev@resonate.coop -n --agree-tos --expand

ENTRYPOINT [ "../entrypoint.sh" ]