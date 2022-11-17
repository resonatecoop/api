/* eslint-disable no-unused-expressions */
/* eslint-env mocha */

const ResetDB = require('../../ResetDB')
const MockAccessToken = require('../../MockAccessToken')
const { request, expect, testArtistId, testAccessToken, testUserId, testArtistUserId } = require('../../testConfig')
const { Playlist, PlaylistItem, Track, Play, Favorite } = require('../../../src/db/models')
const { faker } = require('@faker-js/faker')

describe('/playlists endpoint test', () => {
  ResetDB()
  MockAccessToken(testUserId)

  let response = null

  it('should GET /playlists', async () => {
    const playlist = await Playlist.create({
      title: faker.name.firstName(),
      ownerId: testUserId,
      private: false
    })
    response = await request.get('/playlists')

    expect(response.status).to.eql(200)

    const { data, count } = response.body

    expect(count).to.eql(data.length)
    expect(count).to.eql(1)
    expect(data[0].title).to.eql(playlist.title)
    await playlist.destroy({ force: true })
  })

  it('should fail GET playlists/:id bad id', async () => {
    response = await request.get('/playlists/asdf')

    expect(response.status).to.eql(400)
  })

  it('should GET playlists/:id', async () => {
    const playlist = await Playlist.create({
      title: faker.name.firstName(),
      creatorId: testUserId,
      private: false
    })
    const track2 = await Track.create({
      creatorId: testArtistId,
      tags: [faker.music.genre().toLowerCase()],
      status: 'paid'
    })
    const pi = await PlaylistItem.create({
      trackId: track2.id,
      playlistId: playlist.id
    })
    response = await request.get(`/playlists/${playlist.id}`)

    expect(response.status).to.eql(200)
    const { data } = response.body
    expect(data.id).to.eql(playlist.id)
    expect(data.creator.id).to.eql(testUserId)
    expect(data.items.length).to.eql(1)
    expect(data.items[0].track.id).to.eql(track2.id)

    await playlist.destroy({ force: true })
    await track2.destroy({ force: true })
    await pi.destroy({ force: true })
  })

  it('should GET playlists/:id for logged in user', async () => {
    const track = await Track.create({
      title: faker.animal.cat(),
      creatorId: testArtistId,
      status: 'paid'
    })
    const playlist = await Playlist.create({
      title: faker.animal.dog(),
      creatorId: testArtistId,
      cover: faker.datatype.uuid(),
      type: 'single',
      enabled: true,
      private: false
    })
    const tgi = await PlaylistItem.create({
      playlistId: playlist.id,
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

    response = await request.get(`/playlists/${playlist.id}`)
      .set('Authorization', `Bearer ${testAccessToken}`)

    const { data } = response.body

    expect(data.items[0].track.userPlays).to.eql(2)
    expect(data.items[0].track.userFavorited).to.eql(true)

    await track.destroy({ force: true })
    await playlist.destroy({ force: true })
    await tgi.destroy({ force: true })
    await play.destroy({ force: true })
    await play2.destroy({ force: true })
    await play3.destroy({ force: true })
    await favorite.destroy({ force: true })
  })
})
