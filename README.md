> 🛠 **Status: Active Development | Experimental**
>
> This project is currently broken and under very active development.

# Tracks API (v4 lol)

A rewrite of the Resonate tracks api, but with one database to rule them all.

View the [product backlog](https://mattermost.resonate.coop/plugins/focalboard/workspace/gr3aqjbmw3d7fp3wukfw7hhppr/shared/bzkz3bnxxsbny3doh9aqhqy8cth/vzfpkzytdq3rkfjjwzagshoyrho?r=kwx8xtyxwcpmqsnh67iz8x74p7a), where work is tracked for this repository.

## Getting started with local dev

```sh
git clone <repo>
cd <repo>
cp .env.example .env
cp jwk-keys.json.example jwk-keys.json
cp cookies-keys.json.example cookies-keys.json

docker-compose up
```

Migrations should have run as part of `docker-compose up`

Seed the data

```sh
yarn docker:seed:all
```

## Docs

Swagger generates docs, you can see them at: 

```sh
http://localhost:4000/docs
```

## Workers (Uploading Music, Images, Etc)

If you want to upload music or upload images, you'll need a worker running.

```sh
docker exec -it resonate-api node src/jobs/queue-worker.js run convert-audio
```

> TODO: we should look into setting this up so that it starts running automatically on `docker-compose up`. The _right_ way to do this is probably to set up a container that launches the job.

## Docker tips & tricks

Hard rebuild the docker container

```sh
sudo rm -rf data/ && docker-compose up --build
``` 

Poke around the resonate db

```sh
docker ps # look for the resonate pgsql container name
docker exec -it <resonate-pgsql-container-name> psql -U resonate
```

### Resetting the database
This will need to be run to reset the database periodically while migrations are still being squared away.

```sh
yarn docker:migrate:undo:all
yarn docker:migrate
yarn docker:seed:all
```

### Troubleshooting The Database

Check out the [src/db/README.md](src/db/README.md) for some common database issues. 

### NGINX and getting things running on the server

The API should just get started if you run 

```
docker-compose up
```

on your server. However! There are intricacies around SSL and NGINX that [are documented in the nginx folder](nginx/README.md).

### Deploying to dev.resonate.coop

Check out the GitHub [deploy-stage](.github/workflows/deploy-stage.yml) for how we do it.

## Authentication

We use OpenID and the oidc-provider library to provide identity. Check out the documentation in `src/auth/README.md`
