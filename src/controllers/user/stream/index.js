const Router = require('@koa/router')
const { initialize } = require('koa-openapi')
const openapiDoc = require('./api-doc')
const koaBody = require('koa-body')

const stream = new Router()
const router = new Router()

initialize({
  router,
  basePath: '/v3/user/stream',
  apiDoc: openapiDoc,
  paths: [
    { path: '/{id}', module: require('./routes/{id}') }
  ]
})

stream.use(koaBody())
stream.use('/stream', router.routes(), router.allowedMethods({ throw: true }))

module.exports = stream
