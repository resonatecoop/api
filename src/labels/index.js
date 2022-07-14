const Router = require('@koa/router')
const { initialize } = require('koa-openapi')
const openapiDoc = require('./api-doc')
const cors = require('@koa/cors')

const labels = new Router()
const router = new Router()

initialize({
  router,
  basePath: '/v3/labels',
  apiDoc: openapiDoc,
  paths: [
    { path: '/apiDocs', module: require('./routes/apiDocs') },
    { path: '/', module: require('./routes') },
    { path: '/{id}', module: require('./routes/{id}') },
    { path: '/{id}/albums', module: require('./routes/{id}/albums') },
    { path: '/{id}/releases', module: require('./routes/{id}/releases') },
    { path: '/{id}/artists', module: require('./routes/{id}/artists') }
  ],
  dependencies: {
    trackService: require('../tracks/services/trackService')
  }
})

labels.use(cors())
labels.use('/labels', router.routes(), router.allowedMethods({ throw: true }))

module.exports = labels
