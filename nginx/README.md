# NGINX

We use NGINX to serve our files.

## LetsEncrypt

The nginx [Dockerfile](./Dockerfile) installs letsencrypt if the `WITH_CERTBOT` variable is set to `true` in your `.env` file.

To create a certificate, you then need to enter the docker container:

```
docker exec -it resonate-nginx sh
```

Now, you can request a new certificate. Note the domain name and the email:

```
certbot certonly --webroot --webroot-path=/var/www/html -d dev.resonate.coop --email dev@resonate.coop  --agree-tos --no-eff-email --force-renewal
```