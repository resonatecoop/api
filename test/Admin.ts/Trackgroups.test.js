/* eslint-disable no-unused-expressions */
/* eslint-env mocha */
// endpoints access token
//    probably need the supertest persist whatever thing

const { request, expect, testTrackGroupId } = require('../testConfig')

describe('Admin.ts/trackgroups endpoint test', () => {
  let response = null

  it('should handle no authentication', async () => {
    response = await request.get('/user/admin/trackgroups/')

    expect(response.status).to.eql(401)
  })

  it('should get all trackgroups', async () => {
    response = await request.get('/user/admin/trackgroups/')

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
  it('should get trackgroup by id', async () => {
    response = await request.get(`/user/admin/trackgroups/${testTrackGroupId}`)

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
  it('should update a trackgroup by id', async () => {
    response = await request.put(`/user/admin/trackgroups/${testTrackGroupId}`)

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
