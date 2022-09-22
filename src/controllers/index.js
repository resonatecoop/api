const Router = require('@koa/router')

const { initialize } = require('koa-openapi')
const cors = require('@koa/cors')

const playlists = require('./playlists/index')
const koaBody = require('koa-body')

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

    { path: `${root}/labels`, module: require('./labels/routes') },
    { path: `${root}/labels/{id}`, module: require('./labels/routes/{id}') },
    { path: `${root}/labels/{id}/albums`, module: require('./labels/routes/{id}/albums') },
    { path: `${root}/labels/{id}/releases`, module: require('./labels/routes/{id}/releases') },
    { path: `${root}/labels/{id}/artists`, module: require('./labels/routes/{id}/artists') },

    // FIXME: This one is broken cause it relies on elastic search.
    { path: `${root}/search`, module: require('./search/routes') },

    // FIXME: Not entirely clear on what the point of this route is
    { path: `${root}/resolve`, module: require('./resolve/routes') },

    { path: `${root}/trackgroups`, module: require('./trackgroups/routes') },
    { path: `${root}/trackgroups/{id}`, module: require('./trackgroups/routes/{id}') },

    { path: `${root}/users/{id}`, module: require('./users/routes/{id}') },
    { path: `${root}/users/{id}/playlists`, module: require('./users/routes/{id}/playlists') },

    { path: `${root}/user/profile`, module: require('./user/profile/routes') },
    { path: `${root}/user/artists`, module: require('./user/artists/routes') },
    { path: `${root}/user/artists/{id}`, module: require('./user/artists/routes/{id}') },
    { path: `${root}/user/collection`, module: require('./user/collection/routes') },

    { path: `${root}/user/favorites/resolve`, module: require('./user/favorites/routes/resolve') },
    { path: `${root}/user/favorites`, module: require('./user/favorites/routes') },

    { path: `${root}/user/plays`, module: require('./user/plays/routes') },
    { path: `${root}/user/plays/resolve`, module: require('./user/plays/routes/resolve') },
    { path: `${root}/user/plays/spendings`, module: require('./user/plays/routes/spendings') },
    { path: `${root}/user/plays/buy`, module: require('./user/plays/routes/buy') },
    { path: `${root}/user/plays/stats`, module: require('./user/plays/routes/stats') },
    { path: `${root}/user/plays/history`, module: require('./user/plays/routes/history/tracks') },
    { path: `${root}/user/plays/history/artists`, module: require('./user/plays/routes/history/artists') },

    {
      path: `${root}/apiDocs`,
      module: require('./apiDocs')
    }],
  dependencies: {
    trackService: require('./tracks/services/trackService')
  }
})

apiRouter.use(koaBody())
apiRouter.use(cors())

apiRouter.use('', openApiRouter.routes(), openApiRouter.allowedMethods({ throw: true }))
apiRouter.use(root, playlists.routes())

module.exports = apiRouter
