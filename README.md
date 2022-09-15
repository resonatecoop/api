> 🛠 **Status: Active Development | Experimental**
>
> This project is currently broken and under very active development.

# Tracks API (v4 lol)

A rewrite of the Resonate tracks api, but with one database to rule them all.

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

### Conflicting PGSQL

If you already have PGSQL running on your system, you will need to use a different PGSQL port for the Dockerized Resonate database.

In that case you can set `POSTGRES_LOCAL_MACHINE_PORT` in `.env` to a different number, like `5433`

You can stop (`docker compose down`), change the port in the `.env`file, and then restart (`docker compose up`).

### Connecting to the database with an external databse tool

You can connect to the Dockerized database using an external tool. For this example we will use pgAdmin.

First, be sure that you are not using the default PG port (5432). Please see the entry above for how to do this.

In pgAdmin:
* In the left-hand panel, there should be a 'Servers' item you can click on
* Right-click 'Servers', then 'Create, then 'Server...'
* The 'Create Server' modal should pop up.
* In the 'General' tab, in the 'Name' field, enter a useful name. `Resonate-Docker-localhost` is an example.
  * There might be an error to the effect of 'Either host name, Address or Service must be specified.' We fix that in the next step.
* Click the 'Connection' tab.
* Enter a 'Host name / address'. 'localhost' often works well.
* In the 'Port' field, enter the port for the Resonate database. We use 5433 in keeping with the example above.
* 'Maintanence database': resonate
* Username: (use the username from the `.env` file)
* Password: (use the password from the `.env` file)
* Select 'Save password' if you are ok with saving the database password
* Click 'Save'.

There are other tools you can use to look into the Dockerized database instance. One example is the `PostgresSQL`plug in for VSCode. The steps for connecting might be different, but the required information should be like what appears in this section.

## Authentication

We use OpenID and the oidc-provider library to provide identity. Check out the documentation in `src/auth/README.md`
