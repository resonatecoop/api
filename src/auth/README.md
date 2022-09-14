# Authentication

We use [`node-oidc-provider`](https://github.com/panva/node-oidc-provider/) to manage most of our authentication and authorization flow for us. 

You can see the automatic configuration at:

```
http://localhost:4000/.well-known/openid-configuration
```

Registration is served at:

```
http://localhost:4000/register
```

## Redis

It uses redis to manage sessions. You can explore the redis database using `redis-cli` or a GUI ([recommend using RESP.app](https://docs.resp.app/en/latest/)).

### CLI

```
$ docker exec -it resonate-redis redis-cli
$ ping
```

### GUI

Download the GUI, connect to localhost:6379, password set in `.env`. 

## Clients

Clients are stored in the postgres table `clients`. We don't have a UI for client management yet, and right now we seed a test client. You can edit clients directly in the database.

Next you'll need a client app. You can use beam.

## Inside Beam

Make sure the code for beam is up to date. Set your `.env.local` file:

```
REACT_APP_CLIENT_SECRET=matron-fling-raging-send-herself-ninth
REACT_APP_CLIENT_ID=
REACT_APP_AUTHORITY=http://localhost:4000
REACT_APP_AUTH_METADATA_URL=http://localhost:4000/.well-known/openid-configuration
REACT_APP_API=http://localhost:4000/
``` 

Your client-id you should get from the database, as it was automatically generated on seeding. It'll be the only entry in the `clients` table, and it's in the `key` column.

Now

```
yarn start
```

This should start up beam. If you've installed beam before you should clear the local storage. 

Now, theoretically, if you click on "Log in" it should take you to a log in page at `localhost:4000/auth?xyz`. You should then be able to log in with the account you created before. 