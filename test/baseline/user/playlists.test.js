/* eslint-disable no-unused-expressions */
/* eslint-env mocha */

const { request, expect, testArtistId, testAccessToken, testInvalidAccessToken, testArtistUserId } = require('../../testConfig')
const { Track, Playlist, PlaylistItem } = require('../../../src/db/models')

const MockAccessToken = require('../../MockAccessToken')
const ResetDB = require('../../ResetDB')

const { faker } = require('@faker-js/faker')

describe('baseline/user/playlists endpoint test', () => {
  ResetDB()
  MockAccessToken(testArtistUserId)
  let response = null

  it('should handle no authentication / accessToken', async () => {
    response = await request.get('/user/playlists')

    expect(response.status).to.eql(401)
  })

  it('should handle an invalid access token', async () => {
    response = await request.get('/user/playlists').set('Authorization', `Bearer ${testInvalidAccessToken}`)

    expect(response.status).to.eql(401)
  })

  it('should fail POST /user/playlists if title not provided', async () => {
    response = await request.post('/user/playlists')
      .set('Authorization', `Bearer ${testAccessToken}`)

    expect(response.status).to.eql(400)
    expect(response.body.message).to.eql('Bad Request')
    expect(response.body.errors[0].path).to.eql('title')
    expect(response.body.errors[0].message).to.eql('should have required property \'title\'')
  })

  it('should POST /user/playlists', async () => {
    const title = faker.lorem.sentence(4)

    response = await request.post('/user/playlists')
      .send({ title })
      .set('Authorization', `Bearer ${testAccessToken}`)

    expect(response.status).to.eql(201)

    const result = response.body.data

    expect(result.title).to.eql(title)
    expect(result.private).to.eql(true)

    // Clean up
    await Playlist.destroy({
      where: {
        id: result.id
      },
      force: true
    })
  })

  it('should PUT /user/playlists/:id', async () => {
    const oldTitle = faker.lorem.sentence(4)
    const oldCover = faker.datatype.uuid()
    const newTitle = faker.lorem.sentence(3)

    const playlist = await Playlist.create({
      cover: oldCover,
      title: oldTitle,
      creatorId: testArtistUserId
    })

    response = await request.put(`/user/playlists/${playlist.id}`)
      .send({ title: newTitle })
      .set('Authorization', `Bearer ${testAccessToken}`)

    expect(response.status).to.eql(200)
    const { data: result } = response.body

    expect(result.id).to.eql(playlist.id)
    expect(result.creatorId).to.eql(testArtistUserId)
    expect(result.title).to.eql(newTitle)
    expect(result.cover).to.include(oldCover)
    expect(result.cover).to.include('http')

    await playlist.destroy({ force: true })
  })

  it('should GET /user/playlists', async () => {
    const playlist = await Playlist.create({
      cover: faker.datatype.uuid(),
      title: faker.lorem.sentence(4),
      creatorId: testArtistUserId
    })

    response = await request.get('/user/playlists').set('Authorization', `Bearer ${testAccessToken}`)

    expect(response.status).to.eql(200)

    const attributes = response.body
    expect(attributes).to.be.an('object')
    expect(attributes).to.include.keys('data', 'count', 'numberOfPages', 'status')

    expect(attributes.data).to.be.an('array')
    expect(attributes.data.length).to.eql(1)

    expect(attributes.count).to.eql(1)
    expect(attributes.numberOfPages).to.eql(1)
    expect(attributes.status).to.eql('ok')
    await playlist.destroy({ where: true })
  })

  it('should GET /user/playlists/:id', async () => {
    const playlist = await Playlist.create({
      cover: faker.datatype.uuid(),
      about: faker.lorem.paragraph(4),
      title: faker.lorem.sentence(4),
      creatorId: testArtistUserId
    })
    response = await request.get(`/user/playlists/${playlist.id}`).set('Authorization', `Bearer ${testAccessToken}`)

    expect(response.status).to.eql(200)

    const attributes = response.body
    expect(attributes).to.be.an('object')
    expect(attributes).to.include.keys('data', 'status')

    expect(attributes.data).to.be.an('object')

    const theData = attributes.data
    expect(theData).to.include.keys('about', 'cover_metadata', 'cover', 'creator', 'creatorId', 'id', 'items', 'images', 'private', 'title')
    expect(theData.about).to.eql(playlist.about)
    expect(theData.cover).to.include(playlist.cover)
    expect(theData.cover).to.include('http')
    expect(theData.title).to.eql(playlist.title)
    expect(theData.creatorId).to.eql(testArtistUserId)

    await playlist.destroy({ where: true })
  })

  it('should PUT /user/playlists/:id/items/add', async () => {
    const playlist = await Playlist.create({
      cover: faker.datatype.uuid(),
      title: faker.lorem.sentence(4),
      creatorId: testArtistUserId
    })

    const track = await Track.create({
      creatorId: testArtistId
    })

    response = await request.put(`/user/playlists/${playlist.id}/items/add`)
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
    expect(data[0].playlistId).to.eql(playlist.id)
    expect(data[0].trackId).to.eql(track.id)
    expect(data[0].track.id).to.eql(track.id)
    expect(data[0].track.status).to.eql('hidden')

    await playlist.destroy({ force: true })
    await track.destroy({ force: true })
    await PlaylistItem.destroy({
      where: {
        id: data[0].id
      },
      force: true
    })
  })

  it('should PUT /user/playlists/:id/items/remove', async () => {
    const playlist = await Playlist.create({
      cover: faker.datatype.uuid(),
      title: faker.lorem.sentence(4),
      creatorId: testArtistUserId
    })

    const track = await Track.create({
      creatorId: testArtistId
    })

    const trackgroupItem = await PlaylistItem.create({
      trackId: track.id,
      playlistId: playlist.id,
      index: 0
    })

    response = await request.put(`/user/playlists/${playlist.id}/items/remove`)
      .send({
        tracks: [{ trackId: track.id }]
      })
      .set('Authorization', `Bearer ${testAccessToken}`)

    const { data } = response.body

    expect(response.status).to.eql(200)
    expect(data.length).to.eql(0)
    await trackgroupItem.reload({ paranoid: false })
    expect(trackgroupItem.deletedAt).to.be.not.null

    await playlist.destroy({ force: true })
    await track.destroy({ force: true })
    await trackgroupItem.destroy({
      force: true
    })
  })

  it('should PUT /users/playlists/:id/items', async () => {
    const playlist = await Playlist.create({
      cover: faker.datatype.uuid(),
      title: faker.lorem.sentence(4),
      creatorId: testArtistUserId
    })

    const track = await Track.create({
      creatorId: testArtistId
    })

    response = await request.put(`/user/playlists/${playlist.id}/items`)
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
    expect(data[0].playlistId).to.eql(playlist.id)
    expect(data[0].trackId).to.eql(track.id)
    expect(data.length).to.eql(1)

    await playlist.destroy({ force: true })
    await track.destroy({ force: true })
    await PlaylistItem.destroy({
      where: {
        id: data[0].id
      },
      force: true
    })
  })

  it('should DELETE /user/playlists/:id', async () => {
    const oldTitle = faker.lorem.sentence(4)
    const oldCover = faker.datatype.uuid()

    const playlist = await Playlist.create({
      cover: oldCover,
      title: oldTitle,
      creatorId: testArtistUserId
    })

    response = await request.delete(`/user/playlists/${playlist.id}`)
      .set('Authorization', `Bearer ${testAccessToken}`)

    expect(response.status).to.eql(200)
    expect(response.body.message).to.eql('Playlist was removed')

    const newTrackgroupSearch = await Playlist.findOne({
      where: {
        id: playlist.id
      }
    })

    expect(newTrackgroupSearch).to.eql(null)

    const paranoidSearch = await Playlist.findOne({
      where: {
        id: playlist.id
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
