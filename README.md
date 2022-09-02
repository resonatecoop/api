# Tracks API (v4 lol)

A rewrite of the Resonate tracks api, but with one database to rule them all.

## Getting started with local dev

```
git clone <repo>
cd <repo>
cp .env.example .env
cp jwk-keys.json.example jwk-keys.json
cp cookies-keys.json.example cookies-keys.json

docker-compose up
```

Migrations should have run as part of `docker-compose up`

Seed the data

```
yarn docker:seed:all
```

## Docs

Swagger generates docs, you can see them at: 

```
http://localhost:4000/docs
```

## Workers (Uploading Music, Images, Etc)

If you want to upload music, you'll need a worker running.

```
docker exec -it resonate-api node src/jobs/audio-process-queue.js run convert-audio
```

> TODO: we should look into setting this up so that it starts running automatically on `docker-compose up`. The _right_ way to do this is probably to set up a container that launches the job.

## Docker tips & tricks

Hard rebuild the docker container

```
sudo rm -rf data/ && docker-compose up --build
``` 

Poke around the resonate db

```
docker ps # look for the resonate pgsql container name
docker exec -it <resonate-pgsql-container-name> psql -U resonate
```

### Conflicting PGSQL

It might be that you already have postgres installed on your machine, in which case the exposed postgres port by docker causes a conflict. 

In that case set `POSTGRES_LOCAL_MACHINE_PORT` in `.env` so a different number, like `5433`

## Authentication

We use OpenID and the oidc-provider library to provide identity. Check out the documentation in `src/auth/README.md`