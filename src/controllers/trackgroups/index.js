const Router = require('@koa/router')
const cors = require('@koa/cors')
const { initialize } = require('koa-openapi')
const openapiDoc = require('./api-doc')

const trackgroups = new Router()
const router = new Router()

initialize({
  router,
  basePath: '/v3/trackgroups',
  apiDoc: openapiDoc,
  paths: [
    { path: '/apiDocs', module: require('./routes/apiDocs') },
    { path: '/', module: require('./routes') },
    { path: '/{id}', module: require('./routes/{id}') }
  ]
})

trackgroups.use(cors())
trackgroups.use('/trackgroups', router.routes(), router.allowedMethods({ throw: true }))

module.exports = trackgroups
