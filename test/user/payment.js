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
  defaultMeta: { service: 'test-payment' },
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

const payment = require('../../lib/user/payment.js')

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
      email: 'test@example.com',
      role: 'listener'
    }
  } catch (err) {
    ctx.throw(ctx.status, err.message)
  }

  await next()
})

app.use(payment.routes())

let server
let request

let pid // payment intent id

test('start', t => {
  server = app.listen(5557, () => {
    logger.info('test server started')
  })
  destroyable(server)
  request = supertest(server)
  t.end()
})

test('create payment intent with invalid amount', async t => {
  t.plan(1)

  try {
    await request
      .post('/payment/intent/create')
      .send({
        currency: 'eur',
        amount: 0
      })
      .expect('Content-Type', /json/)
      .expect(400)

    t.pass('ok')
  } catch (err) {
    t.end(err)
  }
})

test('create payment intent with invalid currency', async t => {
  t.plan(1)

  try {
    await request
      .post('/payment/intent/create')
      .send({
        currency: 'rub',
        amount: 4088
      })
      .expect('Content-Type', /json/)
      .expect(400)

    t.pass('ok')
  } catch (err) {
    t.end(err)
  }
})

test('create payment intent', async t => {
  t.plan(1)

  try {
    const response = await request
      .post('/payment/intent/create')
      .send({
        currency: 'eur',
        amount: 4088 // 5 €
      })
      .expect('Content-Type', /json/)
      .expect(201)

    pid = response.body.data.transaction_id

    t.comment(`response body: ${JSON.stringify(response.body)}`)

    t.pass('ok')
  } catch (err) {
    t.end(err)
  }
})

test('confirm payment intent', async t => {
  t.plan(1)

  try {
    const response = await request
      .post('/payment/intent/confirm')
      .send({
        transaction_id: pid,
        payment_method: 'pm_card_visa'
      })
      .expect('Content-Type', /json/)
      .expect(200)

    t.comment(`response body: ${JSON.stringify(response.body)}`)

    t.pass('ok')
  } catch (err) {
    t.end(err)
  }
})

test('capture payment intent', async t => {
  t.plan(1)

  try {
    const response = await request
      .post('/payment/intent/capture')
      .send({
        transaction_id: pid
      })
      .expect('Content-Type', /json/)
      .expect(200)

    t.comment(`response body: ${JSON.stringify(response.body)}`)

    t.pass('ok')
  } catch (err) {
    t.end(err)
  }
})

test('create payment intent in usd', async t => {
  t.plan(1)

  try {
    const response = await request
      .post('/payment/intent/create')
      .send({
        currency: 'usd',
        amount: 4088 // 5 €
      })
      .expect('Content-Type', /json/)
      .expect(201)

    pid = response.body.data.transaction_id

    t.comment(`response body: ${JSON.stringify(response.body)}`)

    t.pass('ok')
  } catch (err) {
    t.end(err)
  }
})

test('cancel payment intent', async t => {
  t.plan(1)

  try {
    const response = await request
      .post('/payment/intent/cancel')
      .send({
        transaction_id: pid
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
  logger.info('test server closed')
  t.end()
  process.exit(0)
})
