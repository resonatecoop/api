const test = require('tape')
const Koa = require('koa')
const mount = require('koa-mount')
const supertest = require('supertest')
const destroyable = require('server-destroy')
const error = require('koa-json-error')
const path = require('path')
const winston = require('winston')

const profiles = require('./fixtures/profiles.js')

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'test-upload' },
  transports: [
    new winston.transports.Console({
      level: 'debug',
      format: winston.format.simple()
    }),
    new winston.transports.File({
      filename: 'error.log',
      level: 'error'
    })
  ]
})

require('dotenv-safe').config({ path: path.join(__dirname, '../.env.test.js') })

const upload = require('../lib/user/trackgroups.js')

const app = new Koa()

app.use(error(err => {
  return {
    status: err.status,
    message: err.message,
    data: null
  }
}))

app.use(async (ctx, next) => {
  try {
    ctx.profile = profiles
      .filter(({ role }) => role === 'listener')[0]
  } catch (err) {
    ctx.throw(ctx.status, err.message)
  }

  await next()
})
app.use(mount('/upload', upload))

let server
let request

test('start', t => {
  server = app.listen(5557, () => {
    logger.info('test server started')
  })
  destroyable(server)
  request = supertest(server)
  t.end()
})

test('should fail with 401:unauthorized', async t => {
  t.plan(2)

  try {
    const response = await request
      .post('/upload')
      .field('name', 'uploads')
      .attach('uploads', path.join(__dirname, './fixtures/Resonate.aiff.js'))
      .expect('Content-Type', /json/)
      .expect(401)

    t.equal(response.body.message, 'Role `listener` is not authorized to upload audio files')

    t.pass('ok')
  } catch (err) {
    t.end(err)
  }
})

test('shutdown', t => {
  server.close()
  t.end()
  process.exit(0)
})
