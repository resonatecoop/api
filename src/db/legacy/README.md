# Legacy Migrations

These files handle migrating data from the legacy databases to the current ones.

> Note: for this to work you'll need SSH access to the `apiserver` and `resonate` servers. 

First, you'll need to make sure the database is seeded with the right roles and such.

```
docker exec -it resonate-api npx sequelize db:seed:all --config src/config/databases.js --seeders-path src/db/seeders
```

Then copy over user data from user-api 

```
docker exec -it resonate-api node src/db/legacy/user-api-migration.js postgres
```

Then copy over old mysql data (from WordPress)

```
docker exec -it resonate-api node src/db/legacy/user-api-migration.js mysql
```

