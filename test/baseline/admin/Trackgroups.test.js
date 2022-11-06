/* eslint-disable no-unused-expressions */
/* eslint-env mocha */
const { faker } = require('@faker-js/faker')
const { TrackGroup } = require('../../../src/db/models')

const { request, expect, testUserId, testArtistId, testTrackGroupId, testAccessToken, testInvalidAccessToken, testAdminUserId } = require('../../testConfig')
const MockAccessToken = require('../../MockAccessToken')
const ResetDB = require('../../ResetDB')

describe('Admin.ts/trackgroups endpoint test', () => {
  let response = null
  ResetDB()

  describe('Non Authorized', () => {
    MockAccessToken(testUserId)

    it('should handle no authentication / accessToken', async () => {
      response = await request.get('/user/admin/trackgroups/')

      expect(response.status).to.eql(401)
    })
    it('should handle an invalid access token', async () => {
      response = await request.get('/user/admin/trackgroups/').set('Authorization', `Bearer ${testInvalidAccessToken}`)

      console.log('trackgroups response.status: ', response.status)
      // FIXME: status should be 401, but I'll take a 403. Close enough.
      expect(response.status).to.eql(401)
    })
    it('should reject access token for non-admin user', async () => {
      response = await request.get('/user/admin/users/')
        .set('Authorization', `Bearer ${testAccessToken}`)

      expect(response.status).to.eql(401)
    })
  })

  describe('Admin Trackgroups', () => {
    MockAccessToken(testAdminUserId)

    it('should GET /user/admin/trackgroups', async () => {
      response = await request.get('/user/admin/trackgroups/')
        .set('Authorization', `Bearer ${testAccessToken}`)
      console.log('response.body', response.body)

      expect(response.status).to.eql(200)
      const attributes = response.body
      expect(attributes).to.be.an('object')
      expect(attributes).to.include.keys('data', 'count', 'numberOfPages', 'status')

      expect(attributes.data).to.be.an('array')
      expect(attributes.data.length).to.eql(3)

      const theData = attributes.data[0]
      expect(theData).to.include.keys('id', 'title', 'type', 'about', 'private', 'display_artist', 'composers', 'performers', 'release_date', 'enabled', 'cover_metadata', 'tags', 'images')
      expect(theData.id).to.eql('84322e4f-0247-427f-8bed-e7617c3df5ad')
      expect(theData.title).to.eql('Best album ever')
      expect(theData.type).to.eql('lp')
      expect(theData.about).to.eql('this is the best album')
      expect(theData.private).to.be.false
      expect(theData.display_artist).to.eql('Jack')

      expect(theData.release_date).to.eql('2019-01-01')
      expect(theData.enabled).to.be.true
      expect(theData.cover_metadata).to.be.null

      expect(theData.tags).to.be.an('array')
      expect(theData.tags.length).to.eql(0)

      expect(theData.images).to.be.an('object')

      expect(attributes.count).to.eql(3)
      expect(attributes.numberOfPages).to.eql(1)
      expect(attributes.status).to.eql('ok')
    })
    it('should get trackgroup by id', async () => {
      response = await request.get(`/user/admin/trackgroups/${testTrackGroupId}`).set('Authorization', `Bearer ${testAccessToken}`)

      expect(response.status).to.eql(200)

      const attributes = response.body
      expect(attributes).to.be.an('object')
      expect(attributes).to.include.keys('data', 'status')

      expect(attributes.data).to.be.an('object')
      const theData = attributes.data
      expect(theData).to.include.keys('composers', 'performers', 'tags', 'id', 'title', 'slug', 'type', 'about', 'private', 'display_artist', 'creatorId', 'release_date', 'download', 'featured', 'enabled', 'updatedAt', 'createdAt', 'deletedAt', 'cover_metadata', 'items', 'images')

      expect(theData.composers).to.be.an('array')
      expect(theData.composers.length).to.eql(0)

      expect(theData.performers).to.be.an('array')
      expect(theData.performers.length).to.eql(0)

      expect(theData.tags).to.be.an('array')
      expect(theData.tags.length).to.eql(0)

      expect(theData.id).to.eql('84322e4f-0247-427f-8bed-e7617c3df5ad')
      expect(theData.title).to.eql('Best album ever')
      expect(theData.slug).to.eql('best-album-ever')
      expect(theData.type).to.eql('lp')
      expect(theData.about).to.eql('this is the best album')
      expect(theData.private).to.be.false
      expect(theData.display_artist).to.eql('Jack')
      expect(theData.creatorId).to.eql('49d2ac44-7f20-4a47-9cf5-3ea5d6ef78f6')
      expect(theData.release_date).to.eql('2019-01-01')
      expect(theData.download).to.be.false
      expect(theData.featured).to.be.false
      expect(theData.enabled).to.be.true
      expect(theData.updatedAt).to.eql('2022-09-29T13:07:07.237Z')
      expect(theData.createdAt).to.eql('2022-09-28T17:31:59.513Z')
      expect(theData.deletedAt).to.be.null

      expect(theData.cover_metadata).to.be.an('object')

      expect(theData.items).to.be.an('array')
      expect(theData.items.length).to.eql(10)

      const theItem = theData.items[0]
      expect(theItem).to.be.an('object')
      expect(theItem).to.include.keys('id', 'index', 'track')
      expect(theItem.id).to.eql('753eccd9-01b2-4bfb-8acc-8d0e44b998cc')
      expect(theItem.index).to.eql(0)

      const theTrack = theItem.track
      expect(theTrack).to.be.an('object')
      expect(theTrack).to.include.keys('status', 'id', 'title', 'cover_art', 'album', 'artist', 'composer', 'year', 'audiofile')
      expect(theTrack.status).to.eql('free')
      expect(theTrack.id).to.eql('44a28752-1101-4e0d-8c40-2c36dc82d035')
      expect(theTrack.title).to.eql('Ergonomic interactive concept')
      expect(theTrack.cover_art).to.be.null
      expect(theTrack.album).to.eql('firewall')
      expect(theTrack.artist).to.eql('Laurie Yost')
      expect(theTrack.composer).to.be.null
      expect(theTrack.year).to.be.null
      expect(theTrack.audiofile).to.be.null

      expect(theData.images).to.include.keys('small', 'medium')
      expect(theData.images.small).to.be.an('object')
      expect(theData.images.small).to.include.keys('width', 'height')
      expect(theData.images.small.width).to.eql(120)
      expect(theData.images.small.height).to.eql(120)
      expect(theData.images.medium).to.be.an('object')
      expect(theData.images.medium).to.include.keys('width', 'height')
      expect(theData.images.medium.width).to.eql(600)
      expect(theData.images.medium.height).to.eql(600)

      expect(attributes.status).to.eql('ok')
    })
    it('should PUT /user/admin/trackgroups/:id', async () => {
      const oldTitle = faker.lorem.sentence(4)
      const oldCover = faker.datatype.uuid()
      const newTitle = faker.lorem.sentence(3)

      const trackgroup = await TrackGroup.create({
        cover: oldCover,
        title: oldTitle,
        creatorId: testArtistId
      })

      response = await request.put(`/user/admin/trackgroups/${trackgroup.id}`)
        .send({ title: newTitle })
        .set('Authorization', `Bearer ${testAccessToken}`)

      expect(response.status).to.eql(200)
      const { data } = response.body
      expect(data.id).to.eql(trackgroup.id)
      expect(data.title).to.eql(newTitle)

      trackgroup.destroy({ force: true })
    })
  })
})
