/* eslint-disable no-unused-expressions */
/* eslint-env mocha */

const { request, expect, testAdminUserId, testAccessToken, testInvalidAccessToken } = require('../../testConfig')
const MockAccessToken = require('../../MockAccessToken')

describe('User.ts/misc user info endpoint test', () => {
  MockAccessToken(testAdminUserId)

  let response = null

  const from = '2020-01-01'
  const to = '2020-12-31'

  it('should handle no authentication / accessToken', async () => {
    response = await request.get('/user/plays/')

    expect(response.status).to.eql(401)
  })

  it('should handle an invalid access token', async () => {
    response = await request.get('/user/plays/').set('Authorization', `Bearer ${testInvalidAccessToken}`)

    expect(response.status).to.eql(401)
  })

  //  FIXME: 20221011 mb. Skip.
  //    Still debugging this, but it looks like the problem comes from
  //    .../scripts/reports/plays.js, first subQuery near line 30
  //
  //    Not clear if the code for this endpoint is correct or if it needs to be redone.
  //    Skip for now, until these issues can be resolved.
  it.skip('should get user plays within date range', async () => {
    response = await request.get(`/user/plays/stats?from=${from}&to=${to}`).set('Authorization', `Bearer ${testAccessToken}`)

    console.log('user plays within date range RESPONSE: ', response.text)

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

  // FIXME: Skipping because it uses old mysql databases
  it.skip('should get user plays history artists (?)', async () => {
    response = await request.get('/user/plays/history/artists').set('Authorization', `Bearer ${testAccessToken}`)

    console.log('user plays history artists RESPONSE: ', response.text)

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
  it('should get user collections', async () => {
    response = await request.get('/user/collection/').set('Authorization', `Bearer ${testAccessToken}`)

    expect(response.status).to.eql(200)

    const attributes = response.body
    expect(attributes).to.be.an('object')
    expect(attributes).to.include.keys('data', 'count', 'pages')

    expect(attributes.data).to.be.an('array')
    expect(attributes.data.length).to.eql(0)

    expect(attributes.count).to.eql(0)
    expect(attributes.pages).to.eql(0)
  })
  // FIXME: there are two possible endpoints here: artists.js and tracks.js
  //    not sure which one to test, or both, or...
  //    Figure this out then finish test
  it.skip('should get user plays history', async () => {
    response = await request.get('/user/plays/history/').set('Authorization', `Bearer ${testAccessToken}`)

    console.log('user plays history RESPONSE: ', response.text)

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
  it('should get user favorites', async () => {
    response = await request.get('/user/favorites').set('Authorization', `Bearer ${testAccessToken}`)

    expect(response.status).to.eql(200)

    expect(response.status).to.eql(200)

    const attributes = response.body
    expect(attributes).to.be.an('object')
    expect(attributes).to.include.keys('data', 'count', 'pages')

    expect(attributes.data).to.be.an('array')
    expect(attributes.data.length).to.eql(0)

    expect(attributes.count).to.eql(0)
    expect(attributes.pages).to.eql(0)
  })
  // FIXME: finish this test after update / delete / etc functionality is completed.
  //    getting this endpoint to work and pass test will corrupt test data.
  // NOTE: anything nested under the `/user/` route references the user who's bearer
  // token is being sent
  it.skip('should post to user favorites', async () => {
    response = await request.post('/user/favorites').set('Authorization', `Bearer ${testAccessToken}`)

    console.log('post to user favorites RESPONSE: ', response.text)

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
  // FIXME: finish this test after update / delete / etc functionality is completed.
  //    it is described as a POST but tested as a GET. figure this out first.
  //    getting this endpoint to work and pass test might corrupt test data.
  it.skip('should post to user favorites resolve (?)', async () => {
    response = await request.get('/user/favorites/resolve').set('Authorization', `Bearer ${testAccessToken}`)

    console.log('post to user favorites resolve RESPONSE: ', response.text)

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
