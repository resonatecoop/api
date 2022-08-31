const Router = require('@koa/router')
const koaBody = require('koa-body')
const { initialize } = require('koa-openapi')
const openapiDoc = require('./api-doc')

const plays = new Router()
const router = new Router()

initialize({
  router,
  basePath: '/v3/user/plays',
  apiDoc: openapiDoc,
  paths: [
    { path: '/apiDocs', module: require('./routes/apiDocs') },
    { path: '/', module: require('./routes') },
    { path: '/resolve', module: require('./routes/resolve') },
    { path: '/spendings', module: require('./routes/spendings') },
    { path: '/buy', module: require('./routes/buy') },
    { path: '/stats', module: require('./routes/stats') },
    { path: '/history', module: require('./routes/history/tracks') },
    { path: '/history/artists', module: require('./routes/history/artists') }
  ],
  dependencies: {
    trackService: require('../../tracks/services/trackService')
  }
})

plays.use(koaBody())
plays.use('/plays', router.routes(), router.allowedMethods({ throw: true }))

module.exports = plays
