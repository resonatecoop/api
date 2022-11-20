/* eslint-disable no-unused-expressions */
/* eslint-env mocha */

const { request, expect, testArtistId, testTrackGroupId, testAccessToken, testInvalidAccessToken, testArtistUserId } = require('../../testConfig')
const { TrackGroup, Track, TrackGroupItem } = require('../../../src/db/models')

const MockAccessToken = require('../../MockAccessToken')
const ResetDB = require('../../ResetDB')

const { faker } = require('@faker-js/faker')

describe('baseline/user/trackgroups endpoint test', () => {
  ResetDB()
  MockAccessToken(testArtistUserId)
  let response = null

  it('should handle no authentication / accessToken', async () => {
    response = await request.get('/user/trackgroups')

    expect(response.status).to.eql(401)
  })

  it('should handle an invalid access token', async () => {
    response = await request.get('/user/trackgroups').set('Authorization', `Bearer ${testInvalidAccessToken}`)

    expect(response.status).to.eql(401)
  })

  it('should fail POST /user/trackgroups if title not provided', async () => {
    response = await request.post('/user/trackgroups')
      .set('Authorization', `Bearer ${testAccessToken}`)

    expect(response.status).to.eql(400)
    expect(response.body.message).to.include('Title is a required field')
  })

  it('should POST /user/trackgroups', async () => {
    const title = faker.lorem.sentence(4)
    const cover = faker.datatype.uuid()

    response = await request.post('/user/trackgroups')
      .send({ title, cover })
      .set('Authorization', `Bearer ${testAccessToken}`)

    expect(response.status).to.eql(201)

    const result = response.body.data

    expect(result.title).to.eql(title)
    expect(result.private).to.eql(true)
    expect(result.enabled).to.eql(false)
    expect(result.releaseDate).to.eql(new Date().toISOString().split('T')[0])
    expect(result.cover).to.eql(cover)

    // Clean up
    await TrackGroup.destroy({
      where: {
        id: result.id
      },
      force: true
    })
  })

  it('should PUT /user/trackgroups/:id', async () => {
    const oldTitle = faker.lorem.sentence(4)
    const oldCover = faker.datatype.uuid()
    const newTitle = faker.lorem.sentence(3)

    const trackgroup = await TrackGroup.create({
      cover: oldCover,
      title: oldTitle,
      creatorId: testArtistId
    })

    response = await request.put(`/user/trackgroups/${trackgroup.id}`)
      .send({ title: newTitle })
      .set('Authorization', `Bearer ${testAccessToken}`)

    expect(response.status).to.eql(200)
    const { data: result } = response.body

    expect(result.id).to.eql(trackgroup.id)
    expect(result.creatorId).to.eql(testArtistId)
    expect(result.title).to.eql(newTitle)
    expect(result.cover).to.eql(oldCover)

    await trackgroup.destroy({ force: true })
  })

  it('should GET /user/trackgroups', async () => {
    response = await request.get('/user/trackgroups').set('Authorization', `Bearer ${testAccessToken}`)

    expect(response.status).to.eql(200)

    const attributes = response.body
    expect(attributes).to.be.an('object')
    expect(attributes).to.include.keys('data', 'count', 'numberOfPages', 'status')

    expect(attributes.data).to.be.an('array')
    expect(attributes.data.length).to.eql(3)

    expect(attributes.count).to.eql(3)
    expect(attributes.numberOfPages).to.eql(1)
    expect(attributes.status).to.eql('ok')
  })

  it('should GET /user/trackgroups/:id', async () => {
    response = await request.get(`/user/trackgroups/${testTrackGroupId}`).set('Authorization', `Bearer ${testAccessToken}`)

    expect(response.status).to.eql(200)

    const attributes = response.body
    expect(attributes).to.be.an('object')
    expect(attributes).to.include.keys('data', 'status')

    expect(attributes.data).to.be.an('object')

    const theData = attributes.data
    expect(theData).to.include.keys('about', 'creator', 'creatorId', 'uri', 'cover_metadata', 'display_artist', 'download', 'id', 'items', 'images', 'private', 'releaseDate', 'slug', 'tags', 'title', 'type')
    expect(theData.about).to.eql('this is the best album')

    const theCoverMetatdata = theData.cover_metadata
    expect(theCoverMetatdata).to.be.null

    expect(theData.display_artist).to.eql('Jack')

    const theUser = theData.creator
    expect(theUser).to.be.an('object')

    expect(theData.download).to.be.false
    expect(theData.id).to.eql('84322e4f-0247-427f-8bed-e7617c3df5ad')

    const theItems = theData.items
    expect(theItems).to.be.an('array')
    expect(theItems.length).to.eql(10)

    const theItem = theItems[0]
    expect(theItem).to.be.an('object')
    expect(theItem).to.include.keys('index', 'track')
    expect(theItem.index).to.eql(0)

    const theTrack = theItem.track
    expect(theTrack).to.be.an('object')
    expect(theTrack).to.include.keys('id', 'title', 'status', 'creatorId', 'artist', 'images', 'url', 'trackGroup', 'trackGroupId')
    expect(theTrack.id).to.eql('44a28752-1101-4e0d-8c40-2c36dc82d035')
    expect(theTrack.title).to.eql('Ergonomic interactive concept')
    expect(theTrack.status).to.eql('free')
    expect(theTrack.trackGroup.title).to.eql('Best album ever')
    expect(theTrack.creatorId).to.eql('49d2ac44-7f20-4a47-9cf5-3ea5d6ef78f6')
    expect(theTrack.artist).to.eql('Laurie Yost')

    //  images for the track
    let theImages = theTrack.images
    expect(theImages).to.be.empty

    expect(theTrack.url).to.include('user/stream/44a28752-1101-4e0d-8c40-2c36dc82d035')

    // images for the trackgroups
    theImages = theData.images
    expect(theImages).to.include.keys('small', 'medium', 'large')
    expect(theImages.small).to.be.an('object')
    expect(theImages.small).to.include.keys('width', 'height')
    expect(theImages.small.width).to.eql(120)
    expect(theImages.small.height).to.eql(120)
    expect(theImages.medium).to.be.an('object')
    expect(theImages.medium).to.include.keys('width', 'height')
    expect(theImages.medium.width).to.eql(600)
    expect(theImages.medium.height).to.eql(600)
    expect(theImages.large).to.be.an('object')
    expect(theImages.large).to.include.keys('width', 'height')
    expect(theImages.large.width).to.eql(1500)
    expect(theImages.large.height).to.eql(1500)

    expect(theData.private).to.be.false
    expect(theData.releaseDate).to.eql('2019-01-01')
    expect(theData.slug).to.eql('best-album-ever')

    expect(theData.tags).to.be.an('array')
    expect(theData.tags.length).to.eql(0)

    expect(theData.title).to.eql('Best album ever')
    expect(theData.type).to.eql('lp')

    expect(attributes.status).to.eql('ok')
  })

  it('should PUT /user/trackgroups/:id/items/add', async () => {
    const trackgroup = await TrackGroup.create({
      cover: faker.datatype.uuid(),
      title: faker.lorem.sentence(4),
      creatorId: testArtistId
    })

    const track = await Track.create({
      creatorId: testArtistId
    })

    response = await request.put(`/user/trackgroups/${trackgroup.id}/items/add`)
      .send({
        tracks: [{
          trackId: track.id,
          index: 1
        }]
      })
      .set('Authorization', `Bearer ${testAccessToken}`)

    expect(response.status).to.eql(200)

    const { data } = response.body

    expect(data.length).to.eql(1)
    expect(data[0].trackgroupId).to.eql(trackgroup.id)
    expect(data[0].trackId).to.eql(track.id)
    expect(data[0].track.id).to.eql(track.id)
    expect(data[0].track.status).to.eql('hidden')

    await trackgroup.destroy({ force: true })
    await track.destroy({ force: true })
    await TrackGroupItem.destroy({
      where: {
        id: data[0].id
      },
      force: true
    })
  })

  it('should PUT /user/trackgroups/:id/items/remove', async () => {
    const trackgroup = await TrackGroup.create({
      cover: faker.datatype.uuid(),
      title: faker.lorem.sentence(4),
      creatorId: testArtistId
    })

    const track = await Track.create({
      creatorId: testArtistId
    })

    const trackgroupItem = await TrackGroupItem.create({
      trackId: track.id,
      trackgroupId: trackgroup.id,
      index: 0
    })

    response = await request.put(`/user/trackgroups/${trackgroup.id}/items/remove`)
      .send({
        tracks: [{ trackId: track.id }]
      })
      .set('Authorization', `Bearer ${testAccessToken}`)

    const { data } = response.body

    expect(response.status).to.eql(200)
    expect(data.length).to.eql(0)
    await trackgroupItem.reload({ paranoid: false })
    expect(trackgroupItem.deletedAt).to.be.not.null

    await trackgroup.destroy({ force: true })
    await track.destroy({ force: true })
    await trackgroupItem.destroy({
      force: true
    })
  })

  it('should PUT /users/trackgroups/:id/items', async () => {
    const trackgroup = await TrackGroup.create({
      cover: faker.datatype.uuid(),
      title: faker.lorem.sentence(4),
      creatorId: testArtistId
    })

    const track = await Track.create({
      creatorId: testArtistId
    })

    response = await request.put(`/user/trackgroups/${trackgroup.id}/items`)
      .send({
        tracks: [{
          trackId: track.id,
          index: 2
        }]
      })
      .set('Authorization', `Bearer ${testAccessToken}`)

    expect(response.status).to.eql(200)

    const { data } = response.body

    expect(data[0].index).to.eql(2)
    expect(data[0].trackgroupId).to.eql(trackgroup.id)
    expect(data[0].trackId).to.eql(track.id)
    expect(data.length).to.eql(1)

    await trackgroup.destroy({ force: true })
    await track.destroy({ force: true })
    await TrackGroupItem.destroy({
      where: {
        id: data[0].id
      },
      force: true
    })
  })

  it('should DELETE /user/trackgroups/:id', async () => {
    const oldTitle = faker.lorem.sentence(4)
    const oldCover = faker.datatype.uuid()

    const trackgroup = await TrackGroup.create({
      cover: oldCover,
      title: oldTitle,
      creatorId: testArtistUserId
    })

    response = await request.delete(`/user/trackgroups/${trackgroup.id}`).set('Authorization', `Bearer ${testAccessToken}`)

    expect(response.status).to.eql(200)
    expect(response.body.message).to.eql('Trackgroup was removed')

    const newTrackgroupSearch = await TrackGroup.findOne({
      where: {
        id: trackgroup.id
      }
    })

    expect(newTrackgroupSearch).to.eql(null)

    const paranoidSearch = await TrackGroup.findOne({
      where: {
        id: trackgroup.id
      },
      paranoid: false
    })

    expect(paranoidSearch).to.not.eql(null)
    expect(paranoidSearch.deletedAt).to.not.eql(null)

    paranoidSearch.destroy({
      force: true
    })
  })
})
