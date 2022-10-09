/* eslint-disable no-unused-expressions */
/* eslint-env mocha */

const { request, expect, testUserId, testAdminUserId, testTrackGroupId, testAccessToken, testInvalidAccessToken } = require('../testConfig')
const MockAccessToken = require('../MockAccessToken')

describe.only('User.ts/user endpoint test', () => {
  MockAccessToken(testAdminUserId)

  let response = null

  it('should handle no authentication / accessToken', async () => {
    response = await request.get('/user/profile')

    expect(response.status).to.eql(401)
  })

  it('should handle an invalid access token', async () => {
    response = await request.get('/user/profile').set('Authorization', `Bearer ${testInvalidAccessToken}`)

    expect(response.status).to.eql(401)
  })

  it('should get user profiles', async () => {
    response = await request.get('/user/profile/').set('Authorization', `Bearer ${testAccessToken}`)

    expect(response.status).to.eql(200)
    console.log('profile of user RESPONSE: ', response.text)

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

  it('should get user playlists by user id', async () => {
    response = await request.get(`/users/${testUserId}/playlists`).set('Authorization', `Bearer ${testAccessToken}`)

    console.log('playlists by user id RESPONSE: ', response.text)
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

  it('should post to user/trackgroups', async () => {
    response = await request.post('/user/trackgroups').set('Authorization', `Bearer ${testAccessToken}`)

    console.log('post to user trackgroups RESPONSE: ', response.text)

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

  it('should update user trackgroups by trackgroup id', async () => {
    response = await request.put(`/user/trackgroups/${testTrackGroupId}`).set('Authorization', `Bearer ${testAccessToken}`)

    console.log('put to user trackgroup by id RESPONSE: ', response.text)

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

  it('should get user trackgroups', async () => {
    response = await request.get('/user/trackgroups').set('Authorization', `Bearer ${testAccessToken}`)

    console.log('get user trackgroups RESPONSE: ', response.text)

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

  it('should get user trackgroups by trackgroup id', async () => {
    response = await request.get(`/user/trackgroups/${testTrackGroupId}`).set('Authorization', `Bearer ${testAccessToken}`)

    console.log('user trackgroup by trackgroup id RESPONSE: ', response.text)

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

  it('should post to a trackgroup by trackgroup id', async () => {
    response = await request.put(`/user/trackgroups/${testTrackGroupId}/items/add`).set('Authorization', `Bearer ${testAccessToken}`)

    console.log('post to a trackgroup by trackgroup id RESPONSE: ', response.text)

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

  it('should remove an item from a trackgroup by trackgroup id', async () => {
    response = await request.put(`/user/trackgroups/${testTrackGroupId}/items/remove`).set('Authorization', `Bearer ${testAccessToken}`)

    console.log('remove an item from a trackgroup by trackgroup id RESPONSE: ', response.text)

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

  it('should update trackgroup items by trackgroup id', async () => {
    response = await request.put(`/user/trackgroups/${testTrackGroupId}/items`).set('Authorization', `Bearer ${testAccessToken}`)

    console.log('update trackgroup items by trackgroup id RESPONSE: ', response.text)

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

  it('should delete from trackgroups by trackgroup id', async () => {
    response = await request.delete(`/user/trackgroups/${testTrackGroupId}`).set('Authorization', `Bearer ${testAccessToken}`)

    console.log('delete from trackgroups by trackgroup id RESPONSE: ', response.text)

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
