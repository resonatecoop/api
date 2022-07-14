const dotenv = require('dotenv-safe')
dotenv.config()

const Koa = require('koa')
const logger = require('koa-logger')
const compress = require('koa-compress')
const error = require('koa-json-error')
const mount = require('koa-mount')
const etag = require('koa-etag')
const session = require('koa-session')
const koaCash = require('koa-cash')
const { koaSwagger } = require('koa2-swagger-ui')
const cors = require('@koa/cors')

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
const trackgroups = require('./trackgroups/index')
const tracks = require('./tracks/index')
const artists = require('./artists/index')
const users = require('./users/index')
const labels = require('./labels/index')
const search = require('./search/index')
const tag = require('./tag/index')
const resolve = require('./resolve/index')
const stream = require('./stream/index')

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

app
  .use(logger())
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

app.use(artists.routes())
app.use(labels.routes())
app.use(resolve.routes())
app.use(search.routes())
app.use(tag.routes())
app.use(trackgroups.routes())
app.use(tracks.routes())
app.use(users.routes())
app.use(mount('/stream', stream))
app.use(mount('/user', user))

module.exports = app
