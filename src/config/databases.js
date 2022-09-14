const debug = require('debug')
require('dotenv').config()

const config = {
  development: {
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    // host: process.env.POSTGRES_HOSTNAME,
    // port: process.env.POSTGRES_EXT_PORT || 5432,
    host: 'localhost',
    port: 5433,
    dialect: 'postgres',
    logging: debug('sequelize')
    // Resonate: {
    //   username: process.env.MYSQL_DB_USER,
    //   password: process.env.MYSQL_DB_PASS,
    //   database: process.env.MYSQL_DB_NAME,
    //   port: process.env.MYSQL_DB_PORT || 3306,
    //   host: process.env.MYSQL_DB_HOST || '127.0.0.1',
    //   dialect: 'mysql',
    //   logging: console.log,
    //   pool: {
    //     max: 100,
    //     min: 0,
    //     idle: 200000,
    //     acquire: 1000000
    //   },
    //   define: {
    //     charset: 'utf8mb4',
    //     collate: 'utf8mb4_unicode_ci',
    //     timestamps: false
    //   }
    // }
  },
  test: {
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    host: process.env.POSTGRES_HOSTNAME,
    dialect: 'postgres',
    port: process.env.POSTGRES_EXT_PORT || 5432,
    logging: console.log
    // Resonate: {
    //   username: process.env.MYSQL_DB_USER,
    //   password: process.env.MYSQL_DB_PASS,
    //   database: process.env.MYSQL_DB_NAME || 3306,
    //   host: process.env.MYSQL_DB_HOST || '127.0.0.1',
    //   dialect: 'mysql',
    //   logging: false,
    //   define: {
    //     charset: 'utf8mb4',
    //     collate: 'utf8mb4_unicode_ci',
    //     timestamps: false
    //   }
    // }
  },
  production: {
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    host: process.env.POSTGRES_HOSTNAME,
    dialect: 'postgres',
    port: process.env.POSTGRES_EXT_PORT || 5432,
    logging: false
    // Resonate: {
    //   username: process.env.MYSQL_DB_USER,
    //   password: process.env.MYSQL_DB_PASS,
    //   database: process.env.MYSQL_DB_NAME,
    //   port: process.env.MYSQL_DB_PORT || 3306,
    //   host: process.env.MYSQL_DB_HOST || '127.0.0.1',
    //   dialect: 'mysql',
    //   logging: false,
    //   define: {
    //     charset: 'utf8mb4',
    //     collate: 'utf8mb4_unicode_ci',
    //     timestamps: false
    //   }
    // }
  }
}

module.exports = config
