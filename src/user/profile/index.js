const Router = require('@koa/router')
const { initialize } = require('koa-openapi')
const openapiDoc = require('./api-doc')

const profile = new Router()
const router = new Router()

initialize({
  router,
  basePath: '/v3/user/profile',
  apiDoc: openapiDoc,
  paths: [
    { path: '/apiDocs', module: require('./routes/apiDocs') },
    { path: '/', module: require('./routes') }
  ]
})

profile.use('/profile', router.routes(), router.allowedMethods({ throw: true }))

module.exports = profile
