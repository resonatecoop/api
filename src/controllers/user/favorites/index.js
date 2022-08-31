const Router = require('@koa/router')
const koaBody = require('koa-body')
const { initialize } = require('koa-openapi')
const openapiDoc = require('./api-doc')

const favorites = new Router()
const router = new Router()

initialize({
  router,
  basePath: '/v3/user/favorites',
  apiDoc: openapiDoc,
  paths: [
    { path: '/apiDocs', module: require('./routes/apiDocs') },
    { path: '/resolve', module: require('./routes/resolve') },
    { path: '/', module: require('./routes') }
  ]
})

favorites.use(koaBody())
favorites.use('/favorites', router.routes(), router.allowedMethods({ throw: true }))

module.exports = favorites
