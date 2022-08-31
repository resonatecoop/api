const Router = require('@koa/router')
const { initialize } = require('koa-openapi')
const openapiDoc = require('./api-doc')
const koaBody = require('koa-body')

const trackgroups = new Router()
const router = new Router()

initialize({
  router,
  basePath: '/v3/user/trackgroups',
  apiDoc: openapiDoc,
  paths: [
    { path: '/apiDocs', module: require('./routes/apiDocs') },
    { path: '/', module: require('./routes') },
    { path: '/{id}', module: require('./routes/{id}') },
    { path: '/{id}/privacy', module: require('./routes/{id}/privacy') },
    { path: '/{id}/items', module: require('./routes/{id}/items') },
    { path: '/{id}/items/add', module: require('./routes/{id}/items/add') },
    { path: '/{id}/items/remove', module: require('./routes/{id}/items/remove') }
  ]
})

trackgroups.use(koaBody())
trackgroups.use('/trackgroups', router.routes(), router.allowedMethods({ throw: true }))

module.exports = trackgroups
