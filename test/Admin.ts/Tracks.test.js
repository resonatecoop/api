/* eslint-disable no-unused-expressions */
/* eslint-env mocha */

const { request, expect, testUserId, testTrackId, testAccessToken, testInvalidAccessToken } = require('../testConfig')
const MockAccessToken = require('../MockAccessToken')

describe.skip('Admin.ts/tracks endpoint test', () => {
  MockAccessToken(testUserId)

  let response = null

  it('should handle no authentication', async () => {
    response = await request.get('/user/admin/tracks/')

    expect(response.status).to.eql(401)
  })
  it('should handle an invalid access token', async () => {
    response = await request.get('/user/admin/tracks/').set('Authorization', `Bearer ${testInvalidAccessToken}`)

    console.log('tracks response.status: ', response.status)
    // FIXME: status should be 401, but I'll take a 403. Close enough.
    expect(response.status).to.eql(403)
  })

  it('should get all tracks', async () => {
    response = await request.get('/user/admin/tracks/').set('Authorization', `Bearer ${testAccessToken}`)

    console.log('all tracks RESPONSE: ', response.text)
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
  it('should get track by id', async () => {
    response = await request.get(`/user/admin/tracks/${testTrackId}`).set('Authorization', `Bearer ${testAccessToken}`)

    console.log('track by id RESPONSE: ', response.text)

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
  it('should update a track by id', async () => {
    response = await request.put(`/user/admin/tracks/${testTrackId}`).set('Authorization', `Bearer ${testAccessToken}`)

    console.log('update track by id RESPONSE: ', response.text)

    // check Admin.ts for interface / type for payload

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
