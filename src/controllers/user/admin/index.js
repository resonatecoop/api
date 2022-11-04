const Koa = require('koa')
const mount = require('koa-mount')

const files = require('./files')
const queues = require('./queues')
const earnings = require('./earnings')
const plays = require('./plays')

const admin = new Koa()

admin.use(mount('/queues', queues))
admin.use(mount('/earnings', earnings))
admin.use(mount('/plays', plays))

admin.use(mount('/files', files))

module.exports = admin
