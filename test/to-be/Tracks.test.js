
const {request, expect, testTrackId} = require('../testConfig') 

describe('Api.ts/track endpoint test', () => {
  let response = null

  //  GET /tracks/${options.order !== "random" ? "latest" : ""}

  it('should get tracks when options.order is not \'random\'', async () => {
    response = await request.get(`/tracks/latest`)

    expect(response.status).to.eql(200)

    const attributes = response.body
    expect(attributes).to.be.an('object')
    expect(attributes).to.include.keys("data", "count", "numberOfPages")

    expect(attributes.data).to.be.an('array')
    expect(attributes.data.length).to.eql(10)

    //  FIXME: find a way to test all elements of data array. for now, just test the first one.
    const theData = attributes.data[0]
    expect(theData).to.include.keys("id", "title", "album", "cover_metadata", "artist", "status", "url", "images")
    expect(theData.id).to.eql("e8fc6dd4-f6ed-4b2b-be0f-efe9f32c3def")
    expect(theData.title).to.eql("Universal 3rd generation hardware")
    expect(theData.album).to.eql("hard drive")

    expect(theData.cover_metadata).to.include.keys("id")
    expect(theData.cover_metadata.id).to.be.null

    expect(theData.artist).to.be.null
    expect(theData.status).to.eql('Paid')
    expect(theData.url).to.eql("https://beta.stream.resonate.localhost/api/v3/user/stream/e8fc6dd4-f6ed-4b2b-be0f-efe9f32c3def")
    
    expect(theData.images).to.include.keys("small", "medium")
    expect(theData.images.small).to.include.keys("width", "height")
    expect(theData.images.small.width).to.eql(120)
    expect(theData.images.small.height).to.eql(120)
    expect(theData.images.medium).to.include.keys("width", "height")
    expect(theData.images.medium.width).to.eql(600)
    expect(theData.images.medium.height).to.eql(600)
    
    expect(attributes.count).to.eql(10)
    expect(attributes.numberOfPages).to.eql(1)
  })  

  it('should get tracks when options.order is \'random\'', async () => {
    response = await request.get(`/tracks`)

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
  it.only('should get track by id', async () => {
    response = await request.get(`/tracks/${testTrackId}`)

    expect(response.status).to.eql(200)

    const attributes = response.body
    expect(attributes).to.be.an('object')
    expect(attributes).to.include.keys("data")

    expect(attributes.data).to.be.an('object')

    const theData = attributes.data
    expect(theData).to.include.keys("id", "creatorId", "title", "album", "year", "artist", "cover_metadata", "status", "url", "images")
    expect(theData.id).to.eql("e8fc6dd4-f6ed-4b2b-be0f-efe9f32c3def")
    expect(theData.title).to.eql("Universal 3rd generation hardware")
    expect(theData.album).to.eql("hard drive")

    expect(theData.cover_metadata).to.include.keys("id")
    expect(theData.cover_metadata.id).to.be.null

    expect(theData.artist).to.eq;('capacitor')
    expect(theData.status).to.eql('Paid')
    expect(theData.url).to.eql("https://api.resonate.is/v1/stream/e8fc6dd4-f6ed-4b2b-be0f-efe9f32c3def")
    
    expect(theData.images).to.include.keys("small", "medium", "large")
    expect(theData.images.small).to.include.keys("width", "height")
    expect(theData.images.small.width).to.eql(120)
    expect(theData.images.small.height).to.eql(120)
    expect(theData.images.medium).to.include.keys("width", "height")
    expect(theData.images.medium.width).to.eql(600)
    expect(theData.images.medium.height).to.eql(600)
    expect(theData.images.large).to.include.keys("width", "height")
    expect(theData.images.large.width).to.eql(1500)
    expect(theData.images.large.height).to.eql(1500)
  })  
})