FROM nginx:alpine as base

FROM base as dev-image

COPY local.dev.conf /etc/nginx/nginx.conf

FROM base as prod-image

RUN apk add certbot certbot-nginx
RUN mkdir /etc/letsencrypt

# Copy entrypoint
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

COPY dev.resonate.coop.conf /etc/nginx/nginx.conf

ENTRYPOINT [ "../entrypoint.sh" ]