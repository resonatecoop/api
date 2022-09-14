const { Client: PGClient } = require('pg')
const mysql = require('mysql')
const tunnel = require('tunnel-ssh')
const pgMigration = require('./pg-migrations')

const { USER_API_DB, USER_API_SERVER, MYSQL_DB, WORDPRESS_SERVER } = require('./config.js')
const mysqlMigrations = require('./mysql-migrations')

const postgresProxyHost = '127.0.0.1'
const postgresProxyPort = 9090
const mysqlProxyPort = 9091
const mysqlProxyHost = '127.0.0.1'

if (process.argv[2] === 'mysql') {
  const server = tunnel({
    ...WORDPRESS_SERVER,
    dstHost: MYSQL_DB.host,
    dstPort: MYSQL_DB.port,
    localHost: mysqlProxyHost,
    localPort: mysqlProxyPort
  }, async (err, server) => {
    if (err) { console.log(err); return }
    const conn = mysql.createConnection({
      ...MYSQL_DB,
      host: mysqlProxyHost,
      port: mysqlProxyPort
    })
    conn.connect()

    await mysqlMigrations(conn)

    conn.end()
  })

  server.on('error', (err) => {
    console.log('error', err)
  })
}

if (process.argv[2] === 'postgres') {
  const postgresServer = tunnel({
    ...USER_API_SERVER,
    dstHost: USER_API_DB.host,
    dstPort: USER_API_DB.port,
    localHost: postgresProxyHost,
    localPort: postgresProxyPort
  }, async (err, server) => {
    if (err) { console.log(err); return }
    const pgClient = new PGClient({ ...USER_API_DB, host: postgresProxyHost, port: postgresProxyPort })
    await pgClient.connect()

    const res = await pgClient.query('SELECT $1::text as connected', ['Connection to postgres successful!'])
    console.log(res.rows[0].connected)
    await pgMigration(pgClient)
    pgClient.end()
  })

  postgresServer.on('error', (err) => {
    console.log('error', err)
  })
}
