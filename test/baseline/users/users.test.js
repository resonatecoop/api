/* eslint-disable no-unused-expressions */
/* eslint-env mocha */
const { request, expect, testArtistId } = require('../../testConfig')
const { User, Playlist } = require('../../../src/db/models')
const { faker } = require('@faker-js/faker')
const ResetDB = require('../../ResetDB')

describe('/users endpoint tests', () => {
  ResetDB()
  let response = null

  it('should GET /users/:id', async () => {
    const displayName = faker.animal.rabbit()
    const user = await User.create({
      displayName,
      creatorId: testArtistId,
      status: 'paid',
      password: 'test',

      roleId: 5,
      email: 'email@email.com'
    })

    response = await request.get('/users/' + user.id)

    expect(response.status).to.eql(200)
    expect(response.body.data.displayName).to.eql(displayName)

    await user.destroy({ force: true })
  })

  it('should GET /users/:id/playlists', async () => {
    const displayName = faker.animal.rabbit()
    const user = await User.create({
      displayName,
      creatorId: testArtistId,
      status: 'paid',
      password: 'test',

      roleId: 5,
      email: 'email@email.com'
    })

    const privatePlaylist = await Playlist.create({
      title: faker.music.songName(),
      private: true,
      creatorId: user.id
    })

    const publicPlaylist = await Playlist.create({
      title: faker.music.songName(),
      private: false,
      creatorId: user.id
    })

    response = await request.get('/users/' + user.id + '/playlists')

    expect(response.status).to.eql(200)
    expect(response.body.data.length).to.eql(1)
    expect(response.body.data[0].id).to.eql(publicPlaylist.id)

    await user.destroy({ force: true })
    await privatePlaylist.destroy({ force: true })
    await publicPlaylist.destroy({ force: true })
  })
})
