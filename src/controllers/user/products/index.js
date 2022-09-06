const Router = require('@koa/router')
const { initialize } = require('koa-openapi')
const openapiDoc = require('./api-doc')

const products = new Router()
const router = new Router()

initialize({
  router,
  basePath: '/v3/user/products',
  apiDoc: openapiDoc,
  paths: [
    { path: '/apiDocs', module: require('./routes/apiDocs') },
    { path: '/', module: require('./routes') },
    { path: '/success', module: require('./routes/success') },
    { path: '/cancel', module: require('./routes/cancel') },
    { path: '/checkout', module: require('./routes/checkout') }
  ]
})

products.use('/products', router.routes(), router.allowedMethods({ throw: true }))

module.exports = products
