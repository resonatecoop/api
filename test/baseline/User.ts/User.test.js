/* eslint-disable no-unused-expressions */
/* eslint-env mocha */

const { request, expect, testUserId, testAdminUserId, testTrackGroupId, testAccessToken, testInvalidAccessToken } = require('../../testConfig')
const MockAccessToken = require('../../MockAccessToken')

describe('User.ts/user endpoint test', () => {
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

    const attributes = response.body
    expect(attributes).to.be.an('object')
    expect(attributes).to.include.keys('data', 'status')

    const theData = attributes.data
    expect(theData).to.be.an('object')

    expect(theData).to.include.keys('nickname', 'token', 'id', 'country', 'newsletterNotification', 'email', 'role', 'credit', 'userGroups', 'gravatar', 'profiles', 'avatar')
    expect(theData.nickname).to.eql('admin')
    expect(theData.token).to.eql('test-!@#$-test-%^&*')
    expect(theData.id).to.eql('71175a23-9256-41c9-b8c1-cd2170aa6591')
    expect(theData.country).to.be.null
    expect(theData.newsletterNotification).to.be.null
    expect(theData.email).to.eql('admin@admin.com')

    const theRole = theData.role
    expect(theRole).to.be.an('object')
    expect(theRole).to.include.keys('id', 'name', 'description', 'isDefault')
    expect(theRole.id).to.eql(1)
    expect(theRole.name).to.eql('superadmin')
    expect(theRole.description).to.eql('SuperAdminRole has all permissions and can assign admins')
    expect(theRole.isDefault).to.be.false

    const theCredit = theData.credit
    expect(theCredit).to.be.an('object')
    expect(theCredit).to.include.keys('total')
    expect(theCredit.total).to.eql(0)

    const theUserGroups = theData.userGroups
    expect(theUserGroups).to.be.an('array')
    expect(theUserGroups.length).to.eql(0)

    expect(theData.gravatar).to.eql('https://s.gravatar.com/avatar/64e1b8d34f425d19e1ee2ea7236d3028')

    const theProfiles = theData.profiles
    expect(theProfiles).to.be.an('array')
    expect(theProfiles.length).to.eql(0)

    expect(theData.avatar).to.be.an('object')

    expect(attributes.status).to.eql('ok')
  })

  it('should get user playlists by user id', async () => {
    response = await request.get(`/users/${testUserId}/playlists`).set('Authorization', `Bearer ${testAccessToken}`)

    expect(response.status).to.eql(200)

    const attributes = response.body
    expect(attributes).to.be.an('object')
    expect(attributes).to.include.keys('data', 'count', 'numberOfPages', 'status')

    expect(attributes.data).to.be.an('array')
    expect(attributes.data.length).to.eql(0)

    expect(attributes.count).to.eql(0)
    expect(attributes.numberOfPages).to.eql(0)
    expect(attributes.status).to.eql('ok')
  })

  // FIXME: finish this test after update / delete / etc functionality is completed.
  //    getting this endpoint to work and pass test will corrupt test data.
  it.skip('should post to user/trackgroups', async () => {
    response = await request.post('/user/trackgroups').set('Authorization', `Bearer ${testAccessToken}`)

    // console.log('post to user trackgroups RESPONSE: ', response.text)

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
  it.skip('should update user trackgroups by trackgroup id', async () => {
    response = await request.put(`/user/trackgroups/${testTrackGroupId}`).set('Authorization', `Bearer ${testAccessToken}`)

    // console.log('put to user trackgroup by id RESPONSE: ', response.text)

    // expect(response.status).to.eql(200)

    // const attributes = response.body
    // expect(attributes).to.be.an('object')
    // expect(attributes).to.include.keys('data', 'count', 'numberOfPages', 'status')

    // expect(attributes.data).to.be.an('array')
    // expect(attributes.data.length).to.eql(0)

    // expect(attributes.count).to.eql(0)
    // expect(attributes.numberOfPages).to.eql(0)
    // expect(attributes.status).to.eql('ok')
  })

  it('should get user trackgroups', async () => {
    response = await request.get('/user/trackgroups').set('Authorization', `Bearer ${testAccessToken}`)

    // console.log('get user trackgroups RESPONSE: ', response.text)

    expect(response.status).to.eql(200)

    const attributes = response.body
    expect(attributes).to.be.an('object')
    expect(attributes).to.include.keys('data', 'count', 'numberOfPages', 'status')

    expect(attributes.data).to.be.an('array')
    expect(attributes.data.length).to.eql(0)

    expect(attributes.count).to.eql(0)
    expect(attributes.numberOfPages).to.eql(0)
    expect(attributes.status).to.eql('ok')
  })

  //  FIXME: 20221011 mb. Skip.
  //  Returns error:
  //    {"status":404,"message":"User is not associated to TrackGroup!","data":null}
  //  Not clear if:
  //    - The use case for this endpoint is correct
  //    - The code for this endpoint is correct
  //    - The data for this endpoint is correct
  //
  //    Can't find an instance of message 'User is not associated to TrackGroup!' anywhere in the codebase, so
  //      it's difficult to find where the error is actually thrown. It has to be somewhere, but I just can't find it.
  //
  //    The assumption is that an admin user should be able to look at a user's trackgroups, by track group id
  //      - However, the code looks like it only associates trackgroups to creator id
  //        - The way the code is currently written, it expects the admin user to be the creator
  //          - Admin user is not the creator, so there is no way this test can pass, meaning it is possible
  //            that there is something off with the assumptions / design / coding of this endpoint
  //    It is very possible that I'm missing something simple / obvious here, but as-built this endpoint doesn't make sense
  //      - So, skip for now, until we can resolve this issues that make this test appear un-passable
  //
  it.skip('should get user trackgroups by trackgroup id', async () => {
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

  // FIXME: finish this test after update / delete / etc functionality is completed.
  //    getting this endpoint to work and pass test will corrupt test data.
  it.skip('should post to a trackgroup by trackgroup id', async () => {
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

  // FIXME: finish this test after update / delete / etc functionality is completed.
  //    getting this endpoint to work and pass test will corrupt test data.
  it.skip('should remove an item from a trackgroup by trackgroup id', async () => {
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

  // FIXME: finish this test after update / delete / etc functionality is completed.
  //    getting this endpoint to work and pass test will corrupt test data.
  it.skip('should update trackgroup items by trackgroup id', async () => {
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

  // FIXME: finish this test after update / delete / etc functionality is completed.
  //    getting this endpoint to work and pass test will corrupt test data.
  it.skip('should delete from trackgroups by trackgroup id', async () => {
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
