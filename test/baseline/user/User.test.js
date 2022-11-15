/* eslint-disable no-unused-expressions */
/* eslint-env mocha */

const { request, expect, testUserId, testArtistId, testAccessToken, testInvalidAccessToken, testArtistUserId } = require('../../testConfig')
const { TrackGroup, Track, TrackGroupItem, User } = require('../../../src/db/models')

const MockAccessToken = require('../../MockAccessToken')
const ResetDB = require('../../ResetDB')

const { faker } = require('@faker-js/faker')

describe('baseline/user endpoint test', () => {
  ResetDB()
  MockAccessToken(testArtistUserId)
  let response = null

  it('should handle no authentication / accessToken', async () => {
    response = await request.get('/user/profile')

    expect(response.status).to.eql(401)
  })

  it('should handle an invalid access token', async () => {
    response = await request.get('/user/profile').set('Authorization', `Bearer ${testInvalidAccessToken}`)

    expect(response.status).to.eql(401)
  })

  it('should GET user/profile', async () => {
    response = await request.get('/user/profile/').set('Authorization', `Bearer ${testAccessToken}`)

    expect(response.status).to.eql(200)

    const attributes = response.body
    expect(attributes).to.be.an('object')
    expect(attributes).to.include.keys('data', 'status')

    const theData = attributes.data
    expect(theData).to.be.an('object')

    expect(theData).to.include.keys(
      'displayName',
      'emailConfirmed',
      'member',
      'memberships',
      'id',
      'country',
      'newsletterNotification',
      'isListenerMember',
      'isMusicMember',
      'email',
      'role',
      'roleId',
      'credit',
      'userGroups',
      'gravatar',
      'avatar')
    expect(theData.displayName).to.eql('artist')
    expect(theData.id).to.eql('1c88dea6-0519-4b61-a279-4006954c5d4c')
    expect(theData.country).to.be.null
    expect(theData.newsletterNotification).to.be.null
    expect(theData.email).to.eql('artist@admin.com')

    const theRole = theData.role
    expect(theRole).to.be.an('object')
    expect(theRole).to.include.keys('id', 'name', 'description', 'isDefault')
    expect(theRole.id).to.eql(4)
    expect(theRole.name).to.eql('artist')
    expect(theRole.description).to.eql('An artist')
    expect(theRole.isDefault).to.be.false

    const theCredit = theData.credit
    expect(theCredit).to.be.an('object')
    expect(theCredit).to.include.keys('total')
    expect(theCredit.total).to.eql(0)

    const theUserGroups = theData.userGroups
    expect(theUserGroups).to.be.an('array')
    expect(theUserGroups.length).to.eql(1)

    expect(theData.gravatar).to.eql('https://s.gravatar.com/avatar/97f8b41e7967dcc56a5a0de728807d23')

    expect(theData.avatar).to.be.an('object')

    expect(attributes.status).to.eql('ok')
  })
  it('should PUT user/profile', async () => {
    const user = await User.findOne({
      where: {
        id: testArtistUserId
      }
    })
    user.newsletterNotification = true
    await user.save()
    expect(user.newsletterNotification).to.eql(true)
    response = await request.put('/user/profile/')
      .send({
        newsletterNotification: false
      })
      .set('Authorization', `Bearer ${testAccessToken}`)

    expect(response.status).to.eql(200)
    expect(response.body.data.newsletterNotification).to.eql(false)
    await user.reload()
    expect(user.newsletterNotification).to.eql(false)
  })

  it('should GET user/:id/playlists', async () => {
    response = await request.get(`/users/${testUserId}/playlists`).set('Authorization', `Bearer ${testAccessToken}`)

    expect(response.status).to.eql(200)

    const attributes = response.body
    expect(attributes).to.be.an('object')
    expect(attributes).to.include.keys('data', 'count', 'numberOfPages', 'status')

    expect(attributes.data).to.be.an('array')
    expect(attributes.data.length).to.eql(0)

    expect(attributes.count).to.eql(0)
    expect(attributes.numberOfPages).to.eql(0)
    expect(attributes.status).to.eql('ok')
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
          track_id: track.id,
          index: 1
        }]
      })
      .set('Authorization', `Bearer ${testAccessToken}`)

    expect(response.status).to.eql(200)

    const { data } = response.body

    expect(data.length).to.eql(1)
    expect(data[0].trackgroupId).to.eql(trackgroup.id)
    expect(data[0].track_id).to.eql(track.id)
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
      track_id: track.id,
      trackgroupId: trackgroup.id,
      index: 0
    })

    response = await request.put(`/user/trackgroups/${trackgroup.id}/items/remove`)
      .send({
        tracks: [{ track_id: track.id }]
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
    expect(data[0].track_id).to.eql(track.id)
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
