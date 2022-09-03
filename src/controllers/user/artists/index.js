const Router = require('@koa/router')
const { initialize } = require('koa-openapi')
const openapiDoc = require('./api-doc')
const koaBody = require('koa-body')

const artists = new Router()
const router = new Router()

initialize({
  router,
  basePath: '/v3/user/artists',
  apiDoc: openapiDoc,
  paths: [
    { path: '/apiDocs', module: require('./routes/apiDocs') },
    { path: '/', module: require('./routes') },
    { path: '/{id}', module: require('./routes/{id}') }
  ]
})

artists.use(koaBody())
artists.use('/artists', router.routes(), router.allowedMethods({ throw: true }))

module.exports = artists
