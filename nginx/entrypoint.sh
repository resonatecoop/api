#!/bin/sh

certbot certonly --webroot --webroot-path=/var/www/html -d dev.resonate.coop --email dev@resonate.coop -n --agree-tos --expand

/usr/sbin/nginx -g "daemon off;" # start nginx in the background