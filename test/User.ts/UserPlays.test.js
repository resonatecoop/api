/* eslint-disable no-unused-expressions */
/* eslint-env mocha */

const { request, expect, testAccessToken, testInvalidAccessToken } = require('../testConfig')

describe('User.ts/user plays endpoint test', () => {
  require('../MockAccessToken')

  let response = null

  it('should handle no authentication / accessToken', async () => {
    response = await request.get('/user/plays')

    expect(response.status).to.eql(401)
  })
  it('should handle an invalid access token', async () => {
    response = await request.get('/user/plays').set('Authorization', `Bearer ${testInvalidAccessToken}`)

    expect(response.status).to.eql(401)
  })

  it('should post to user plays (all of them?)', async () => {
    response = await request.get('/user/plays').set('Authorization', `Bearer ${testAccessToken}`)

    console.log('post to user plays RESPONSE: ', response.text)

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
  it('should post to user plays buy', async () => {
    response = await request.post('/user/plays/buy').set('Authorization', `Bearer ${testAccessToken}`)

    console.log('post to user plays buy RESPONSE: ', response.text)

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
  it('should post to user plays resolve (?)', async () => {
    response = await request.get('/user/plays/resolve').set('Authorization', `Bearer ${testAccessToken}`)

    console.log('post to user plays resolve RESPONSE: ', response.text)

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
