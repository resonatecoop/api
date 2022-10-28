const Koa = require('koa')
const mount = require('koa-mount')

const files = require('./files')
const queues = require('./queues')
// const trackgroups = require('./trackgroups')
const earnings = require('./earnings')
const tracks = require('./tracks')
const plays = require('./plays')
// const users = require('./users')
const profile = require('./profile')

const admin = new Koa()

admin.use(mount('/queues', queues))
admin.use(mount('/earnings', earnings))
admin.use(mount('/plays', plays))
// admin.use(mount('/trackgroups', trackgroups))
admin.use(mount('/profile', profile))
admin.use(mount('/tracks', tracks))
// admin.use(mount('/users', users))

admin.use(mount('/files', files))

module.exports = admin
