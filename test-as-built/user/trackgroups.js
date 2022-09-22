const test = require('tape')
const Koa = require('koa')
const supertest = require('supertest')
const destroyable = require('server-destroy')
const error = require('koa-json-error')
const path = require('path')

require('dotenv-safe').config({ path: path.join(__dirname, '../../.env.test.js') })

const trackgroups = require('../../lib/user/trackgroups.js')

const TEST_USER_ROLE = process.env.TEST_USER_ROLE || 'member'
const TEST_USER_ID = process.env.TEST_USER_ID || 2
const TEST_USER_EMAIL = process.env.TEST_USER_EMAIL

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
      id: TEST_USER_ID,
      role: TEST_USER_ROLE,
      email: TEST_USER_EMAIL
    }
  } catch (err) {
    ctx.throw(ctx.status, err.message)
  }

  await next()
})

app.use(trackgroups.routes())

let server
let request
let uuid

test('start', t => {
  server = app.listen(5557)
  destroyable(server)
  request = supertest(server)
  t.end()
})

test('should create and save a new release', async t => {
  t.plan(10)

  try {
    const response = await request
      .post('/trackgroups')
      .send({
        title: 'Claustro',
        display_artist: 'Burial',
        type: 'ep',
        release_date: '2019-01-02',
        cover: '13a4dedc-8b54-413c-bbd5-a96c6b99d91a',
        composers: ['Burial'],
        performers: ['Burial'],
        tags: ['techno', 'experimental'],
        about: `
          this is about the release
        `
      })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(201)

    uuid = response.body.data.id

    t.equal(response.body.data.title, 'Claustro', '`data.title` should be equal to `Claustro`')
    t.equal(response.body.data.display_artist, 'Burial', '`data.display_artist` should be equal to `Burial`')
    t.equal(response.body.data.type, 'ep', '`data.type` should be equal to `ep`')
    t.equal(response.body.data.release_date, '2019-01-02', '`data.release_date` should be equal to `2019-01-02`')
    t.equal(response.body.data.composers.length, 1, '`data.composers` should contain two items')
    t.equal(response.body.data.composers[0], 'Burial', '`data.composers` first item should be equal to `Burial`')
    t.equal(response.body.data.performers.length, 1, '`data.performers` should contain two items')
    t.equal(response.body.data.performers[0], 'Burial', '`data.performers` first item should be equal to `Burial`')
    t.equal(response.body.data.tags.length, 2, '`data.tags` should contain two items')
    t.equal(response.body.data.tags[0], 'techno', '`data.tags` first item should be equal to `techno`')
  } catch (err) {
    t.end(err)
  }
})

test('should find a release', async t => {
  t.plan(1)

  try {
    const response = await request
      .get(`/trackgroups/${uuid}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)

    t.equal(response.body.data.id, uuid, `track group id should be equal to: ${uuid}`)
  } catch (err) {
    t.end(err)
  }
})

test('should update a release', async t => {
  t.plan(1)

  try {
    const response = await request
      .put(`/trackgroups/${uuid}`)
      .send({
        title: 'Claustro',
        display_artist: 'Burial',
        type: 'ep',
        release_date: '2019-02-03',
        cover: '13a4dedc-8b54-413c-bbd5-a96c6b99d91a',
        composers: ['Burial'],
        performers: ['Burial'],
        tags: ['techno', 'experimental'],
        about: `
          this is about the release
        `
      })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)

    t.equal(response.body.data.release_date, '2019-02-03', '`data.release_date` should be equal to `2019-02-03`')
  } catch (err) {
    t.end(err)
  }
})

test('should add items', async t => {
  t.plan(1)

  try {
    const response = await request
      .put(`/trackgroups/${uuid}/items/add`)
      .send({
        tracks: [
          {
            title: 'Test track',
            track_id: 4,
            index: 1
          }
        ]
      })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)

    t.equal(response.body.data[0].track_id, 4, '`data.track_id` should be equal to `4`')
  } catch (err) {
    t.end(err)
  }
})

test('should replace items', async t => {
  t.plan(1)

  try {
    await request
      .put(`/trackgroups/${uuid}/items`)
      .send({
        tracks: [
          {
            title: 'Test track',
            track_id: 1,
            index: 1
          },
          {
            title: 'Test track 3',
            track_id: 2,
            index: 2
          },
          {
            title: 'Test track 2',
            track_id: 3,
            index: 3
          }
        ]
      })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)

    t.pass()
  } catch (err) {
    t.end(err)
  }
})

test('should remove items', async t => {
  t.plan(1)

  try {
    await request
      .put(`/trackgroups/${uuid}/items/remove`)
      .send({
        tracks: [
          {
            track_id: 2
          },
          {
            track_id: 4
          }
        ]
      })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)

    t.pass()
  } catch (err) {
    t.end(err)
  }
})

test('should update privacy', async t => {
  t.plan(1)

  try {
    await request
      .put(`/trackgroups/${uuid}/privacy`)
      .send({
        private: true
      })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)

    t.pass()
  } catch (err) {
    t.end(err)
  }
})

test('should delete release', async t => {
  t.plan(1)

  try {
    await request
      .delete(`/trackgroups/${uuid}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)

    t.pass()
  } catch (err) {
    t.end(err)
  }
})

test('should fail with bad request', async t => {
  t.plan(2)

  try {
    const response = await request
      .post('/trackgroups')
      .send({
        title: 'Claustro'
        // display_artist: 'Burial',
      })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(400)

    t.equal(response.body.data, null)
    t.equal(response.body.status, 400)
  } catch (err) {
    t.end(err)
  }
})

test('should fail with 404', async t => {
  t.plan(2)

  try {
    const response = await request
      .get(`/trackgroups/${uuid}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(404)

    t.equal(response.body.data, null)
    t.equal(response.body.status, 404)
  } catch (err) {
    t.end(err)
  }
})

test('shutdown', t => {
  server.close()
  t.end()
  process.exit(0)
})
