const Router = require('@koa/router')
const cors = require('@koa/cors')
const { initialize } = require('koa-openapi')
const openapiDoc = require('./api-doc')

const artists = new Router()
const router = new Router()

initialize({
  router,
  basePath: '/v3/artists',
  apiDoc: openapiDoc,
  paths: [
    { path: '/apiDocs', module: require('./routes/apiDocs') },
    { path: '/featured', module: require('./routes/featured') },
    { path: '/updated', module: require('./routes/updated') },
    { path: '/', module: require('./routes') },
    { path: '/{id}', module: require('./routes/{id}') },
    { path: '/{id}/releases', module: require('./routes/{id}/releases') },
    { path: '/{id}/tracks', module: require('./routes/{id}/tracks') },
    { path: '/{id}/tracks/top', module: require('./routes/{id}/tracks/top') }
  ],
  dependencies: {
    trackService: require('../tracks/services/trackService')
  }
})

artists.use(cors())
artists.use('/artists', router.routes(), router.allowedMethods({ throw: true }))

module.exports = artists
