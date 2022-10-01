# DB Tips & Tricks

## Backups

Create a backup:

```
docker exec -it api_postgres-db_1 pg_dump -d resonate_prod_api --no-comments -F c -O -x -f backup.sql
```

Copy the backup outside of docker

```
docker cp api_postgres-db_1:backup.sql backup.sql
```

## Troubleshooting

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