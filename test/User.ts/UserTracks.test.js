/* eslint-disable no-unused-expressions */
/* eslint-env mocha */

const { request, expect, testUserId, testTrackId, testTrackGroupId, testAccessToken, testInvalidAccessToken } = require('../testConfig')
const MockAccessToken = require('../MockAccessToken')

describe.skip('User.ts/user tracks endpoint test', () => {
  MockAccessToken(testUserId)

  let response = null

  it('should handle no authentication / accessToken', async () => {
    response = await request.get('/user/tracks')

    expect(response.status).to.eql(401)
  })
  it('should handle an invalid access token', async () => {
    response = await request.get('/user/tracks').set('Authorization', `Bearer ${testInvalidAccessToken}`)

    // FIXME: response.status should be 401, not 404
    expect(response.status).to.eql(404)
  })

  it('should post to user tracks', async () => {
    response = await request.post('/user/tracks').set('Authorization', `Bearer ${testAccessToken}`)

    console.log('post to all user tracks RESPONSE: ', response.text)

    expect(response.status).to.eql(200)

    // const attributes = response.body
    // expect(attributes).to.be.an('object')
    // expect(attributes).to.include.keys("data", "count", "numberOfPages", "status")

    // expect(attributes.data).to.be.an('array')
    // expect(attributes.data.length).to.eql(3)

    // const theData = attributes.data[0]
    // expect(theData).to.include.keys("")
    // expect(theData.xxx).to.eql()

    // expect(attributes.count).to.eql(1)
    // expect(attributes.numberOfPages).to.eql(1)
    // expect(attributes.status).to.eql('ok')
  })
  it('should upload a file based on track id', async () => {
    // FIXME: is put the right verb? should be post?
    response = await request.put(`/user/tracks/${testTrackId}/file `).set('Authorization', `Bearer ${testAccessToken}`)

    console.log('upload a file based on track id RESPONSE: ', response.text)

    expect(response.status).to.eql()

    // const attributes = response.body
    // expect(attributes).to.be.an('object')
    // expect(attributes).to.include.keys("data", "count", "numberOfPages", "status")

    // expect(attributes.data).to.be.an('array')
    // expect(attributes.data.length).to.eql(3)

    // const theData = attributes.data[0]
    // expect(theData).to.include.keys("")
    // expect(theData.xxx).to.eql()

    // expect(attributes.count).to.eql(1)
    // expect(attributes.numberOfPages).to.eql(1)
    // expect(attributes.status).to.eql('ok')
  })
  it('should upload a cover (image?) based on trackgroup id', async () => {
    // FIXME: is put the right verb? should be post?
    response = await request.put(`/user/trackgroups/${testTrackGroupId}/cover`).set('Authorization', `Bearer ${testAccessToken}`)

    console.log('upload a cover based on trackgroup id RESPONSE: ', response.text)

    expect(response.status).to.eql(200)

    // const attributes = response.body
    // expect(attributes).to.be.an('object')
    // expect(attributes).to.include.keys("data", "count", "numberOfPages", "status")

    // expect(attributes.data).to.be.an('array')
    // expect(attributes.data.length).to.eql(3)

    // const theData = attributes.data[0]
    // expect(theData).to.include.keys("")
    // expect(theData.xxx).to.eql()

    // expect(attributes.count).to.eql(1)
    // expect(attributes.numberOfPages).to.eql(1)
    // expect(attributes.status).to.eql('ok')
  })
})
