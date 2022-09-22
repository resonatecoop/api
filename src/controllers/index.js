const Router = require('@koa/router')

const { initialize } = require('koa-openapi')
const cors = require('@koa/cors')

const trackgroups = require('./trackgroups/index')
const users = require('./users/index')
const labels = require('./labels/index')
const search = require('./search/index')
const resolve = require('./resolve/index')
const playlists = require('./playlists/index')

const root = '/api/v3'

const apiRouter = new Router()
const openApiRouter = new Router()

// Initialize the API!
initialize({
  router: openApiRouter,
  basePath: root,
  apiDoc: require('./api-doc'),
  paths: [
    { path: `${root}/tracks`, module: require('./tracks/routes') },
    { path: `${root}/tracks/latest`, module: require('./tracks/routes/latest') },
    { path: `${root}/tracks/{id}`, module: require('./tracks/routes/{id}') },

    // FIXME: This one is broken cause it relies on elastic search.
    { path: `${root}/tag/{tag}`, module: require('./tag/routes/{tag}') },

    { path: `${root}/artists/featured`, module: require('./artists/routes/featured') },
    { path: `${root}/artists/updated`, module: require('./artists/routes/updated') },
    { path: `${root}/artists`, module: require('./artists/routes') },
    { path: `${root}/artists/{id}`, module: require('./artists/routes/{id}') },
    { path: `${root}/artists/{id}/releases`, module: require('./artists/routes/{id}/releases') },
    { path: `${root}/artists/{id}/tracks`, module: require('./artists/routes/{id}/tracks') },
    { path: `${root}/artists/{id}/tracks/top`, module: require('./artists/routes/{id}/tracks/top') },

    {
      path: `${root}/apiDocs`,
      module: require('./apiDocs')
    }],
  dependencies: {
    trackService: require('./tracks/services/trackService')
  }
})

apiRouter.use(cors())

apiRouter.use('', openApiRouter.routes(), openApiRouter.allowedMethods({ throw: true }))
apiRouter.use(root, labels.routes())
apiRouter.use(root, resolve.routes())
apiRouter.use(root, search.routes())
apiRouter.use(root, trackgroups.routes())
apiRouter.use(root, users.routes())
apiRouter.use(root, playlists.routes())

module.exports = apiRouter
