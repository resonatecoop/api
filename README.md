# Tracks API (v4 lol)

A rewrite of the Resonate tracks api, but with one database to rule them all.

## Getting started with local dev

```
git clone <repo>
cd <repo>
cp .env.example .env
docker-compose up
```

Run migrations

```
yarn migrate
```

Seed the data

```
yarn seed
```

## TODO

* Fix tests
* More seeding data
* Authentication, we probably need to set up our own OAuth and client set-up
* Move acceptable CORS endpoints into database
* Image & music uploading
* Payment processing

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