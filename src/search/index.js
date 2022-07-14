const Router = require('@koa/router')
const cors = require('@koa/cors')
const { initialize } = require('koa-openapi')
const openapiDoc = require('./api-doc')
const path = require('path')

const search = new Router()
const router = new Router()

initialize({
  router,
  basePath: '/v3/search',
  apiDoc: openapiDoc,
  paths: path.resolve(__dirname, 'routes')
})

search.use(cors())
search.use('/search', router.routes(), router.allowedMethods({ throw: true }))

module.exports = search
