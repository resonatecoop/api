/* eslint-disable no-unused-expressions */
/* eslint-env mocha */

const { request, expect, testUserId, testAccessToken, testInvalidAccessToken } = require('../../testConfig')
const MockAccessToken = require('../../MockAccessToken')

describe('User.ts/products endpoint test', () => {
  MockAccessToken(testUserId)

  let response = null

  it('should handle no authentication / accessToken', async () => {
    response = await request.get('/user/products')

    expect(response.status).to.eql(401)
  })
  it('should handle an invalid access token', async () => {
    response = await request.get('/user/products').set('Authorization', `Bearer ${testInvalidAccessToken}`)

    expect(response.status).to.eql(401)
  })

  it('should get user products', async () => {
    response = await request.get('/user/products').set('Authorization', `Bearer ${testAccessToken}`)

    console.log('user products RESPONSE: ', response.text)

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
