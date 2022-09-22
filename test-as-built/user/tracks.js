const test = require('tape')
const Koa = require('koa')
const mount = require('koa-mount')
const supertest = require('supertest')
const destroyable = require('server-destroy')
const error = require('koa-json-error')
const path = require('path')

require('dotenv-safe').config({ path: path.join(__dirname, '../../.env.test.js') })

const tracks = require('../../lib/user/tracks.js')

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
      id: 2124,
      role: 'member'
    }
  } catch (err) {
    ctx.throw(ctx.status, err.message)
  }

  await next()
})

app.use(mount('/tracks', tracks))

let server
let request
let id

test('start', t => {
  server = app.listen(5557)
  destroyable(server)
  request = supertest(server)
  t.end()
})

test('should save a track', async t => {
  t.plan(1)

  try {
    const response = await request
      .post('/tracks')
      .send({
        title: 'Best track',
        artist: '@auggod',
        album_title: 'Unreleased',
        status: 'paid',
        year: 2019
      })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(201)

    id = response.body.data.id

    t.pass('ok')
  } catch (err) {
    t.end(err)
  }
})

test('should find tracks', async t => {
  t.plan(1)

  try {
    const response = await request
      .get('/tracks')
      .expect('Content-Type', /json/)
      .expect(200)

    t.ok(response.body.data.length)
  } catch (err) {
    t.end(err)
  }
})

test('should find a track', async t => {
  t.plan(1)

  try {
    await request
      .get(`/tracks/${id}`)
      .expect('Content-Type', /json/)
      .expect(200)

    t.pass('ok')
  } catch (err) {
    t.end(err)
  }
})

test('should delete a track', async t => {
  t.plan(1)

  try {
    await request
      .delete(`/tracks/${id}`)
      .expect('Content-Type', /json/)
      .expect(200)

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
