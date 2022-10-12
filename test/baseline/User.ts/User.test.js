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

  it('should get user trackgroups by trackgroup id', async () => {
    response = await request.get(`/user/trackgroups/${testTrackGroupId}`).set('Authorization', `Bearer ${testAccessToken}`)

    expect(response.status).to.eql(200)

    const attributes = response.body
    expect(attributes).to.be.an('object')
    expect(attributes).to.include.keys('data', 'status')

    expect(attributes.data).to.be.an('object')

    const theData = attributes.data
    expect(theData).to.include.keys('about', 'cover_metadata', 'display_artist', 'user', 'download', 'id', 'items', 'images', 'private', 'release_date', 'slug', 'tags', 'title', 'type')
    expect(theData.about).to.eql('this is the best album')

    const theCoverMetatdata = theData.cover_metadata
    expect(theCoverMetatdata).to.be.an('object')
    expect(theCoverMetatdata).to.include.keys('id')
    expect(theCoverMetatdata.id).to.be.null

    expect(theData.display_artist).to.eql('Jack')

    const theUser = theData.user
    expect(theUser).to.be.an('object')

    expect(theData.download).to.be.false
    expect(theData.id).to.eql('84322e4f-0247-427f-8bed-e7617c3df5ad')

    const theItems = theData.items
    expect(theItems).to.be.an('array')
    expect(theItems.length).to.eql(10)

    const theItem = theItems[0]
    expect(theItem).to.be.an('object')
    expect(theItem).to.include.keys('index', 'track')
    expect(theItem.index).to.eql(0)

    const theTrack = theItem.track
    expect(theTrack).to.be.an('object')
    expect(theTrack).to.include.keys('id', 'title', 'status', 'album', 'creator_id', 'artist', 'images', 'url')
    expect(theTrack.id).to.eql('44a28752-1101-4e0d-8c40-2c36dc82d035')
    expect(theTrack.title).to.eql('Ergonomic interactive concept')
    expect(theTrack.status).to.eql('free')
    expect(theTrack.album).to.eql('firewall')
    expect(theTrack.creator_id).to.eql('49d2ac44-7f20-4a47-9cf5-3ea5d6ef78f6')
    expect(theTrack.artist).to.eql('Laurie Yost')

    //  images for the track
    let theImages = theTrack.images
    expect(theImages).to.include.keys('small', 'medium', 'large')
    expect(theImages.small).to.be.an('object')
    expect(theImages.small).to.include.keys('width', 'height')
    expect(theImages.small.width).to.eql(120)
    expect(theImages.small.height).to.eql(120)
    expect(theImages.medium).to.be.an('object')
    expect(theImages.medium).to.include.keys('width', 'height')
    expect(theImages.medium.width).to.eql(600)
    expect(theImages.medium.height).to.eql(600)
    expect(theImages.large).to.be.an('object')
    expect(theImages.large).to.include.keys('width', 'height')
    expect(theImages.large.width).to.eql(1500)
    expect(theImages.large.height).to.eql(1500)

    expect(theTrack.url).to.eql('https://beta.stream.resonate.localhost/api/v3/user/stream/44a28752-1101-4e0d-8c40-2c36dc82d035')

    // images for the trackgroups
    theImages = theData.images
    expect(theImages).to.include.keys('small', 'medium', 'large')
    expect(theImages.small).to.be.an('object')
    expect(theImages.small).to.include.keys('width', 'height')
    expect(theImages.small.width).to.eql(120)
    expect(theImages.small.height).to.eql(120)
    expect(theImages.medium).to.be.an('object')
    expect(theImages.medium).to.include.keys('width', 'height')
    expect(theImages.medium.width).to.eql(600)
    expect(theImages.medium.height).to.eql(600)
    expect(theImages.large).to.be.an('object')
    expect(theImages.large).to.include.keys('width', 'height')
    expect(theImages.large.width).to.eql(1500)
    expect(theImages.large.height).to.eql(1500)

    expect(theData.private).to.be.false
    expect(theData.release_date).to.eql('2019-01-01')
    expect(theData.slug).to.eql('best-album-ever')

    expect(theData.tags).to.be.an('array')
    expect(theData.tags.length).to.eql(0)

    expect(theData.title).to.eql('Best album ever')
    expect(theData.type).to.eql('lp')

    expect(attributes.status).to.eql('ok')
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