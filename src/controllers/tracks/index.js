const Router = require('@koa/router')
const { initialize } = require('koa-openapi')
const openapiDoc = require('./api-doc')
const cors = require('@koa/cors')

const tracks = new Router()
const router = new Router()

initialize({
  router,
  basePath: '/v3/tracks',
  apiDoc: openapiDoc,
  paths: [
    { path: '/apiDocs', module: require('./routes/apiDocs') },
    { path: '/latest', module: require('./routes/latest') },
    { path: '/', module: require('./routes') },
    { path: '/{id}', module: require('./routes/{id}') }
  ],
  dependencies: {
    trackService: require('./services/trackService')
  }
})

tracks.use(cors())
tracks.use('/tracks', router.routes(), router.allowedMethods({ throw: true }))

module.exports = tracks
