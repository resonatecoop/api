const test = require('tape')
const Koa = require('koa')
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

const play = require('../../lib/user/plays.js')

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
      id: '052b4c24-3255-4f3b-82bf-ff43f88616f3',
      legacy_id: 2124,
      email: 'hello@auggod.tech',
      role: 'listener'
    }
  } catch (err) {
    ctx.throw(ctx.status, err.message)
  }

  await next()
})

app.use(play.routes())

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

test('play', async t => {
  t.plan(1)

  try {
    const response = await request
      .post('/plays')
      .send({
        track_id: 144
      })
      .expect('Content-Type', /json/)
      .expect(200)

    t.comment(`response body: ${JSON.stringify(response.body)}`)

    t.pass('ok')
  } catch (err) {
    console.log(err.message)
    t.end(err)
  }
})

test('shutdown', t => {
  server.close()
  logger.info('test server closed')
  t.end()
  process.exit(0)
})
