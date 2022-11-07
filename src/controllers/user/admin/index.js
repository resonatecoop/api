const Koa = require('koa')
const mount = require('koa-mount')

const queues = require('./queues')

const admin = new Koa()

admin.use(mount('/queues', queues))

module.exports = admin
