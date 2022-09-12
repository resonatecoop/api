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

