const dotenv = require('dotenv-safe')
dotenv.config()

const Koa = require('koa')
const logger = require('koa-logger')
const compress = require('koa-compress')
const error = require('koa-json-error')
const mount = require('koa-mount')
const etag = require('koa-etag')
const render = require('koa-ejs')
const path = require('path')

const session = require('koa-session')
const koaCash = require('koa-cash')
const { koaSwagger } = require('koa2-swagger-ui')
const cors = require('@koa/cors')
const ratelimit = require('koa-ratelimit')
const Redis = require('ioredis')

const KeyGrip = require('keygrip')

const swaggerConfig = require('./config/swagger')
const koaCashConfig = require('./config/cache')
const errorConfig = require('./config/error')
const compressConfig = require('./config/compression')
const sessionConfig = require('./config/session')

/**
 * Koa apps
 */

const user = require('./user/index')
const { provider, routes: authRoutes } = require('./auth/index')
const trackgroups = require('./trackgroups/index')
const tracks = require('./tracks/index')
const artists = require('./artists/index')
const users = require('./users/index')
const labels = require('./labels/index')
const search = require('./search/index')
const tag = require('./tag/index')
const resolve = require('./resolve/index')
const stream = require('./stream/index')
const Router = require('@koa/router')

const app = new Koa({
  keys: new KeyGrip([process.env.APP_KEY, process.env.APP_KEY_2], 'sha256'),
  proxy: true
})

const origins = [
  'https://id.resonate.localhost',
  'https://id.resonate.ninja',
  'https://id.resonate.coop',
  'https://beta.stream.resonate.coop',
  'https://beta.stream.resonate.localhost',
  'https://beta.stream.resonate.localhost:8080',
  'https://beta.stream.resonate.ninja',
  'http://localhost:8080',
  'https://localhost:8080'
]

// console.log(process.env.REDIS_HOST)

app
  .use(logger())
  .use(ratelimit({
    db: new Redis({
      port: process.env.REDIS_PORT || 6379,
      host: process.env.REDIS_HOST || '127.0.0.1',
      password: process.env.REDIS_PASSWORD
    }),
    duration: 60000,
    errorMessage: 'Dashboard api is rate limited',
    id: (ctx) => ctx.ip,
    headers: {
      remaining: 'Rate-Limit-Remaining',
      reset: 'Rate-Limit-Reset',
      total: 'Rate-Limit-Total'
    },
    max: 100,
    disableHeader: false,
    whitelist: (ctx) => {
      // some logic that returns a boolean
    },
    blacklist: (ctx) => {
      // some logic that returns a boolean
    }
  }))
  .use(session(sessionConfig, app))
  .use(compress(compressConfig()))
  .use(error(errorConfig()))
  .use(koaSwagger(swaggerConfig())) // swagger-ui at /docs
  .use(koaCash(koaCashConfig()))
  .use(etag()) // required for koa-cash to propertly set 304
  .use(cors({
    origin: async (req) => {
      if (req.header.origin && origins.includes(req.header.origin)) return req.header.origin
    },
    credentials: true,
    headers: ['Content-Type', 'Authorization']
  }))

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
app.use(apiRouter.routes())

app.use(authRoutes(provider).routes(), authRoutes(provider).allowedMethods({ throw: true }))
app.use(mount('/', provider.app))
app.use(mount('/api/v3/stream', stream)) // TODO: put this in the API
app.use(mount('/api/v3/user', user)) // TODO: put this in the API

// These are the views needed for the authentication
render(app, {
  cache: false,
  viewExt: 'ejs',
  layout: '_layout',
  root: path.join(__dirname, 'auth/views')
})

module.exports = app
