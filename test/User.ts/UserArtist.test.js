/* eslint-disable no-unused-expressions */
/* eslint-env mocha */

const { request, expect, testUserId, testArtistId, testAccessToken, testInvalidAccessToken } = require('../testConfig')
const MockAccessToken = require('../MockAccessToken')

describe.skip('User.ts/user artist endpoint test', () => {
  MockAccessToken(testUserId)

  let response = null

  it('should handle no authentication / accessToken', async () => {
    response = await request.get('/user/artists')

    expect(response.status).to.eql(401)
  })
  it('should handle an invalid access token', async () => {
    response = await request.get('/user/artists').set('Authorization', `Bearer ${testInvalidAccessToken}`)

    // FIXME: response.status should be 401, not 404
    expect(response.status).to.eql(404)
  })

  it('should get user artists', async () => {
    response = await request.get('/user/artists').set('Authorization', `Bearer ${testAccessToken}`)

    console.log('all user artists RESPONSE: ', response.text)

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
  it('should user artists by artist id', async () => {
    response = await request.get(`/user/artists/${testArtistId}`).set('Authorization', `Bearer ${testAccessToken}`)

    console.log('user artists by artist id RESPONSE: ', response.text)

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
  it('should post to user artists', async () => {
    response = await request.post('/user/artists').set('Authorization', `Bearer ${testAccessToken}`)

    console.log('post to user artists RESPONSE: ', response.text)

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
