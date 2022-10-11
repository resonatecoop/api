/* eslint-disable no-unused-expressions */
/* eslint-env mocha */

const { request, expect, testArtistId, testAdminUserId, testAccessToken, testInvalidAccessToken } = require('../../testConfig')
const MockAccessToken = require('../../MockAccessToken')

describe('User.ts/user artist endpoint test', () => {
  MockAccessToken(testAdminUserId)

  let response = null

  it('should handle no authentication / accessToken', async () => {
    response = await request.get('/user/artists')

    expect(response.status).to.eql(401)
  })
  it('should handle an invalid access token', async () => {
    response = await request.get('/user/artists').set('Authorization', `Bearer ${testInvalidAccessToken}`)

    expect(response.status).to.eql(401)
  })

  it('should get user artists', async () => {
    response = await request.get('/user/artists').set('Authorization', `Bearer ${testAccessToken}`)

    expect(response.status).to.eql(200)

    const attributes = response.body
    expect(attributes).to.be.an('object')
    expect(attributes).to.include.keys('count', 'data', 'pages', 'status')

    expect(attributes.data).to.be.an('array')
    expect(attributes.data.length).to.eql(0)

    expect(attributes.count).to.eql(0)
    expect(attributes.pages).to.eql(0)
    expect(attributes.status).to.eql('ok')
  })

  //  FIXME: 20221011 mb. Skip.
  //  Returns error:
  //    {"status":404,"message":"User is associated to UserGroup using an alias. You've included an alias (user), but it does not match the alias(es) defined in your association (User).","data":null}
  //  Not clear if:
  //    - The use case for this endpoint is correct
  //    - The code for this endpoint is correct
  //    - The data for this endpoint is correct
  //
  //    Can't find an instance of message 'User is associated to UserGroup using an alias. You've included an alias ...' anywhere in the codebase, so
  //      it's difficult to find where the error is actually thrown. It has to be somewhere, but I just can't find it
  //
  //    The assumption is that an admin user should be able to look at a user's artists, by artist id. No idea what this UserGroup / alias / association
  //      business is about
  //
  //    It is very possible that I'm missing something simple / obvious here, but as-built this endpoint doesn't make sense
  //      - So, skip for now, until we can resolve these issues
  //
  it.skip('should get user artists by artist id', async () => {
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

  // FIXME: finish this test after update / delete / etc functionality is completed.
  //    getting this endpoint to work and pass test will corrupt test data.
  it.skip('should post to user artists', async () => {
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
