const Router = require('@koa/router')
const { initialize } = require('koa-openapi')
const openapiDoc = require('./api-doc')

const collection = new Router()
const router = new Router()

initialize({
  router,
  basePath: '/v3/user/collection',
  apiDoc: openapiDoc,
  paths: [
    { path: '/apiDocs', module: require('./routes/apiDocs') },
    { path: '/', module: require('./routes') }
  ],
  dependencies: {
    trackService: require('../../tracks/services/trackService')
  }
})

collection.use('/collection', router.routes(), router.allowedMethods({ throw: true }))

module.exports = collection
