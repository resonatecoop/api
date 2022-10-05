/* eslint-disable no-unused-expressions */
/* eslint-env mocha */

const { request, expect, testAccessToken, testInvalidAccessToken } = require('../testConfig')

describe('Admin.ts/users endpoint test', () => {
  require('../MockAccessToken')

  let response = null

  it('should handle no authentication', async () => {
    response = await request.get('/user/admin/users/')

    expect(response.status).to.eql(401)
  })
  it('should handle an invalid access token', async () => {
    response = await request.get('/user/admin/users/').set('Authorization', `Bearer ${testInvalidAccessToken}`)

    expect(response.status).to.eql(401)
  })

  it('should get users', async () => {
    response = await request.get('/user/admin/users/').set('Authorization', `Bearer ${testAccessToken}`)

    console.log('all users RESPONSE: ', response.text)

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
  it('should get user by id', async () => {
    response = await request.get('/user/admin/users/$testUserId}').set('Authorization', `Bearer ${testAccessToken}`)

    console.log('user by id RESPONSE: ', response.text)

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
