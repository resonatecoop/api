/* eslint-disable no-unused-expressions */
/* eslint-env mocha */

const { request, expect, testAccessToken, testInvalidAccessToken, testArtistId, testUserId, testAdminUserId, testArtistUserId } = require('../../testConfig')
const MockAccessToken = require('../../MockAccessToken')
const { Track, Play, TrackGroup, TrackGroupItem } = require('../../../src/db/models')
const ResetDB = require('../../ResetDB')
const { faker } = require('@faker-js/faker')

describe('user/admin/plays endpoint test', () => {
  let response = null
  ResetDB()

  describe('Non Authorized', () => {
    MockAccessToken(testUserId)

    it('should handle no authentication', async () => {
      response = await request.get('/user/admin/plays')
        .query({ creatorId: testArtistUserId })

      expect(response.status).to.eql(401)
    })
    it('should handle an invalid access token', async () => {
      response = await request.get('/user/admin/plays')
        .query({ creatorId: testArtistUserId })
        .set('Authorization', `Bearer ${testInvalidAccessToken}`)

      expect(response.status).to.eql(401)
    })

    it('should reject access token for non-admin user', async () => {
      response = await request.get('/user/admin/plays')
        .query({ creatorId: testArtistUserId })
        .set('Authorization', `Bearer ${testAccessToken}`)

      expect(response.status).to.eql(401)
    })
  })
  describe('Authorized', () => {
    MockAccessToken(testAdminUserId)

    it('should GET /user/admin/plays', async () => {
      const track = await Track.create({
        title: faker.animal.cat(),
        creatorId: testArtistId,
        status: 'paid'
      })
      const track2 = await Track.create({
        title: faker.animal.dog(),
        creatorId: testArtistId,
        status: 'paid'
      })
      const trackgroup = await TrackGroup.create({
        title: faker.animal.fish(),
        creatorId: testArtistId,
        cover: faker.datatype.uuid(),
        type: 'single',
        enabled: true,
        private: false
      })
      const tgi = await TrackGroupItem.create({
        trackgroupId: trackgroup.id,
        track_id: track.id,
        index: 1
      })

      const longAgoDate = faker.date.past()

      const play = await Play.create({
        userId: testUserId,
        trackId: track.id,
        createdAt: longAgoDate
      })
      const dateForDoubleCount = faker.date.recent()
      const play2 = await Play.create({
        userId: testUserId,
        trackId: track2.id,
        createdAt: dateForDoubleCount
      })
      const play3 = await Play.create({
        userId: testUserId,
        trackId: track2.id,
        createdAt: dateForDoubleCount
      })
      const play4 = await Play.create({
        userId: testAdminUserId,
        trackId: track2.id,
        createdAt: dateForDoubleCount
      })
      response = await request.get('/user/admin/plays')
        .query({ creatorId: testArtistId })
        .set('Authorization', `Bearer ${testAccessToken}`)

      expect(response.status).to.eql(200)
      const { data } = response.body
      expect(data[0].date).to.eql(dateForDoubleCount.toISOString().split('T')[0])
      expect(data[0].count).to.eql(3)
      expect(data[0].track.id).to.eql(track2.id)

      expect(data[1].date).to.eql(longAgoDate.toISOString().split('T')[0])
      expect(data[1].count).to.eql(1)
      expect(data[1].track.id).to.eql(track.id)

      await track.destroy({ force: true })
      await play.destroy({ force: true })
      await play2.destroy({ force: true })
      await play3.destroy({ force: true })
      await play4.destroy({ force: true })
      await trackgroup.destroy({ force: true })
      await tgi.destroy({ force: true })
    })
  })
})
