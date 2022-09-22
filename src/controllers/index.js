const Router = require('@koa/router')

const trackgroups = require('./trackgroups/index')
const tracks = require('./tracks/index')
const artists = require('./artists/index')
const users = require('./users/index')
const labels = require('./labels/index')
const search = require('./search/index')
const tag = require('./tag/index')
const resolve = require('./resolve/index')

const apiRouter = new Router()

apiRouter.use('/api/v3', tracks.routes())
apiRouter.use('/api/v3', artists.routes())
apiRouter.use('/api/v3', labels.routes())
apiRouter.use('/api/v3', resolve.routes())
apiRouter.use('/api/v3', search.routes())
apiRouter.use('/api/v3', tag.routes())
apiRouter.use('/api/v3', trackgroups.routes())
apiRouter.use('/api/v3', tracks.routes())
apiRouter.use('/api/v3', users.routes())

module.exports = apiRouter
