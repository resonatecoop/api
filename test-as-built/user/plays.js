const test = require('tape')
const Koa = require('koa')
const mount = require('koa-mount')
const supertest = require('supertest')
const destroyable = require('server-destroy')
const error = require('koa-json-error')
const path = require('path')
const winston = require('winston')

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'test-plays' },
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

require('dotenv-safe').config({ path: path.join(__dirname, '../../.env.test.js') })

const plays = require('../../lib/user/plays.js')

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
    ctx.profile = {
      id: 1,
      role: 'member'
    }
  } catch (err) {
    ctx.throw(ctx.status, err.message)
  }

  await next()
})
app.use(mount('/plays', plays))

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

test('should get play counts for period', async t => {
  t.plan(1)

  try {
    const response = await request
      .get('/plays')
      .query({
        type: 'free',
        period: 'monthly',
        from: '2019-01-01',
        to: '2019-06-01'
      })
      .expect('Content-Type', /json/)
      .expect(200)

    t.comment(`response body: ${JSON.stringify(response.body)}`)

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
