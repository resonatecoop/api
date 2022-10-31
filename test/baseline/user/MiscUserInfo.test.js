/* eslint-disable no-unused-expressions */
/* eslint-env mocha */
const { Track, TrackGroup, Favorite, TrackGroupItem, Play } = require('../../../src/db/models')
const { request, expect, testArtistId, testUserId, testAccessToken, testInvalidAccessToken, testAdminUserId } = require('../../testConfig')
const MockAccessToken = require('../../MockAccessToken')
const { faker } = require('@faker-js/faker')
const ResetDB = require('../../ResetDB')

describe('User.ts/misc user info endpoint test', () => {
  MockAccessToken(testUserId)
  ResetDB()

  let response = null

  const from = '2020-01-01'
  const to = faker.date.future().toISOString().split('T')[0]

  it('should handle no authentication / accessToken', async () => {
    response = await request.get('/user/plays/')

    expect(response.status).to.eql(401)
  })

  it('should handle an invalid access token', async () => {
    response = await request.get('/user/plays/').set('Authorization', `Bearer ${testInvalidAccessToken}`)

    expect(response.status).to.eql(401)
  })

  it('should GET /user/plays/stats?from=&to=', async () => {
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
      trackId: track.id,
      index: 1
    })

    const longAgoDate = faker.date.past()

    const play = await Play.create({
      userId: testUserId,
      trackId: track.id,
      createdAt: longAgoDate
    })
    const dateForDoubleCount = faker.date.soon()
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
    response = await request.get(`/user/plays/stats?from=${from}&to=${to}`).set('Authorization', `Bearer ${testAccessToken}`)

    expect(response.status).to.eql(200)

    const { data } = response.body
    expect(data.length).to.eql(2)
    expect(data[0].date).to.eql(dateForDoubleCount.toISOString().split('T')[0])
    expect(data[0].count).to.eql(2)

    expect(data[1].date).to.eql(longAgoDate.toISOString().split('T')[0])
    expect(data[1].count).to.eql(1)

    await track.destroy({ force: true })
    await play.destroy({ force: true })
    await play2.destroy({ force: true })
    await play3.destroy({ force: true })
    await play4.destroy({ force: true })
    await trackgroup.destroy({ force: true })
    await tgi.destroy({ force: true })
  })

  // FIXME: Skipping because it's not used for now
  it.skip('should GET /user/plays/history/artists', async () => {
    response = await request.get('/user/plays/history/artists').set('Authorization', `Bearer ${testAccessToken}`)

    console.log('user plays history artists RESPONSE: ', response.text)

    expect(response.status).to.eql(200)
  })

  it('should GET /user/collection', async () => {
    response = await request.get('/user/collection/').set('Authorization', `Bearer ${testAccessToken}`)

    expect(response.status).to.eql(200)

    const attributes = response.body
    expect(attributes).to.be.an('object')
    expect(attributes).to.include.keys('data', 'count', 'pages')

    expect(attributes.data).to.be.an('array')
    expect(attributes.data.length).to.eql(0)

    expect(attributes.count).to.eql(0)
    expect(attributes.pages).to.eql(0)
  })

  it('should GET /user/plays/history', async () => {
    const displayName = 'Test test'
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
      trackId: track.id,
      createdAt: faker.date.past()
    })
    const play2 = await Play.create({
      userId: testUserId,
      trackId: track2.id,
      createdAt: faker.date.soon()
    })

    response = await request.get('/user/plays/history/').set('Authorization', `Bearer ${testAccessToken}`)

    expect(response.status).to.eql(200)
    expect(response.body.count).to.eql(2)

    const data = response.body.data
    expect(data[0].id).to.eql(track2.id)
    expect(data[1].id).to.eql(track.id)

    await track.destroy({ force: true })
    await play.destroy({ force: true })
    await play2.destroy({ force: true })
    await trackgroup.destroy({ force: true })
    await tgi.destroy({ force: true })
  })

  it('should GET /user/favorites', async () => {
    const track = await Track.create({
      title: faker.animal.cat(),
      creatorId: testArtistId,
      status: 'paid'
    })

    const favorite = await Favorite.create({
      userId: testUserId,
      trackId: track.id,
      type: true
    })

    const trackgroup = await TrackGroup.create({
      title: track.title + 'Album',
      creatorId: testArtistId,
      cover: faker.datatype.uuid(),
      release_date: faker.date.past(),
      type: 'single',
      enabled: true,
      private: false
    })
    const tgi = await TrackGroupItem.create({
      trackgroupId: trackgroup.id,
      trackId: track.id,
      index: 1
    })
    response = await request.get('/user/favorites').set('Authorization', `Bearer ${testAccessToken}`)

    expect(response.status).to.eql(200)

    const attributes = response.body
    expect(attributes).to.be.an('object')
    expect(attributes).to.include.keys('data', 'count', 'pages')

    expect(attributes.data).to.be.an('array')
    expect(attributes.data.length).to.eql(1)

    expect(attributes.count).to.eql(1)
    expect(attributes.pages).to.eql(1)
    expect(attributes.data[0].title).to.eql(track.title)
    expect(attributes.data[0].id).to.eql(track.id)
    expect(attributes.data[0].creatorId).to.eql(testArtistId)

    await track.destroy({ force: true })
    await favorite.destroy({ force: true })
    await trackgroup.destroy({ force: true })
    await tgi.destroy({ force: true })
  })

  it('should not POST /user/favorites without trackId', async () => {
    response = await request.post('/user/favorites')
      .set('Authorization', `Bearer ${testAccessToken}`)

    expect(response.status).to.eql(400)
    expect(response.body.message).to.eql('Bad Request')
    expect(response.body.errors[0].path).to.eql('trackId')
  })

  it('should POST /user/favorites', async () => {
    const track = await Track.create({
      title: faker.animal.cat(),
      creatorId: testArtistId,
      status: 'paid'
    })

    response = await request.post('/user/favorites')
      .send({ trackId: track.id })
      .set('Authorization', `Bearer ${testAccessToken}`)

    expect(response.status).to.eql(200)
    const { data } = response.body
    expect(data.trackId).to.eql(track.id)
    expect(data.userId).to.eql(testUserId)
    expect(data.type).to.eql(true)

    await track.destroy({ force: true })
    await Favorite.destroy({
      where: {
        id: data.id
      },
      force: true
    })
  })
  it('should fail GET /user/favorites/resolve without ids', async () => {
    response = await request.get('/user/favorites/resolve')
      .set('Authorization', `Bearer ${testAccessToken}`)

    expect(response.status).to.eql(400)
    expect(response.body.message).to.eql('Bad Request')
    expect(response.body.errors[0].path).to.eql('ids')
  })
  it('should GET /user/favorites/resolve', async () => {
    const track1 = await Track.create({
      title: faker.animal.cat(),
      creatorId: testArtistId,
      status: 'paid'
    })
    const track2 = await Track.create({
      title: faker.animal.cat(),
      creatorId: testArtistId,
      status: 'paid'
    })
    const favorite = await Favorite.create({
      userId: testUserId,
      trackId: track2.id,
      type: true
    })

    response = await request.get('/user/favorites/resolve')
      .query({ ids: [track1.id, track2.id] })
      .set('Authorization', `Bearer ${testAccessToken}`)

    expect(response.status).to.eql(200)
    expect(response.body.data.length).to.eql(1)
    expect(response.body.data[0].trackId).to.eql(track2.id)

    await track1.destroy({ force: true })
    await track2.destroy({ force: true })
    await favorite.destroy({ force: true })
  })
})
