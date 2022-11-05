/* eslint-disable no-unused-expressions */
/* eslint-env mocha */

const { request, expect, testUserId, testArtistId, testAccessToken, testInvalidAccessToken, testArtistUserId } = require('../../testConfig')
const MockAccessToken = require('../../MockAccessToken')
const ResetDB = require('../../ResetDB')
const { Track, Credit, Play, UserGroup } = require('../../../src/db/models')
const { Op } = require('sequelize')
const { faker } = require('@faker-js/faker')

describe('User.ts/user plays endpoint test', () => {
  ResetDB()
  MockAccessToken(testUserId)

  let response = null

  it('should handle no authentication / accessToken', async () => {
    response = await request.get('/user/plays')

    expect(response.status).to.eql(401)
  })
  it('should handle an invalid access token', async () => {
    response = await request.get('/user/plays').set('Authorization', `Bearer ${testInvalidAccessToken}`)

    expect(response.status).to.eql(401)
  })

  it('should GET /user/plays/history', async () => {
    const track = await Track.create({
      creatorId: testArtistId,
      status: 'paid'
    })
    const track2 = await Track.create({
      creatorId: testArtistId,
      status: 'paid'
    })

    const play = await Play.create({
      userId: testUserId,
      trackId: track.id,
      type: 'paid'
    })

    const play2 = await Play.create({
      userId: testUserId,
      trackId: track.id,
      type: 'paid'
    })
    const play3 = await Play.create({
      userId: testUserId,
      trackId: track2.id,
      type: 'paid'
    })

    response = await request.get('/user/plays/history')
      .set('Authorization', `Bearer ${testAccessToken}`)

    expect(response.status).to.eql(200)
    expect(response.body.count).to.eql(3)
    expect(response.body.data[0].id).to.eql(track2.id)
    expect(response.body.data[1].id).to.eql(track.id)
    expect(response.body.data[2].id).to.eql(track.id)

    await track.destroy({ force: true })
    await track2.destroy({ force: true })
    await play.destroy({ force: true })
    await play2.destroy({ force: true })
    await play3.destroy({ force: true })
  })

  it('should GET /user/plays/history/artists', async () => {
    const artistName = faker.color.human()
    const artist = await UserGroup.create({
      displayName: artistName,
      ownerId: testArtistUserId,
      typeId: 1
    })
    const track = await Track.create({
      creatorId: artist.id,
      title: 'Test Title 1',
      status: 'paid'
    })
    const track2 = await Track.create({
      creatorId: artist.id,
      title: 'Test Title 2',
      status: 'paid'
    })

    const play = await Play.create({
      userId: testUserId,
      trackId: track.id,
      type: 'paid'
    })

    const play2 = await Play.create({
      userId: testUserId,
      trackId: track.id,
      type: 'paid'
    })
    const play3 = await Play.create({
      userId: testUserId,
      trackId: track2.id,
      type: 'paid'
    })

    response = await request.get('/user/plays/history/artists')
      .set('Authorization', `Bearer ${testAccessToken}`)
    expect(response.status).to.eql(200)
    expect(response.body.data[0].displayName).to.eql(artistName)
    expect(response.body.data[0].count).to.eql(3)

    await track.destroy({ force: true })
    await track2.destroy({ force: true })
    await play.destroy({ force: true })
    await play2.destroy({ force: true })
    await play3.destroy({ force: true })
  })

  it('should fail POST /user/plays', async () => {
    response = await request.post('/user/plays')
      .set('Authorization', `Bearer ${testAccessToken}`)

    expect(response.status).to.eql(400)
    expect(response.body.message).to.eql('Bad Request')
    expect(response.body.errors[0].path).to.eql('track_id')
  })

  it('should POST /user/plays', async () => {
    const track = await Track.create({
      creatorId: testArtistId,
      status: 'paid'
    })

    const credit = await Credit.create({
      userId: testUserId
    })

    response = await request.post('/user/plays')
      .send({ track_id: track.id })
      .set('Authorization', `Bearer ${testAccessToken}`)

    expect(response.status).to.eql(200)

    await track.destroy({ force: true })
    await credit.destroy({ force: true })
  })

  it('should POST /user/plays/buy', async () => {
    const track = await Track.create({
      creatorId: testArtistId,
      status: 'paid'
    })
    const credit = await Credit.create({
      userId: testUserId,
      total: 10000
    })

    response = await request.post('/user/plays/buy')
      .send({ trackId: track.id })
      .set('Authorization', `Bearer ${testAccessToken}`)

    expect(response.status).to.eql(200)
    expect(response.body.data.count).to.eql(9)
    expect(response.body.data.cost).to.eql(1022)
    expect(response.body.data.total).to.eql('8.9780')
    expect(response.body.data.result.length).to.eql(9)
    await track.destroy({ force: true })
    await credit.destroy({ force: true })
    await Play.destroy({
      where: {
        id: {
          [Op.in]: response.body.data.result.map(play => play.id)
        }
      },
      force: true
    })
  })

  it('should fail GET /user/plays/resolve without ids', async () => {
    response = await request.get('/user/plays/resolve')
      .set('Authorization', `Bearer ${testAccessToken}`)

    expect(response.status).to.eql(400)

    expect(response.body.message).to.eql('Bad Request')
    expect(response.body.errors[0].path).to.eql('ids')
  })

  it('should GET /user/plays/resolve', async () => {
    const track = await Track.create({
      creatorId: testArtistId,
      status: 'paid'
    })
    const track2 = await Track.create({
      creatorId: testArtistId,
      status: 'paid'
    })

    const play = await Play.create({
      userId: testUserId,
      trackId: track.id,
      type: 'paid'
    })
    const play2 = await Play.create({
      userId: testUserId,
      trackId: track.id,
      type: 'paid'
    })
    const play3 = await Play.create({
      userId: testUserId,
      trackId: track2.id,
      type: 'paid'
    })

    response = await request.get('/user/plays/resolve')
      .query({ ids: [track.id, track2.id] })
      .set('Authorization', `Bearer ${testAccessToken}`)

    expect(response.status).to.eql(200)
    const { data } = response.body

    expect(data.length).to.eql(2)
    expect(data[0].count).to.eql(2)
    expect(data[0].trackId).to.eql(track.id)
    expect(data[1].count).to.eql(1)
    expect(data[1].trackId).to.eql(track2.id)
    await track.destroy({ force: true })
    await track2.destroy({ force: true })
    await play.destroy({ force: true })
    await play2.destroy({ force: true })
    await play3.destroy({ force: true })
  })
})