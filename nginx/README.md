# NGINX

We use NGINX to serve our application.

## LetsEncrypt

The nginx [Dockerfile](./Dockerfile) installs letsencrypt's `certbot` if the `IMAGE` variable is set to `prod-image` or `stage-image` in your `.env` file. It will not, however, actually go through the process of installing the cert. 

> Note: room for improvement here, especially if we want our containers to run on clusters in the future.

```
IMAGE=prod-image
```

To create a certificate, you then need to enter the docker container:

```
docker exec -it resonate-nginx sh
```

Now, you can request a new certificate. Note the domain name and the email:


```
certbot certonly --nginx -d dev.resonate.coop --email dev@resonate.coop --agree-tos --no-e
ff-email --force-renewal
```

After the certificate has been installed, check to see if the crontab inside of docker has a regular task.

```
cat /etc/crontab
```