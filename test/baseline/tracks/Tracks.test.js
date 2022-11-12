/* eslint-disable no-unused-expressions */
/* eslint-env mocha */
const { request, expect, testTrackId, testUserId, testArtistId } = require('../../testConfig')
const { Track, TrackGroup, TrackGroupItem, Play } = require('../../../src/db/models')
const { faker } = require('@faker-js/faker')
const ResetDB = require('../../ResetDB')

describe('baseline/track endpoint test', () => {
  ResetDB()
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
      track_id: track.id,
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
    expect(attributes.data.length).to.eql(32)

    const theData = attributes.data[0]

    expect(theData).to.include.keys('id', 'title', 'trackGroup', 'creator', 'creatorId', 'cover_metadata', 'artist', 'status', 'url', 'images')
    expect(theData.id).to.eql(track.id)
    expect(theData.title).to.eql(track.title)
    expect(theData.trackGroup.title).to.eql(trackgroup.title)
    expect(theData.creatorId).to.eql(testArtistId)
    expect(theData.creator.id).to.eql(testArtistId)

    expect(theData.cover_metadata).to.include.keys('id')
    expect(theData.cover_metadata.id).to.be.null

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

    expect(attributes.count).to.eql(32)
    expect(attributes.numberOfPages).to.eql(1)

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
    expect(attributes.data.length).to.eql(31)

    const theData = attributes.data[0]
    expect(theData).to.be.an('object')
    expect(theData).to.include.keys('id', 'title', 'trackGroup', 'creatorId', 'creator', 'year', 'cover_metadata', 'artist', 'status', 'url', 'images')

    // We can't really know what item is first
    expect(theData.cover_metadata).to.be.an('object')
    expect(theData.cover_metadata).to.include.keys('id')
    expect(theData.cover_metadata.id).to.be.null

    expect(theData.artist).to.be.null
    expect(theData.status).to.eql('free')

    expect(theData.images).to.be.an('object')
    expect(theData.images).to.include.keys('small', 'medium')
    expect(theData.images.small).to.include.keys('width', 'height')
    expect(theData.images.small.width).to.eql(120)
    expect(theData.images.small.height).to.eql(120)
    expect(theData.images.medium).to.include.keys('width', 'height')
    expect(theData.images.medium.width).to.eql(600)
    expect(theData.images.medium.height).to.eql(600)

    expect(attributes.count).to.eql(31)
    expect(attributes.numberOfPages).to.eql(1)
    expect(attributes.status).to.eql('ok')
  })
  it('should get track by id', async () => {
    response = await request.get(`/tracks/${testTrackId}`)

    expect(response.status).to.eql(200)

    const attributes = response.body
    expect(attributes).to.be.an('object')
    expect(attributes).to.include.keys('data')

    expect(attributes.data).to.be.an('object')

    const theData = attributes.data
    expect(theData).to.include.keys('id', 'creatorId', 'title', 'album', 'year', 'artist', 'cover_metadata', 'status', 'url', 'images')
    expect(theData.id).to.eql('b6d160d1-be16-48a4-8c4f-0c0574c4c6aa')
    expect(theData.creatorId).to.eql('49d2ac44-7f20-4a47-9cf5-3ea5d6ef78f6')
    expect(theData.title).to.eql('Sharable maximized utilisation')
    expect(theData.album).to.eql('hard drive')
    expect(theData.year).to.be.null
    expect(theData.artist).to.eq; ('matrix')

    expect(theData.cover_metadata).to.be.an('object')

    expect(theData.status).to.eql('Paid')
    expect(theData.url).to.include('stream/b6d160d1-be16-48a4-8c4f-0c0574c4c6aa')

    expect(theData.images).to.include.keys('small', 'medium', 'large')
    expect(theData.images.small).to.include.keys('width', 'height')
    expect(theData.images.small.width).to.eql(120)
    expect(theData.images.small.height).to.eql(120)
    expect(theData.images.medium).to.include.keys('width', 'height')
    expect(theData.images.medium.width).to.eql(600)
    expect(theData.images.medium.height).to.eql(600)
    expect(theData.images.large).to.include.keys('width', 'height')
    expect(theData.images.large.width).to.eql(1500)
    expect(theData.images.large.height).to.eql(1500)
  })
})
