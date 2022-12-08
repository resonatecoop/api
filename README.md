> 🛠 **Status: Active Development | Experimental**
>
> This project is currently broken and under very active development.

# Tracks API

A rewrite of the Resonate tracks api, but with one database to rule them all.

View the [product backlog](https://mattermost.resonate.coop/plugins/focalboard/workspace/gr3aqjbmw3d7fp3wukfw7hhppr/shared/bzkz3bnxxsbny3doh9aqhqy8cth/vzfpkzytdq3rkfjjwzagshoyrho?r=kwx8xtyxwcpmqsnh67iz8x74p7a), where work is tracked for this repository.

## Getting started with local dev

```sh
git clone <repo>
cd <repo>
```

Copy over all the required env variables

```
cp .env.example .env
cp jwk-keys.json.example jwk-keys.json
cp cookies-keys.json.example cookies-keys.json
```

Set up the dev environment

```
yarn install
yarn husky install

And then run the server!

```
docker-compose up
```

Migrations should have run as part of `docker-compose up`

Seed the data

```sh
yarn docker:seed:all
```

Now go to http://localhost:4000/docs and you should see the swagger docs!

## Tests

In short, you need to start the special test container. 

```sh
yarn docker:compose:test:up
```

Load in some preliminary test data

```sh
yarn docker:seed:all:test
```

And then run the tests.

```sh
yarn test:all
```

Check out the test [README.md](/test/README.md) for more details.

## Code standards

We use [Standard Style](https://standardjs.com/) throughout the project. We recommend installing a plugin in whatever your favorite editor is to automatically format code on save, so that you don't have to worry about it. A check will run on any Pull Request that will fail if it's not styled correctly.

We use [commitlint](https://commitlint.js.org/) to verify that commits are machine and human readable using [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/). A check will run on any Pull Request that will fail if it commits are not named correctly.

## Clients

This API is an API, and as such, it needs clients to be particularly useful!

To register a client, you can simply add one to the database. Check out the [client-seeder](src/db/seeders/clients-seeder.js) for what that could look like. For testing purposes you want to take particular note of the `meta_data.allowed-cors-origins` and `redirect_uris`. Note that if you are building a browser client and don't match the same origin as in the `allowed-cors-origins` your requests will fail!

If you're just looking to get started with the API to build your own client, you can use the client in [client-seeder](src/db/seeders/clients-seeder.js).

> Note: we should write a thorough guide for that!

## Docs

Swagger generates docs, you can see them at: 

```sh
http://localhost:4000/docs
```

## Workers (Uploading Music, Images, Etc)

If you want to upload music or upload images, you'll need a worker running.

```sh
docker exec -it resonate-api node src/jobs/queue-worker.js run
```

> NOTE: this is done automatically by the `resonate-background` container in docker.

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

### Windows Pre-reqs for Docker

To use Docker on Windows, you will need to have Windows Subsystem for Linux installed.
https://docs.docker.com/desktop/install/windows-install/

If you are also working in Visual Studio Code, you may require the Visual Studio Code Remote Development Extension Pack.
https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.vscode-remote-extensionpack


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

### Deploying to *.resonate.coop

#### Stage 

Stage is at https://dev.resonate.coop/docs. It's hosted on our Hetzner servers.

Check out the GitHub [deploy-stage](.github/workflows/deploy-stage.yml) for how we do it.https://dev.resonate.coop/docs

### Deploying to prod

#### Prod

Prod is at https://prod.resonate.coop/docs. It's hosted on our Hetzner servers. 

Right now we manually deploy prod. Check out [the nginx readme](nginx/README.md#production) for production deployment notes. 

## Authentication

We use OpenID and the oidc-provider library to provide identity. Check out the documentation in `src/auth/README.md`
