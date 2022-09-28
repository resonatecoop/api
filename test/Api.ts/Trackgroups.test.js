
const { request, expect, testTrackGroupId } = require('../testConfig')

describe('Api.ts/Trackgroups endpoint test', () => {
  let response = null

  it('should get all trackgroups', async () => {
    response = await request.get(`/trackgroups`)

    expect(response.status).to.eql(200)

    const attributes = response.body
    expect(attributes).to.be.an('object')
    expect(attributes).to.include.keys("data", "count", "numberOfPages", "status")

    expect(attributes.data).to.be.an('array')
    expect(attributes.data.length).to.eql(3)    // there are three in the base track_groups table

    const theData = attributes.data[0]
    expect(theData).to.include.keys("about", "creatorId", "display_artist", "id", "slug", "tags", "title", "type", "cover_metadata", "userGroup", "uri", "images")
    expect(theData.about).to.eql('this is the best album2')
    expect(theData.creatorId).to.eql("251c01f6-7293-45f6-b8cd-242bdd76cd0d")
    expect(theData.display_artist).to.eql("Jill")
    expect(theData.id).to.eql('5e2a28a8-d767-4b94-9a16-a6403848b512')
    expect(theData.slug).to.eql('best-album-ever-2')
    expect(theData.tags).to.be.an('array')
    expect(theData.tags.length).to.eql(0)
    expect(theData.title).to.eql('Best album ever 2')
    expect(theData.type).to.eql('lp')
    expect(theData.cover_metadata).to.be.null

    expect(theData.userGroup).to.include.keys("id", "displayName")
    expect(theData.userGroup.id).to.eql("251c01f6-7293-45f6-b8cd-242bdd76cd0d")
    expect(theData.userGroup.displayName).to.eql('capacitor')

    expect(theData.uri).to.eql("http://localhost:4000/v3/trackgroups/5e2a28a8-d767-4b94-9a16-a6403848b512")

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

    expect(attributes.count).to.eql(1)
    expect(attributes.numberOfPages).to.eql(1)
    expect(attributes.status).to.eql('ok')
  })

  it('should handle request with non-existent id', async () => {
    response = await request.get(`/trackgroups/asdf`)

    expect(response.status).to.eql(400)
  })

  it('should get trackgroup by id', async () => {
    response = await request.get(`/trackgroups/${testTrackGroupId}`)

    expect(response.status).to.eql(200)

    const attributes = response.body
    expect(attributes).to.be.an('object')
    expect(attributes).to.include.keys("data", "count", "numberOfPages", "status")

    expect(attributes.data).to.be.an('array')
    expect(attributes.data.length).to.eql(3)    // there are three in the track_groups table

    const theData = attributes.data[0]
    expect(theData).to.include.keys("about", "creatorId", "display_artist", "id", "slug", "tags", "title", "type", "cover_metadata", "userGroup", "uri", "images")
    expect(theData.about).to.eql('this is the best album2')
    expect(theData.creatorId).to.eql("251c01f6-7293-45f6-b8cd-242bdd76cd0d")
    expect(theData.display_artist).to.eql("Jill")
    expect(theData.id).to.eql('5e2a28a8-d767-4b94-9a16-a6403848b512')
    expect(theData.slug).to.eql('best-album-ever-2')
    expect(theData.tags).to.be.an('array')
    expect(theData.tags.length).to.eql(0)
    expect(theData.title).to.eql('Best album ever 2')
    expect(theData.type).to.eql('lp')
    expect(theData.cover_metadata).to.be.null

    expect(theData.userGroup).to.include.keys("id", "displayName")
    expect(theData.userGroup.id).to.eql("251c01f6-7293-45f6-b8cd-242bdd76cd0d")
    expect(theData.userGroup.displayName).to.eql('capacitor')

    expect(theData.uri).to.eql("http://localhost:4000/v3/trackgroups/5e2a28a8-d767-4b94-9a16-a6403848b512")

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

    expect(attributes.count).to.eql(1)
    expect(attributes.numberOfPages).to.eql(1)
    expect(attributes.status).to.eql('ok')
  })
})