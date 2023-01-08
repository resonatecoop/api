/* eslint-disable no-unused-expressions */
/* eslint-env mocha */

const ResetDB = require('../../ResetDB')
const MockAccessToken = require('../../MockAccessToken')
const { request, expect, testUserId, testArtistId, testAccessToken, testArtistUserId } = require('../../testConfig')
const { Track, UserGroupType, UserGroup, TrackGroup, TrackGroupItem, Play, Favorite } = require('../../../src/db/models')
const { faker } = require('@faker-js/faker')

describe('baseline/artists endpoint test', () => {
  ResetDB()
  MockAccessToken(testUserId)

  let response = null

  // FIXME: this test is fragile
  it('should GET /artists', async () => {
    response = await request.get('/artists')

    console.log('response', response.body)
    expect(response.status).to.eql(200)

    const attributes = response.body
    expect(attributes).to.be.an('object')
    expect(attributes).to.include.keys('data', 'count', 'pages', 'status')
    expect(attributes.data).to.be.an('array')
    expect(attributes.data.length).to.eql(1)

    const theData = attributes.data[0]
    expect(theData).to.include.keys('id', 'typeId', 'displayName', 'description', 'shortBio', 'images', 'updatedAt', 'createdAt', 'deletedAt', 'avatar', 'banner', 'trackgroups')
    expect(theData.id).to.eql('49d2ac44-7f20-4a47-9cf5-3ea5d6ef78f6')
    expect(theData.typeId).to.eql(1)
    expect(theData.displayName).to.eql('matrix')
    expect(theData.description).to.be.null
    expect(theData.shortBio).to.be.null

    expect(theData.trackgroups).to.be.an('array')
    expect(theData.trackgroups.length).to.eql(3)

    const theTG = theData.trackgroups[0]
    console.log('response', theTG)

    expect(theTG).to.include.keys('composers', 'performers', 'tags', 'id', 'cover', 'title', 'slug', 'type', 'about', 'private', 'display_artist', 'creatorId',
      'releaseDate', 'download', 'featured', 'enabled', 'updatedAt', 'createdAt', 'deletedAt', 'items')
    expect(theTG.composers).to.be.an('array')
    expect(theTG.composers.length).to.eql(0)
    expect(theTG.performers).to.be.an('array')
    expect(theTG.performers.length).to.eql(0)
    expect(theTG.tags).to.be.an('array')
    expect(theTG.tags.length).to.eql(0)
    expect(theTG.id).to.eql('84322e4f-0247-427f-8bed-e7617c3df5ad')
    expect(theTG.cover).to.be.null
    expect(theTG.title).to.eql('Best album ever')
    expect(theTG.slug).to.eql('best-album-ever')
    expect(theTG.type).to.eql('lp')
    expect(theTG.about).to.eql('this is the best album')
    expect(theTG.private).to.be.false
    expect(theTG.display_artist).to.eql('Jack')
    expect(theTG.creatorId).to.eql('49d2ac44-7f20-4a47-9cf5-3ea5d6ef78f6')
    expect(theTG.releaseDate).to.eql('2019-01-01')
    expect(theTG.download).to.be.false
    expect(theTG.featured).to.be.false
    expect(theTG.enabled).to.be.true
    expect(theTG.updatedAt).to.eql('2022-09-29T13:07:07.237Z')
    expect(theTG.createdAt).to.eql('2022-09-28T17:31:59.513Z')
    expect(theTG.deletedAt).to.be.null

    expect(theTG.items).to.be.an('array')
    expect(theTG.items.length).to.eql(10)

    const theItem = theTG.items[0]

    expect(theItem).to.be.an('object')
    expect(theItem).to.include.keys('id', 'index', 'trackId', 'track')
    expect(theItem.id).to.eql('753eccd9-01b2-4bfb-8acc-8d0e44b998cc')
    expect(theItem.index).to.eql(0)
    expect(theItem.trackId).to.eql('44a28752-1101-4e0d-8c40-2c36dc82d035')

    expect(theItem.track).to.be.an('object')
    const theTrack = theItem.track

    expect(theTrack).to.include.keys('status', 'id', 'legacyId', 'creatorId', 'title', 'artist', 'album', 'album_artist', 'composer', 'year',
      'url', 'cover_art', 'number', 'tags', 'updatedAt', 'createdAt', 'deletedAt', 'track_url', 'track_cover_art')
    expect(theTrack.status).to.eql('free')
    expect(theTrack.id).to.eql('44a28752-1101-4e0d-8c40-2c36dc82d035')
    expect(theTrack.legacyId).to.be.null
    expect(theTrack.creatorId).to.eql('49d2ac44-7f20-4a47-9cf5-3ea5d6ef78f6')
    expect(theTrack.title).to.eql('Ergonomic interactive concept')
    expect(theTrack.artist).to.eql('Laurie Yost')
    expect(theTrack.album).to.eql('firewall')
    expect(theTrack.album_artist).to.be.null
    expect(theTrack.composer).to.be.null
    expect(theTrack.year).to.be.null
    expect(theTrack.url).to.eql('b60f1759-6405-4457-9910-6da1ccd5f40f')
    expect(theTrack.cover_art).to.be.null
    expect(theTrack.number).to.be.null
    expect(theTrack.tags).to.be.null
    expect(theTrack.updatedAt).to.eql('2022-09-28T17:31:59.879Z')
    expect(theTrack.createdAt).to.eql('2022-09-28T17:31:59.879Z')
    expect(theTrack.deletedAt).to.be.null
    expect(theTrack.track_url).to.be.eql('b60f1759-6405-4457-9910-6da1ccd5f40f')
    expect(theTrack.track_cover_art).to.be.null

    expect(attributes.count).to.eql(1)
    expect(attributes.pages).to.eql(1)
    expect(attributes.status).to.eql('ok')
  })

  it('should GET /artists/:id', async () => {
    response = await request.get(`/artists/${testArtistId}`)

    expect(response.status).to.eql(200)

    const attributes = response.body
    expect(attributes).to.be.an('object')
    expect(attributes).to.include.keys('data')

    expect(attributes.data).to.be.an('object')

    const theData = attributes.data
    expect(theData).to.include.keys('id', 'typeId', 'displayName', 'description', 'shortBio', 'avatar', 'banner', 'updatedAt', 'createdAt', 'deletedAt')
    expect(theData.id).to.eql('49d2ac44-7f20-4a47-9cf5-3ea5d6ef78f6')
    expect(theData.typeId).to.eql(1)
    expect(theData.displayName).to.eql('matrix')
    expect(theData.description).to.be.null
    expect(theData.shortBio).to.be.null
  })

  it('should GET /artists/:id/releases', async () => {
    const track = await Track.create({
      title: faker.animal.cat(),
      creatorId: testArtistId,
      status: 'paid'
    })
    const trackgroup = await TrackGroup.create({
      title: faker.animal.dog(),
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

    response = await request.get(`/artists/${testArtistId}/releases`)
    console.log(response.body)
    expect(response.status).to.eql(200)

    const attributes = response.body
    expect(attributes).to.be.an('object')
    expect(attributes).to.include.keys('data', 'count', 'numberOfPages', 'status')

    expect(attributes.data).to.be.an('array')
    expect(attributes.data.length).to.eql(4)

    const theData = attributes.data[0]

    expect(theData).to.include.keys('tags', 'about', 'creatorId', 'display_artist', 'id', 'slug', 'title', 'createdAt', 'releaseDate', 'type',
      'cover_metadata', 'creator', 'items', 'images', 'uri')
    expect(theData.tags).to.be.an('array')
    expect(theData.tags.length).to.eql(0)
    expect(theData.cover_metadata).to.include.keys('id')
    expect(theData.creatorId).to.eql('49d2ac44-7f20-4a47-9cf5-3ea5d6ef78f6')
    expect(theData.creator).to.not.be.null
    expect(theData.id).to.eql(trackgroup.id)
    expect(theData.slug).to.eql(trackgroup.slug)
    expect(theData.title).to.eql(trackgroup.title)
    expect(theData.createdAt).to.eql(trackgroup.createdAt.toISOString())
    expect(theData.releaseDate).to.eql(trackgroup.releaseDate)
    expect(theData.type).to.eql(trackgroup.type)

    expect(theData.creator).to.be.an('object')
    expect(theData.creator).to.include.keys('id', 'displayName')
    expect(theData.creator.id).to.eql('49d2ac44-7f20-4a47-9cf5-3ea5d6ef78f6')
    expect(theData.creator.displayName).to.eql('matrix')

    expect(theData.items).to.be.an('array')
    expect(theData.items.length).to.eql(1)

    const theItem = theData.items[0]
    expect(theItem).to.include.keys('trackId', 'index', 'track')
    expect(theItem.index).to.eql(1)
    expect(theItem.trackId).to.eql(track.id)

    const theTrack = theItem.track
    expect(theTrack).to.include.keys('status', 'id', 'creatorId', 'title', 'artist', 'year', 'images', 'url',
      'trackGroup')
    expect(theTrack.status).to.eql('paid')
    expect(theTrack.id).to.eql(track.id)
    expect(theTrack.creatorId).to.eql('49d2ac44-7f20-4a47-9cf5-3ea5d6ef78f6')
    expect(theTrack.title).to.eql(track.title)
    expect(theTrack.trackGroup.title).to.eql(trackgroup.title)
    expect(theTrack.year).to.be.null
    expect(theTrack.userPlays).to.eql(undefined)
    expect(theTrack.userFavorited).to.eql(undefined)

    expect(attributes.count).to.eql(4)
    expect(attributes.numberOfPages).to.eql(1)
    expect(attributes.status).to.eql('ok')

    await track.destroy({ force: true })
    await trackgroup.destroy({ force: true })
    await tgi.destroy({ force: true })
  })

  it('should GET /artists/:id/releases with logged in user', async () => {
    const track = await Track.create({
      title: faker.animal.cat(),
      creatorId: testArtistId,
      status: 'paid'
    })
    const trackgroup = await TrackGroup.create({
      title: faker.animal.dog(),
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

    response = await request.get(`/artists/${testArtistId}/releases`)
      .set('Authorization', `Bearer ${testAccessToken}`)

    expect(response.status).to.eql(200)

    const attributes = response.body
    expect(attributes).to.be.an('object')

    expect(attributes.data).to.be.an('array')

    const theData = attributes.data[0]

    expect(theData.items.length).to.eql(1)

    const theItem = theData.items[0]
    expect(theItem).to.include.keys('trackId', 'index', 'track')
    expect(theItem.index).to.eql(1)
    expect(theItem.trackId).to.eql(track.id)

    const theTrack = theItem.track
    expect(theTrack).to.include.keys('status', 'id', 'creatorId', 'title', 'artist', 'year', 'images', 'url',
      'trackGroup')
    expect(theTrack.status).to.eql('paid')
    expect(theTrack.id).to.eql(track.id)
    expect(theTrack.creatorId).to.eql('49d2ac44-7f20-4a47-9cf5-3ea5d6ef78f6')
    expect(theTrack.title).to.eql(track.title)
    expect(theTrack.trackGroup.title).to.eql(trackgroup.title)
    expect(theTrack.year).to.be.null
    expect(theTrack.userPlays).to.eql(2)
    expect(theTrack.userFavorited).to.eql(true)

    expect(attributes.count).to.eql(4)
    expect(attributes.numberOfPages).to.eql(1)
    expect(attributes.status).to.eql('ok')

    await track.destroy({ force: true })
    await trackgroup.destroy({ force: true })
    await tgi.destroy({ force: true })
    await play.destroy({ force: true })
    await play2.destroy({ force: true })
    await play3.destroy({ force: true })
    await favorite.destroy({ force: true })
  })

  it('should GET /artists/:id/tracks/top', async () => {
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

    response = await request.get(`/artists/${testArtistId}/tracks/top`)

    expect(response.status).to.eql(200)

    const attributes = response.body
    expect(attributes).to.be.an('object')
    expect(attributes).to.include.keys('data')

    const theData = attributes.data
    expect(theData).to.be.an('array')
    expect(theData.length).to.eql(1)

    const theItem = theData[0]
    expect(theItem).to.include.keys('id', 'title', 'trackGroup', 'creatorId', 'artist', 'status', 'url', 'images')

    expect(theItem.id).to.eql(track.id)
    expect(theItem.title).to.eql(displayName)
    expect(theItem.trackGroup.title).to.eql(displayName + 'Album')
    expect(theItem.trackGroup.cover).to.contain('http')
    expect(theItem.trackGroup.cover).to.contain(trackgroup.cover)

    expect(theItem.artist).to.eql('matrix')
    expect(theItem.status).to.eql('paid')
    expect(theItem.url).to.include('user/stream/' + track.id)

    expect(theItem.images).to.be.empty

    await track.destroy({ force: true })
    await play.destroy({ force: true })
    await play2.destroy({ force: true })
    await trackgroup.destroy({ force: true })
    await tgi.destroy({ force: true })
  })

  it('should GET artists/featured', async () => {
    const type = await UserGroupType.findOne({ where: { name: 'artist' } })

    const newArtist = await UserGroup.create({
      displayName: faker.animal.cow(),
      ownerId: testArtistUserId,
      typeId: type.id
    })
    const trackgroup = await TrackGroup.create({
      title: faker.animal.fish(),
      creatorId: newArtist.id,
      cover: faker.datatype.uuid(),
      type: 'single',
      enabled: true,
      featured: false,
      private: false
    })
    const trackgroup2 = await TrackGroup.create({
      title: faker.animal.fish(),
      creatorId: newArtist.id,
      cover: faker.datatype.uuid(),
      type: 'single',
      enabled: true,
      featured: true,
      private: false
    })
    response = await request.get('/artists/featured')

    expect(response.body.data[0].displayName).to.eql(newArtist.displayName)

    await trackgroup.destroy({ force: true })
    await trackgroup2.destroy({ force: true })
    await newArtist.destroy({ force: true })
  })

  it('should GET artists/featured', async () => {
    const type = await UserGroupType.findOne({ where: { name: 'artist' } })

    const newArtist = await UserGroup.create({
      displayName: faker.animal.cow(),
      ownerId: testArtistUserId,
      typeId: type.id
    })
    const trackgroup = await TrackGroup.create({
      title: faker.animal.fish(),
      creatorId: newArtist.id,
      cover: faker.datatype.uuid(),
      releaseDate: faker.date.past(),
      type: 'single',
      enabled: true,
      private: false
    })
    const trackgroup2 = await TrackGroup.create({
      title: faker.animal.fish(),
      creatorId: newArtist.id,
      cover: faker.datatype.uuid(),
      releaseDate: faker.date.recent(),
      type: 'single',
      enabled: true,
      private: false
    })
    response = await request.get('/artists/updated')
    expect(response.body.data[0].displayName).to.eql(newArtist.displayName)

    await trackgroup.destroy({ force: true })
    await trackgroup2.destroy({ force: true })
    await newArtist.destroy({ force: true })
  })
})
