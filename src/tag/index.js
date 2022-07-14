const Router = require('@koa/router')
const cors = require('@koa/cors')
const { initialize } = require('koa-openapi')
const openapiDoc = require('./api-doc')

const tag = new Router()
const router = new Router()

initialize({
  router,
  basePath: '/v3/tag',
  apiDoc: openapiDoc,
  paths: [
    { path: '/apiDocs', module: require('./routes/apiDocs') },
    { path: '/{tag}', module: require('./routes/{tag}') }
  ]
})

tag.use(cors())
tag.use('/tag', router.routes(), router.allowedMethods({ throw: true }))

module.exports = tag
