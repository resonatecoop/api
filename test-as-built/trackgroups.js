const test = require('tape')
const Koa = require('koa')
const supertest = require('supertest')
const destroyable = require('server-destroy')
const error = require('koa-json-error')
const koaCash = require('koa-cash')
// const koaCashConfig = require('../lib/config/cache.js')
const koaCashConfig = require('../src/config/cache.js')

// require('dotenv-safe').config({ path: path.join(__dirname, '../.env.test.js') })

// const trackgroups = require('../lib/trackgroups.js')
const trackgroups = require('./trackgroups.js')

const app = new Koa()

app
  .use(koaCash(koaCashConfig('development')))
  .use(error(err => {
    return {
      status: err.status,
      message: err.message,
      data: null
    }
  }))
  .use(trackgroups.routes())

let server
let request

test('start', t => {
  server = app.listen(5557)
  destroyable(server)
  request = supertest(server)
  t.end()
})

let uuid

test('should fetch trackgroups', async t => {
  t.plan(1)

  try {
    const response = await request
      .get('/trackgroups')
      .query({
        page: 2,
        limit: 20,
        order: 'newest',
        type: 'lp'
      })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)

    uuid = response.body.data[0].id

    t.pass()
  } catch (err) {
    t.end(err)
  }
})

test('should fetch one trackgroup', async t => {
  t.plan(1)

  try {
    await request
      .get(`/trackgroups/${uuid}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)

    t.pass()
  } catch (err) {
    t.end(err)
  }
})

test('shutdown', t => {
  server.close()
  t.end()
  process.exit(0)
})
