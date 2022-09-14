const Router = require('@koa/router')
const cors = require('@koa/cors')
const { initialize } = require('koa-openapi')
const openapiDoc = require('./api-doc')

const users = new Router()
const router = new Router()

initialize({
  router,
  basePath: '/v3/users',
  apiDoc: openapiDoc,
  paths: [
    { path: '/apiDocs', module: require('./routes/apiDocs') },
    { path: '/{id}', module: require('./routes/{id}') },
    { path: '/{id}/playlists', module: require('./routes/{id}/playlists') }
  ]
})

users.use(cors())
users.use('/users', router.routes(), router.allowedMethods({ throw: true }))

module.exports = users
