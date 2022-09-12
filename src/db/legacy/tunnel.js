const { Client } = require('ssh2')
const mysql = require('mysql2')

const forwardConfig = {
  srcHost: '127.0.0.1',
  srcPort: 3306
  // dstHost: dbServer.host,
  // dstPort: dbServer.port
}

module.exports = (sshTunnelConfig, dbServer, destinationHost, destinationPort) => {
  const sshClient = new Client()

  return new Promise((resolve, reject) => {
    sshClient.on('ready', () => {
      console.log('ready', sshTunnelConfig)
      sshClient.forwardOut(
        forwardConfig.srcHost,
        forwardConfig.srcPort,
        destinationHost,
        destinationPort,
        (err, stream) => {
          console.log('err', err, stream)
          if (err) reject(err)
          const updatedDbServer = {
            ...dbServer,
            stream
          }
          console.log('updatedDB', updatedDbServer)
          const connection = mysql.createConnection(updatedDbServer)
          connection.connect((error) => {
            if (error) {
              console.log('error---', error)
              reject(error)
            }
            console.log('Connection Successful')
            resolve(connection)
          })
        })
    }).connect(sshTunnelConfig)
  })
}
