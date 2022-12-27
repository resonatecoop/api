import dotenv from 'dotenv-safe'

import Koa from 'koa'
import logger from 'koa-logger'
import compress from 'koa-compress'
import error from 'koa-json-error'
import mount from 'koa-mount'
import etag from 'koa-etag'
import serve from 'koa-static'
import path from 'path'
import send from 'koa-send'
import Pug from 'koa-pug'
import session from 'koa-session'
import koaCash from 'koa-cash'
import { koaSwagger } from 'koa2-swagger-ui'
import cors from '@koa/cors'
import ratelimit from 'koa-ratelimit'
import Redis from 'ioredis'
import KeyGrip from 'keygrip'
import _ from 'lodash'
import swaggerConfig from './config/swagger.js'
import koaCashConfig from './config/cache.js'
import errorConfig from './config/error.js'
import compressConfig from './config/compression.js'
import sessionConfig from './config/session.js'
import corsConfig from './config/cors.js'
import fs from 'fs'
import Router from '@koa/router'

/**
 * Koa apps
 */
import { provider, routes as authRoutes } from './auth/index.js'
import { apiRouter } from './controllers/index.mjs'
import { apiRoot } from './constants.js'
import stream from './controllers/stream/audio.{id}.{segment}.mjs'
import { REDIS_CONFIG } from './config/redis.js'
dotenv.config()

const BASE_DATA_DIR = process.env.BASE_DATA_DIR || '/'
const dirname = new URL('.', import.meta.url).pathname

const app = new Koa({
  keys: new KeyGrip([process.env.APP_KEY, process.env.APP_KEY_2], 'sha256'),
  proxy: true
})

app
  .use(cors(corsConfig))
  .use(error(errorConfig()))
  .use(logger())
  .use(ratelimit({
    db: new Redis(REDIS_CONFIG),
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
  .use(compress(compressConfig()))
  .use(koaSwagger(swaggerConfig())) // swagger-ui at /docs
  .use(etag()) // required for koa-cash to propertly set 304

if (process.env.NODE_ENV !== 'test') {
  app.use(koaCash(koaCashConfig()))
}

app.use(apiRouter.routes())

app.use(authRoutes(provider).routes(), authRoutes(provider).allowedMethods({ throw: true }))
app.use(mount('/', provider.app))
app.use(mount(`${apiRoot}/stream`, stream)) // TODO: put this in the API

// FIXME: koa-static is currently insecure and out of date.
// https://github.com/koajs/static/issues/202
app.use(mount('/public', serve(path.join(dirname, 'auth/public'))))

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
      // console.error('e', e)
      ctx.throw(404, e)
    }
    await next()
  })

  staticRouter.get('/audio/:filename', async (ctx, next) => {
    try {
      const filename = ctx.request.params.filename
      // This is a hack for now
      ctx.body = fs.createReadStream(path.join(BASE_DATA_DIR, '/data/media/audio', filename))
      next()
    } catch (e) {
      // console.error('e', e)
      ctx.throw(500, e)
    }
    // await next()
  })
  app.use(staticRouter.routes())
}

const pug = new Pug({ // eslint-disable-line no-unused-vars
  viewPath: path.resolve(dirname, './auth/views'),
  locals: { /* variables and helpers */ },
  // basedir: 'path/for/pug/extends',
  helperPath: [
    // 'path/to/pug/helpers',
    // { random: 'path/to/lib/random.js' },
    { _: _ }
  ],
  app: app // Binding `ctx.render()`, equals to pug.use(app)
})

export default app
