const test = require('tape')
const Koa = require('koa')
const supertest = require('supertest')
const destroyable = require('server-destroy')
const error = require('koa-json-error')
const path = require('path')
const koaCash = require('koa-cash')
const koaCashConfig = require('../lib/config/cache.js')

require('dotenv-safe').config({ path: path.join(__dirname, '../.env.test.js') })

const trackgroups = require('../lib/users.js')

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

test('should fetch user playlists', async t => {
  t.plan(1)

  try {
    await request
      .get('/users/12788/playlists')
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
