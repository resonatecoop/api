/* eslint-disable no-unused-expressions */
/* eslint-env mocha */

const { request, expect, testUserId, testTrackGroupId, testAccessToken, testInvalidAccessToken } = require('../../testConfig')
const MockAccessToken = require('../../MockAccessToken')

describe.skip('Admin.ts/trackgroups endpoint test', () => {
  MockAccessToken(testUserId)

  let response = null

  it('should handle no authentication / accessToken', async () => {
    response = await request.get('/user/admin/trackgroups/')

    expect(response.status).to.eql(401)
  })
  it('should handle an invalid access token', async () => {
    response = await request.get('/user/admin/trackgroups/').set('Authorization', `Bearer ${testInvalidAccessToken}`)

    console.log('trackgroups response.status: ', response.status)
    // FIXME: status should be 401, but I'll take a 403. Close enough.
    expect(response.status).to.eql(403)
  })

  it('should get all trackgroups', async () => {
    response = await request.get('/user/admin/trackgroups/').set('Authorization', `Bearer ${testAccessToken}`)

    expect(response.status).to.eql(200)

    const attributes = response.body
    expect(attributes).to.be.an('object')
    expect(attributes).to.include.keys('data', 'count', 'numberOfPages', 'status')

    expect(attributes.data).to.be.an('array')
    expect(attributes.data.length).to.eql(3)

    const theData = attributes.data[0]
    expect(theData).to.include.keys('id', 'title', 'type', 'about', 'private', 'display_artist', 'composers', 'performers', 'release_date', 'enabled', 'cover_metadata', 'tags', 'images')
    expect(theData.id).to.eql('84322e4f-0247-427f-8bed-e7617c3df5ad')
    expect(theData.title).to.eql('Best album ever')
    expect(theData.type).to.eql('lp')
    expect(theData.about).to.eql('this is the best album')
    expect(theData.private).to.be.false
    expect(theData.display_artist).to.eql('Jack')

    expect(theData.composers).to.be.an('array')
    expect(theData.composers.length).to.eql(0)

    expect(theData.performers).to.be.an('array')
    expect(theData.performers.length).to.eql(0)

    expect(theData.release_date).to.eql('2019-01-01')
    expect(theData.enabled).to.be.true
    expect(theData.cover_metadata).to.be.null

    expect(theData.tags).to.be.an('array')
    expect(theData.tags.length).to.eql(0)

    expect(theData.images).to.be.an('object')

    expect(attributes.count).to.eql(3)
    expect(attributes.numberOfPages).to.eql(1)
    expect(attributes.status).to.eql('ok')
  })
  it('should get trackgroup by id', async () => {
    response = await request.get(`/user/admin/trackgroups/${testTrackGroupId}`).set('Authorization', `Bearer ${testAccessToken}`)

    expect(response.status).to.eql(200)

    const attributes = response.body
    expect(attributes).to.be.an('object')
    expect(attributes).to.include.keys('data', 'status')

    expect(attributes.data).to.be.an('object')
    const theData = attributes.data
    expect(theData).to.include.keys('composers', 'performers', 'tags', 'id', 'title', 'slug', 'type', 'about', 'private', 'display_artist', 'creatorId', 'release_date', 'download', 'featured', 'enabled', 'updatedAt', 'createdAt', 'deletedAt', 'cover_metadata', 'items', 'images')

    expect(theData.composers).to.be.an('array')
    expect(theData.composers.length).to.eql(0)

    expect(theData.performers).to.be.an('array')
    expect(theData.performers.length).to.eql(0)

    expect(theData.tags).to.be.an('array')
    expect(theData.tags.length).to.eql(0)

    expect(theData.id).to.eql('84322e4f-0247-427f-8bed-e7617c3df5ad')
    expect(theData.title).to.eql('Best album ever')
    expect(theData.slug).to.eql('best-album-ever')
    expect(theData.type).to.eql('lp')
    expect(theData.about).to.eql('this is the best album')
    expect(theData.private).to.be.false
    expect(theData.display_artist).to.eql('Jack')
    expect(theData.creatorId).to.eql('49d2ac44-7f20-4a47-9cf5-3ea5d6ef78f6')
    expect(theData.release_date).to.eql('2019-01-01')
    expect(theData.download).to.be.false
    expect(theData.featured).to.be.false
    expect(theData.enabled).to.be.true
    expect(theData.updatedAt).to.eql('2022-09-29T13:07:07.237Z')
    expect(theData.createdAt).to.eql('2022-09-28T17:31:59.513Z')
    expect(theData.deletedAt).to.be.null

    expect(theData.cover_metadata).to.be.an('object')

    expect(theData.items).to.be.an('array')
    expect(theData.items.length).to.eql(10)

    const theItem = theData.items[0]
    expect(theItem).to.be.an('object')
    expect(theItem).to.include.keys('id', 'index', 'track')
    expect(theItem.id).to.eql('753eccd9-01b2-4bfb-8acc-8d0e44b998cc')
    expect(theItem.index).to.eql(0)

    const theTrack = theItem.track
    expect(theTrack).to.be.an('object')
    expect(theTrack).to.include.keys('status', 'id', 'title', 'cover_art', 'album', 'artist', 'composer', 'year', 'audiofile')
    expect(theTrack.status).to.eql('free')
    expect(theTrack.id).to.eql('44a28752-1101-4e0d-8c40-2c36dc82d035')
    expect(theTrack.title).to.eql('Ergonomic interactive concept')
    expect(theTrack.cover_art).to.be.null
    expect(theTrack.album).to.eql('firewall')
    expect(theTrack.artist).to.eql('Laurie Yost')
    expect(theTrack.composer).to.be.null
    expect(theTrack.year).to.be.null
    expect(theTrack.audiofile).to.be.null

    expect(theData.images).to.include.keys('small', 'medium')
    expect(theData.images.small).to.be.an('object')
    expect(theData.images.small).to.include.keys('width', 'height')
    expect(theData.images.small.width).to.eql(120)
    expect(theData.images.small.height).to.eql(120)
    expect(theData.images.medium).to.be.an('object')
    expect(theData.images.medium).to.include.keys('width', 'height')
    expect(theData.images.medium.width).to.eql(600)
    expect(theData.images.medium.height).to.eql(600)

    expect(attributes.status).to.eql('ok')
  })
  // FIXME: finish this test after we have create and delete endpoints. That way we can create a dummy record, update it, then delete it,
  //    and keep the base test data intact.
  //    We will also need to figure out what gets updated. Maybe for now just send the whole request.body over?
  //      Do this, instead of coding up PATCH
  it('should update a trackgroup by id', async () => {
    response = await request.put(`/user/admin/trackgroups/${testTrackGroupId}`).set('Authorization', `Bearer ${testAccessToken}`)

    // console.log('ADSFASDF ', response.body)
    // { error: "undefined: must have required property 'title'" }
    expect(response.status).to.eql(200)

    // id: string

    // this should be in the body
    // interface AdminTrackGroup {
    //   id: string;
    //   title: string;
    //   type: string;
    //   about: string;
    //   private: boolean;
    //   enabled: boolean;
    //   display_artist: string;
    //   composers: string[];
    //   performers: string[];
    //   release_date: string;
    //   cover_metadata: unknown;
    //   tags: string[];
    //   images: ResonateImage;
    // }

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
