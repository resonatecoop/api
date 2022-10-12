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
  it('should get user artists by artist id', async () => {
    response = await request.get(`/user/artists/${testArtistId}`).set('Authorization', `Bearer ${testAccessToken}`)

    expect(response.status).to.eql(200)

    const attributes = response.body
    expect(attributes).to.be.an('object')
    expect(attributes).to.include.keys('data', 'status')

    expect(attributes.data).to.be.an('object')

    const theData = attributes.data
    // FIXME: has addressId and AddressId
    expect(theData).to.include.keys('id', 'ownerId', 'typeId', 'displayName', 'description', 'shortBio', 'email', 'addressId', 'updatedAt', 'createdAt', 'deletedAt', 'AddressId', 'User')
    expect(theData.id).to.eql('49d2ac44-7f20-4a47-9cf5-3ea5d6ef78f6')
    expect(theData.ownerId).to.eql('1c88dea6-0519-4b61-a279-4006954c5d4c')
    expect(theData.typeId).to.eql(1)
    expect(theData.displayName).to.eql('matrix')
    expect(theData.description).to.be.null
    expect(theData.shortBio).to.be.null
    expect(theData.email).to.be.null
    expect(theData.addressId).to.be.null
    expect(theData.updatedAt).to.eql('2022-09-28T17:31:59.495Z')
    expect(theData.createdAt).to.eql('2022-09-28T17:31:59.495Z')
    expect(theData.deletedAt).to.be.null
    expect(theData.AddressId).to.be.null

    const theUser = theData.User
    expect(theUser).to.be.an('object')
    expect(theUser).to.include.keys('id', 'displayName')
    expect(theUser.id).to.eql('1c88dea6-0519-4b61-a279-4006954c5d4c')
    expect(theUser.displayName).to.eql('artist')

    expect(attributes.status).to.eql('ok')
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
