# Tracks API (v4 lol)

A rewrite of the Resonate tracks api, but with one database to rule them all.

## Getting started with local dev

```
git clone <repo>
cd <repo>
cp .env.example .env
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