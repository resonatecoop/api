/* eslint-disable no-unused-expressions */
/* eslint-env mocha */
const { Track } = require('../../../src/db/models')
const { request, expect, testUserId, testTrackId, testTrackGroupId, testAccessToken, testInvalidAccessToken, testArtistId } = require('../../testConfig')
const MockAccessToken = require('../../MockAccessToken')
const ResetDB = require('../../ResetDB')
const { faker } = require('@faker-js/faker')

describe('User.ts/user tracks endpoint test', () => {
  ResetDB()
  MockAccessToken(testUserId)

  let response = null

  it('should handle no authentication / accessToken', async () => {
    response = await request.get('/user/tracks')

    expect(response.status).to.eql(401)
  })
  it('should handle an invalid access token', async () => {
    response = await request.get('/user/tracks').set('Authorization', `Bearer ${testInvalidAccessToken}`)

    expect(response.status).to.eql(401)
  })

  it('should fail POST /user/tracks without creatorId', async () => {
    response = await request.post('/user/tracks')
      .set('Authorization', `Bearer ${testAccessToken}`)

    expect(response.status).to.eql(400)
    expect(response.body.message).to.eql('Bad Request')
    expect(response.body.errors[0].path).to.eql('creatorId')
  })

  it('should POST /user/tracks', async () => {
    const title = faker.animal.cat()
    response = await request.post('/user/tracks')
      .send({ creatorId: testArtistId, title })
      .set('Authorization', `Bearer ${testAccessToken}`)

    const { data } = response.body
    expect(response.status).to.eql(201)
    expect(data.creatorId).to.eql(testArtistId)
    expect(data.title).to.eql(title)
    Track.destroy({
      where: {
        id: data.id
      },
      force: true
    })
  })
  // FIXME: we need workers running for these tests to succeed
  it.skip('should PUT /user/tracks/:id/file', async () => {
    response = await request.put(`/user/tracks/${testTrackId}/file `).set('Authorization', `Bearer ${testAccessToken}`)

    console.log('upload a file based on track id RESPONSE: ', response.text)

    expect(response.status).to.eql()
  })
  // FIXME: we need workers running for these tests to succeed
  it.skip('should PUT /user/trackgroups/:id/cover', async () => {
    response = await request.put(`/user/trackgroups/${testTrackGroupId}/cover`).set('Authorization', `Bearer ${testAccessToken}`)

    console.log('upload a cover based on trackgroup id RESPONSE: ', response.text)

    expect(response.status).to.eql(200)
  })
})
