/* eslint-disable no-unused-expressions */
/* eslint-env mocha */
const { request, expect, testArtistId } = require('../../testConfig')
const { Track, TrackGroup, TrackGroupItem } = require('../../../src/db/models')
const { faker } = require('@faker-js/faker')
const ResetDB = require('../../ResetDB')

describe('Api.ts/tag endpoint test', () => {
  ResetDB()
  let response = null

  // FIXME: this test is fragile
  it('should GET tag/:tag find tracks', async () => {
    const track = await Track.create({
      creatorId: testArtistId,
      tags: ['reggae']
    })
    const track2 = await Track.create({
      creatorId: testArtistId,
      tags: ['rock']
    })

    const tg = await TrackGroup.create({
      creatorId: testArtistId,
      title: faker.music.songName(),
      private: false,
      enabled: true,
      cover: testArtistId
    })

    const tgi = await TrackGroupItem.create({
      trackgroupId: tg.id,
      index: 0,
      trackId: track.id
    })

    const tgi2 = await TrackGroupItem.create({
      trackgroupId: tg.id,
      index: 0,
      trackId: track2.id
    })

    response = await request.get('/tag/reggae')
    console.log('response', response.body)
    expect(response.status).to.eql(200)

    const { data } = response.body
    expect(data.tracks.length).to.eql(1)
    expect(data.tracks[0].title).to.eql(track.title)

    track.destroy({ force: true })
    track2.destroy({ force: true })
    tg.destroy({ force: true })
    tgi.destroy({ force: true })
    tgi2.destroy({ force: true })
  })

  // FIXME: Fragile test
  it('should GET tag/:tag find trackgroups', async () => {
    const tg = await TrackGroup.create({
      creatorId: testArtistId,
      cover: testArtistId,
      title: faker.music.songName(),
      tags: ['reggea'],
      enabled: true,
      private: false
    })
    const tg2 = await TrackGroup.create({
      creatorId: testArtistId,
      cover: testArtistId,
      title: faker.music.songName(),
      tags: ['rock'],
      enabled: true,
      private: false
    })

    response = await request.get('/tag/reggea')
    expect(response.status).to.eql(200)

    const { data } = response.body
    expect(data.trackgroups.length).to.eql(1)
    expect(data.trackgroups[0].title).to.eql(tg.title)

    tg.destroy({ force: true })
    tg2.destroy({ force: true })
  })
})
