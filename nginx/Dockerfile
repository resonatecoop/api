FROM nginx:alpine as base

FROM base as local-image

COPY local.dev.conf /etc/nginx/conf.d/default.conf

FROM base as stage-image

RUN apk add certbot certbot-nginx
RUN mkdir /etc/letsencrypt
RUN mkdir -p /var/www/html
RUN mkdir -p /var/lib/letsencrypt

COPY dev.resonate.coop.conf /etc/nginx/conf.d/default.conf
RUN SLEEPTIME=$(awk 'BEGIN{srand(); print int(rand()*(3600+1))}'); echo "0 0,12 * * * root sleep $SLEEPTIME && certbot renew -q" | tee -a /etc/crontab > /dev/null

FROM base as prod-image

COPY prod.resonate.coop.conf /etc/nginx/conf.d/default.conf
RUN SLEEPTIME=$(awk 'BEGIN{srand(); print int(rand()*(3600+1))}'); echo "0 0,12 * * * root sleep $SLEEPTIME && certbot renew -q" | tee -a /etc/crontab > /dev/null
