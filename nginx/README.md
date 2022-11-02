# NGINX

We use NGINX to serve our application.

## LetsEncrypt

The nginx [Dockerfile](./Dockerfile) installs letsencrypt's `certbot` if the `IMAGE` variable is set to `prod-image` in your `.env` file. It will not, however, actually go through the process of installing the cert. 

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
certbot certonly --nginx -d dev.resonate.coop --email dev@resonate.coop --agree-tos --no-eff-email --force-renewal
```

After the certificate has been installed, check to see if the crontab inside of docker has a regular task.

```
cat /etc/crontab
```

## Production

On production we're hosted on the `prod2-upload` server. 

Because we're dealing with other installed applications here, we've got a non-obvious set-up for our nginx, and it's not part of our repository. Once we've migrated away from those applications, we can bring things into the API.

The directory structure is:

```
~
  - docker-compose.prod.yml
  - conf.d
      - prod.resonate.coop.conf <- our nginx conf file
      - dash.resonate.coop.conf
      - etc
  - # various other services
  - api
    - docker-compose.yml
```

On this server _both_ the `docker-compose.prod.yml` **and** the api.docker-compose.yml are running.

For now, this means that we ignore the `api` nginx server when starting up our services.

Based on [this](https://stackoverflow.com/questions/39002771/exclude-starting-some-containers-with-docker-compose):

```
cd api
docker-compose up --scale nginx=0 -d
```

We're currently also not assigning a static IP address to our api container, which sits in a different network from the one spun up by the root `docker-compose.prod.yml`. We should look into if this is possible, [some ideas here](https://stackoverflow.com/questions/27937185/assign-static-ip-to-docker-container).

**While we don't do that**, every time we restart the api container (as above), we need to copy-paste the IP address from `docker inspect resonate-api` (value stored in `NetworkSettings.Networks.api_api-network.Gateway`) to `conf.d/prod.resonate.coop.conf` into the `location / {` `proxy_pass` statement for the SSL server (the second server block).   

### So instead we use the prod nginx service:

To restart the prod nginx:

```
docker-compose -p upload-tool -f docker-compose-prod.yml up -d --force-recreate --no-deps webserver
```

### certbot

You have to run the certbot volume to get a certificate

```
docker-compose -p upload-tool -f ./docker-compose-prod.yml --no-ansi run certbot certonly -d prod.resonate.coop --email dev@resonate.coop --agree-tos --no-eff-email
```