
const {request, expect, testArtistId} = require('../testConfig') 

describe('Api.ts/artists endpoint test', () => {
  let response = null

  it('should get all artists', async () => {
    response = await request.get(`/artists`)

    expect(response.status).to.eql(200)

    const attributes = response.body
    expect(attributes).to.be.an('object')
    expect(attributes).to.include.keys("data", "count", "pages", "status")

    expect(attributes.data).to.be.an('array')
    expect(attributes.data.length).to.eql(1)

    const theData = attributes.data[0]
    //  FIXME: there is 'addressId' and 'AddressId'
    expect(theData).to.include.keys("id", "ownerId", "typeId", "displayName", "description", "shortBio", "email", "addressId", "updatedAt", "createdAt", "deletedAt", "AddressId", "TrackGroups")
    expect(theData.id).to.eql("251c01f6-7293-45f6-b8cd-242bdd76cd0d")
    expect(theData.ownerId).to.eql("17203153-e2b0-457f-929d-5abe4e322ea1")
    expect(theData.typeId).to.eql(1)
    expect(theData.displayName).to.eql("capacitor")
    expect(theData.description).to.be.null
    expect(theData.shortBio).to.be.null
    expect(theData.email).to.be.null
    expect(theData.addressId).to.be.null
    expect(theData.AddressId).to.be.null

    expect(theData.TrackGroups).to.be.an('array')
    expect(theData.TrackGroups.length).to.eql(3)
    // FIXME: need to dig into TrackGroups array and test each TG thingie
    // expect(theData.TrackGroups).to.include.keys("")

    expect(attributes.count).to.eql(30)
    expect(attributes.pages).to.eql(2)
    expect(attributes.status).to.eql('ok')
  })    
  it('should get an artist by id', async () => {
    response = await request.get(`/artists/${testArtistId}`)

    expect(response.status).to.eql(200)

    const attributes = response.body
    expect(attributes).to.be.an('object')
    expect(attributes).to.include.keys("data")

    expect(attributes.data).to.be.an('object')

    const theData = attributes.data
    //  FIXME: there is 'addressId' and 'AddressId'
    expect(theData).to.include.keys("id", "ownerId", "typeId", "displayName", "description", "shortBio", "email", "addressId", "updatedAt", "createdAt", "deletedAt", "AddressId", "User")
    expect(theData.id).to.eql("251c01f6-7293-45f6-b8cd-242bdd76cd0d")
    expect(theData.ownerId).to.eql("17203153-e2b0-457f-929d-5abe4e322ea1")
    expect(theData.typeId).to.eql(1)
    expect(theData.displayName).to.eql("capacitor")
    expect(theData.description).to.be.null
    expect(theData.shortBio).to.be.null
    expect(theData.email).to.be.null
    expect(theData.addressId).to.be.null
    expect(theData.AddressId).to.be.null

    expect(theData.User).to.be.an('object')
    expect(theData.User).to.include.keys("id", "displayName")
    expect(theData.User.id).to.eql("17203153-e2b0-457f-929d-5abe4e322ea1")
    expect(theData.User.displayName).to.eql("artist")
  })    
  it('should get an artist\'s releases by artist id', async () => {
    response = await request.get(`/artists/${testArtistId}/releases`)

    expect(response.status).to.eql(200)
  })
  it('should get an artist\'s top tracks by artist id', async () => {
    response = await request.get(`/artists/${testArtistId}/tracks/top`)

    expect(response.status).to.eql(200)
  })
})