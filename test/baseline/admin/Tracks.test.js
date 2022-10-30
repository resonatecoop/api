/* eslint-disable no-unused-expressions */
/* eslint-env mocha */
const { Track } = require('../../../src/db/models')

const { request, expect, testUserId, testArtistId, testTrackId, testAdminUserId, testAccessToken, testInvalidAccessToken } = require('../../testConfig')
const MockAccessToken = require('../../MockAccessToken')
const ResetDB = require('../../ResetDB')
const { faker } = require('@faker-js/faker')

describe('Admin.ts/tracks endpoint test', () => {
  let response = null

  ResetDB()

  describe('Non Authorized', () => {
    MockAccessToken(testUserId)

    it('should handle no authentication', async () => {
      response = await request.get('/user/admin/tracks/')

      expect(response.status).to.eql(401)
    })
    it('should handle an invalid access token', async () => {
      response = await request.get('/user/admin/tracks/')
        .set('Authorization', `Bearer ${testInvalidAccessToken}`)

      expect(response.status).to.eql(401)
    })

    it('should reject access token for non-admin user', async () => {
      response = await request.get('/user/admin/tracks/')
        .set('Authorization', `Bearer ${testAccessToken}`)

      expect(response.status).to.eql(401)
    })
  })
  describe('Admin Users', () => {
    MockAccessToken(testAdminUserId)

    it('should GET /user/admin/tracks', async () => {
      const tracks = await Track.findAll()
      response = await request.get('/user/admin/tracks/').set('Authorization', `Bearer ${testAccessToken}`)

      expect(response.status).to.eql(200)

      const { data } = response.body
      // FIXME: what's a thorough test of this?
      expect(data.length).to.not.eql(0)
      expect(response.body.count).to.eql(tracks.length)
    })
    it('should GET /user/admin/tracks/:id', async () => {
      response = await request.get(`/user/admin/tracks/${testTrackId}`).set('Authorization', `Bearer ${testAccessToken}`)

      // FIXME: what's a thorough test of this?
      expect(response.status).to.eql(200)
    })
    it('should PUT /user/admin/tracks/:id', async () => {
      const title = faker.animal.cat()
      const newTitle = faker.animal.dog()
      const track = await Track.create({
        title,
        creatorId: testArtistId,
        status: 'paid'
      })

      response = await request.put(`/user/admin/tracks/${track.id}`)
        .send({ title: newTitle })
        .set('Authorization', `Bearer ${testAccessToken}`)

      expect(response.status).to.eql(201)
      expect(response.body.data.title).to.eql(newTitle)
      track.destroy({ force: true })
    })
  })
})
