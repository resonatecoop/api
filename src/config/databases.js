const debug = require('debug')
require('dotenv').config()

const config = {
  development: {
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    host: process.env.POSTGRES_HOSTNAME,
    port: process.env.POSTGRES_EXT_PORT || 5432,
    // host: 'localhost',
    // port: 5433,
    dialect: 'postgres',
    logging: debug('sequelize')
  },
  test: {
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    host: process.env.POSTGRES_HOSTNAME,
    dialect: 'postgres',
    port: process.env.POSTGRES_EXT_PORT || 5435,
    // logging: console.log
    logging: debug('sequelize')
  },
  production: {
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    host: process.env.POSTGRES_HOSTNAME,
    dialect: 'postgres',
    port: process.env.POSTGRES_EXT_PORT || 5432,
    logging: false
  }
}

module.exports = config
