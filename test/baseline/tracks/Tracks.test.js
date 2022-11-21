/* eslint-disable no-unused-expressions */
/* eslint-env mocha */
const { request, expect, testUserId, testAccessToken, testArtistId, testArtistUserId } = require('../../testConfig')
const { Track, TrackGroup, TrackGroupItem, Play, Favorite } = require('../../../src/db/models')
const { faker } = require('@faker-js/faker')
const ResetDB = require('../../ResetDB')
const MockAccessToken = require('../../MockAccessToken')

describe('baseline/tracks endpoint test', () => {
  ResetDB()
  MockAccessToken(testUserId)

  let response = null

  it('should GET /tracks?order=latest', async () => {
    const displayName = 'Test test'
    const track = await Track.create({
      title: displayName,
      creatorId: testArtistId,
      status: 'paid'
    })

    const trackgroup = await TrackGroup.create({
      title: displayName + 'Album',
      creatorId: testArtistId,
      cover: faker.datatype.uuid(),
      type: 'single',
      enabled: true,
      private: false
    })

    const tgi = await TrackGroupItem.create({
      trackgroupId: trackgroup.id,
      trackId: track.id,
      index: 1
    })
    const play = await Play.create({
      userId: testUserId,
      trackId: track.id
    })
    const play2 = await Play.create({
      userId: testUserId,
      trackId: track.id
    })

    response = await request.get('/tracks?order=latest')

    expect(response.status).to.eql(200)

    const attributes = response.body
    expect(attributes).to.be.an('object')
    expect(attributes).to.include.keys('data', 'count', 'numberOfPages')

    expect(attributes.data).to.be.an('array')
    expect(attributes.data.length).to.eql(31)

    const theData = attributes.data[0]

    expect(theData).to.include.keys('id', 'title', 'trackGroup', 'creator', 'creatorId', 'artist', 'status', 'url', 'images')
    expect(theData.id).to.eql(track.id)
    expect(theData.title).to.eql(track.title)
    expect(theData.trackGroup.id).to.eql(trackgroup.id)
    expect(theData.trackGroup.cover).to.include('http')
    expect(theData.trackGroup.cover).to.include(trackgroup.cover)

    expect(theData.trackGroup.title).to.eql(trackgroup.title)
    expect(theData.creatorId).to.eql(testArtistId)
    expect(theData.creator.id).to.eql(testArtistId)

    expect(theData.artist).to.be.null
    expect(theData.status).to.eql('paid')
    expect(theData.url).to.include(`user/stream/${track.id}`)

    expect(theData.images).to.include.keys('small', 'medium')
    expect(theData.images.small).to.include.keys('width', 'height')
    expect(theData.images.small.width).to.eql(120)
    expect(theData.images.small.height).to.eql(120)
    expect(theData.images.medium).to.include.keys('width', 'height')
    expect(theData.images.medium.width).to.eql(600)
    expect(theData.images.medium.height).to.eql(600)

    expect(attributes.count).to.eql(31)
    expect(attributes.numberOfPages).to.eql(1)

    track.destroy({ force: true })
    play.destroy({ force: true })
    play2.destroy({ force: true })
    trackgroup.destroy({ force: true })
    tgi.destroy({ force: true })
  })

  it('should GET /tracks?order=latest ignore private trackgroups', async () => {
    const displayName = 'Test test'
    const track = await Track.create({
      title: displayName,
      creatorId: testArtistId,
      status: 'paid'
    })

    const trackgroup = await TrackGroup.create({
      title: displayName + 'Album',
      creatorId: testArtistId,
      cover: faker.datatype.uuid(),
      type: 'single',
      enabled: true,
      private: true
    })

    const tgi = await TrackGroupItem.create({
      trackgroupId: trackgroup.id,
      trackId: track.id,
      index: 1
    })
    const play = await Play.create({
      userId: testUserId,
      trackId: track.id
    })
    const play2 = await Play.create({
      userId: testUserId,
      trackId: track.id
    })

    response = await request.get('/tracks?order=latest')

    expect(response.status).to.eql(200)

    const attributes = response.body
    expect(attributes).to.be.an('object')
    expect(attributes).to.include.keys('data', 'count', 'numberOfPages')

    expect(attributes.data).to.be.an('array')
    expect(attributes.data.length).to.eql(30)

    const theData = attributes.data[0]

    expect(theData).to.include.keys('id', 'title', 'trackGroup', 'creator', 'creatorId', 'artist', 'status', 'url', 'images')

    for (const returnedTrack of attributes.data) {
      expect(returnedTrack.id).not.to.eql(track.id)
      expect(returnedTrack.trackGroupId).not.to.eql(trackgroup.id)
    }

    track.destroy({ force: true })
    play.destroy({ force: true })
    play2.destroy({ force: true })
    trackgroup.destroy({ force: true })
    tgi.destroy({ force: true })
  })

  it('should GET /tracks?order=plays', async () => {
    const displayName = 'Test test'
    const track = await Track.create({
      title: displayName,
      creatorId: testArtistId,
      status: 'paid'
    })

    const trackgroup = await TrackGroup.create({
      title: displayName + 'Album',
      creatorId: testArtistId,
      cover: faker.datatype.uuid(),
      type: 'single',
      enabled: true,
      private: false
    })

    const tgi = await TrackGroupItem.create({
      trackgroupId: trackgroup.id,
      trackId: track.id,
      index: 1
    })
    const play = await Play.create({
      userId: testUserId,
      trackId: track.id
    })
    const play2 = await Play.create({
      userId: testUserId,
      trackId: track.id
    })

    response = await request.get('/tracks?order=plays')

    expect(response.status).to.eql(200)

    const { data } = response.body
    expect(response.body).to.be.an('object')
    expect(response.body).to.include.keys('data', 'count', 'numberOfPages')

    expect(data).to.be.an('array')
    expect(data.length).to.eql(1)

    const theData = data[0]

    expect(theData).to.include.keys('id', 'title', 'trackGroup', 'creator', 'creatorId', 'artist', 'status', 'url', 'images')
    expect(theData.id).to.eql(track.id)
    expect(theData.title).to.eql(track.title)
    expect(theData.trackGroup.id).to.eql(trackgroup.id)
    expect(theData.trackGroup.cover).to.include('http')
    expect(theData.trackGroup.cover).to.include(trackgroup.cover)

    expect(theData.trackGroup.title).to.eql(trackgroup.title)
    expect(theData.creatorId).to.eql(testArtistId)
    expect(theData.creator.id).to.eql(testArtistId)

    expect(theData.artist).to.be.null
    expect(theData.status).to.eql('paid')
    expect(theData.url).to.include(`user/stream/${track.id}`)

    expect(theData.images).to.include.keys('small', 'medium')
    expect(theData.images.small).to.include.keys('width', 'height')
    expect(theData.images.small.width).to.eql(120)
    expect(theData.images.small.height).to.eql(120)
    expect(theData.images.medium).to.include.keys('width', 'height')
    expect(theData.images.medium.width).to.eql(600)
    expect(theData.images.medium.height).to.eql(600)

    track.destroy({ force: true })
    play.destroy({ force: true })
    play2.destroy({ force: true })
    trackgroup.destroy({ force: true })
    tgi.destroy({ force: true })
  })

  it('should GET /tracks when options.order is \'random\'', async () => {
    response = await request.get('/tracks?order=random')

    expect(response.status).to.eql(200)

    const attributes = response.body
    expect(attributes).to.be.an('object')
    expect(attributes).to.include.keys('data', 'count', 'numberOfPages', 'status')

    expect(attributes.data).to.be.an('array')
    expect(attributes.data.length).to.eql(30)

    const theData = attributes.data[0]
    expect(theData).to.be.an('object')
    expect(theData).to.include.keys('id', 'title', 'trackGroup', 'creatorId', 'creator', 'year', 'artist', 'status', 'url', 'images')

    // We can't really know what item is first because this being "random"

    expect(theData.artist).to.be.null
    expect(theData.status).to.eql('free')

    expect(theData.images).to.be.an('object')
    expect(theData.images).to.be.empty

    expect(attributes.count).to.eql(30)
    expect(attributes.numberOfPages).to.eql(1)
    expect(attributes.status).to.eql('ok')
  })

  it('should GET track/:id', async () => {
    const track = await Track.create({
      title: faker.name.firstName(),
      creatorId: testArtistId,
      status: 'paid'
    })

    const trackgroup = await TrackGroup.create({
      title: faker.name.firstName() + 'Album',
      creatorId: testArtistId,
      cover: faker.datatype.uuid(),
      type: 'single',
      enabled: true,
      private: false
    })

    const tgi = await TrackGroupItem.create({
      trackgroupId: trackgroup.id,
      trackId: track.id,
      index: 1
    })
    response = await request.get(`/tracks/${track.id}`)

    expect(response.status).to.eql(200)

    const attributes = response.body
    expect(attributes).to.be.an('object')
    expect(attributes).to.include.keys('data')

    expect(attributes.data).to.be.an('object')

    const theData = attributes.data
    expect(theData).to.include.keys('id', 'creatorId', 'creator', 'title', 'year', 'artist', 'trackGroup', 'url', 'images')
    expect(theData.id).to.eql(track.id)
    expect(theData.creatorId).to.eql(testArtistId)
    expect(theData.title).to.eql(track.title)
    expect(theData.year).to.be.null
    expect(theData.userPlays).to.eql(undefined)
    expect(theData.userFavorited).to.eql(undefined)
    expect(theData.url).to.include(track.id)

    track.destroy({ force: true })
    trackgroup.destroy({ force: true })
    tgi.destroy({ force: true })
  })

  it('should fail track/:id if track on private trackgroup', async () => {
    const track = await Track.create({
      title: faker.name.firstName(),
      creatorId: testArtistId,
      status: 'paid'
    })

    const trackgroup = await TrackGroup.create({
      title: faker.name.firstName() + 'Album',
      creatorId: testArtistId,
      cover: faker.datatype.uuid(),
      type: 'single',
      enabled: true,
      private: true
    })

    const tgi = await TrackGroupItem.create({
      trackgroupId: trackgroup.id,
      trackId: track.id,
      index: 1
    })
    response = await request.get(`/tracks/${track.id}`)

    expect(response.status).to.eql(404)

    track.destroy({ force: true })
    trackgroup.destroy({ force: true })
    tgi.destroy({ force: true })
  })

  it('should GET track/:id for logged in user', async () => {
    const track = await Track.create({
      title: faker.animal.cat(),
      creatorId: testArtistId,
      status: 'paid'
    })
    const trackgroup = await TrackGroup.create({
      title: faker.name.firstName() + 'Album',
      creatorId: testArtistId,
      cover: faker.datatype.uuid(),
      type: 'single',
      enabled: true,
      private: false
    })
    const tgi = await TrackGroupItem.create({
      trackgroupId: trackgroup.id,
      trackId: track.id,
      index: 1
    })
    const play = await Play.create({
      userId: testUserId,
      trackId: track.id
    })
    const play2 = await Play.create({
      userId: testUserId,
      trackId: track.id
    })
    const play3 = await Play.create({
      userId: testArtistUserId,
      trackId: track.id
    })
    const favorite = await Favorite.create({
      userId: testUserId,
      trackId: track.id,
      type: true
    })

    response = await request.get(`/tracks/${track.id}`)
      .set('Authorization', `Bearer ${testAccessToken}`)

    expect(response.status).to.eql(200)

    const attributes = response.body
    expect(attributes).to.be.an('object')
    expect(attributes).to.include.keys('data')

    expect(attributes.data).to.be.an('object')

    const theData = attributes.data
    expect(theData).to.include.keys('id', 'creatorId', 'creator', 'title', 'year', 'artist', 'trackGroup', 'url', 'images')
    expect(theData.id).to.eql(track.id)
    expect(theData.creatorId).to.eql(track.creatorId)
    expect(theData.title).to.eql(track.title)
    expect(theData.year).to.be.null
    expect(theData.userPlays).to.eql(2)
    expect(theData.userFavorited).to.eql(true)
    expect(theData.url).to.include(track.id)

    await tgi.destroy({ force: true })
    await trackgroup.destroy({ force: true })
    await track.destroy({ force: true })
    await play.destroy({ force: true })
    await play2.destroy({ force: true })
    await play3.destroy({ force: true })
    await favorite.destroy({ force: true })
  })
})
