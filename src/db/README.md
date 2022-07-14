# Setup from scratch

Install [wordpress](https://wordpress.org/download/)

Tables should be prefixed with `rsntr_`.

## Required Plugins

- Ultimatemember
- Gravity Forms

## [WIP] Running migrations

Run migrations only for trackgroup table. Change `trackGroup` with your target model name.

```sh
npx sequelize-cli db:migrate trackGroup
```

See [sequelize/cli](https://github.com/sequelize/cli) for more infos.
