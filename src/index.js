const dotenv = require('dotenv-safe')
dotenv.config()

const Koa = require('koa')
const logger = require('koa-logger')
const compress = require('koa-compress')
const error = require('koa-json-error')
const mount = require('koa-mount')
const etag = require('koa-etag')
const serve = require('koa-static')
const path = require('path')
const send = require('koa-send')
const Pug = require('koa-pug')

const session = require('koa-session')
const koaCash = require('koa-cash')
const { koaSwagger } = require('koa2-swagger-ui')
const cors = require('@koa/cors')
const ratelimit = require('koa-ratelimit')
const Redis = require('ioredis')
const flash = require('koa-flash')

const KeyGrip = require('keygrip')

const swaggerConfig = require('./config/swagger')
const koaCashConfig = require('./config/cache')
const errorConfig = require('./config/error')
const compressConfig = require('./config/compression')
const sessionConfig = require('./config/session')
const corsConfig = require('./config/cors')

/**
 * Koa apps
 */

const user = require('./controllers/user/index')
const { provider, routes: authRoutes } = require('./auth/index')
const apiRouter = require('./controllers')

const stream = require('./controllers/stream/index')
const Router = require('@koa/router')

const BASE_DATA_DIR = process.env.BASE_DATA_DIR || '/'

const app = new Koa({
  keys: new KeyGrip([process.env.APP_KEY, process.env.APP_KEY_2], 'sha256'),
  proxy: true
})

app
  .use(cors(corsConfig))
  .use(error(errorConfig()))
  .use(logger())
  .use(ratelimit({
    db: new Redis({
      port: process.env.REDIS_PORT || 6379,
      host: process.env.REDIS_HOST || '127.0.0.1',
      password: process.env.REDIS_PASSWORD
    }),
    duration: 60000,
    errorMessage: 'API is rate limited',
    id: (ctx) => ctx.ip,
    headers: {
      remaining: 'Rate-Limit-Remaining',
      reset: 'Rate-Limit-Reset',
      total: 'Rate-Limit-Total'
    },
    max: 100,
    disableHeader: false,
    whitelist: (ctx) => {
      return process.env.NODE_ENV !== 'production'
      // some logic that returns a boolean
    },
    blacklist: (ctx) => {
      // some logic that returns a boolean
    }
  }))
  .use(session(sessionConfig, app))
  .use(flash())
  .use(compress(compressConfig()))
  .use(koaSwagger(swaggerConfig())) // swagger-ui at /docs
  .use(koaCash(koaCashConfig()))
  .use(etag()) // required for koa-cash to propertly set 304

app.use(apiRouter.routes())

app.use(authRoutes(provider).routes(), authRoutes(provider).allowedMethods({ throw: true }))
app.use(mount('/', provider.app))
app.use(mount('/api/v3/stream', stream)) // TODO: put this in the API
app.use(mount('/api/v3/user', user)) // TODO: put this in the API

// FIXME: koa-static is currently insecure and out of date.
// https://github.com/koajs/static/issues/202
app.use(mount('/public', serve(path.join(__dirname, 'auth/public'))))

// In production we will presumably use a different way to
// serve static files
if (process.env.NODE_ENV !== 'production') {
  const staticRouter = new Router()
  staticRouter.get('/images/:filename', async (ctx, next) => {
    try {
      const filename = ctx.request.params.filename
      ctx.set({
        'Content-Type': `images/${filename.split('.')[1]}`,
        'Content-Disposition': `inline; filename=${filename}`,
        'X-Accel-Redirect': `/images/${filename}` // internal redirect
      })
      await send(ctx, filename, { root: path.join(BASE_DATA_DIR, '/data/media/images') })
    } catch (e) {
      console.error('e', e)
    }
    await next()
  })
  app.use(staticRouter.routes())
}

const pug = new Pug({ // eslint-disable-line no-unused-vars
  viewPath: path.resolve(__dirname, './auth/views'),
  locals: { /* variables and helpers */ },
  // basedir: 'path/for/pug/extends',
  helperPath: [
    // 'path/to/pug/helpers',
    // { random: 'path/to/lib/random.js' },
    { _: require('lodash') }
  ],
  app: app // Binding `ctx.render()`, equals to pug.use(app)
})

module.exports = app
