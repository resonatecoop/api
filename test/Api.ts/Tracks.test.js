/* eslint-disable no-unused-expressions */
/* eslint-env mocha */
const { request, expect, testTrackId } = require('../testConfig')

describe('Api.ts/track endpoint test', () => {
  let response = null

  it('should get tracks when options.order is not \'random\'', async () => {
    //  GET /tracks/${options.order !== "random" ? "latest" : ""}
    //    if the endpoint call has options.order NOT 'random', add 'latest' to end of endpoint
    response = await request.get('/tracks/latest')

    expect(response.status).to.eql(200)

    const attributes = response.body
    expect(attributes).to.be.an('object')
    expect(attributes).to.include.keys('data', 'count', 'numberOfPages')

    expect(attributes.data).to.be.an('array')
    expect(attributes.data.length).to.eql(30)

    //  FIXME: find a way to test all elements of data array. for now, just test the first one.
    const theData = attributes.data[0]
    expect(theData).to.include.keys('id', 'title', 'album', 'cover_metadata', 'artist', 'status', 'url', 'images')
    expect(theData.id).to.eql('44a28752-1101-4e0d-8c40-2c36dc82d035')
    expect(theData.title).to.eql('Ergonomic interactive concept')
    expect(theData.album).to.eql('firewall')

    expect(theData.cover_metadata).to.include.keys('id')
    expect(theData.cover_metadata.id).to.be.null

    expect(theData.artist).to.be.null
    expect(theData.status).to.eql('Paid')
    expect(theData.url).to.eql('https://beta.stream.resonate.localhost/api/v3/user/stream/44a28752-1101-4e0d-8c40-2c36dc82d035')

    expect(theData.images).to.include.keys('small', 'medium')
    expect(theData.images.small).to.include.keys('width', 'height')
    expect(theData.images.small.width).to.eql(120)
    expect(theData.images.small.height).to.eql(120)
    expect(theData.images.medium).to.include.keys('width', 'height')
    expect(theData.images.medium.width).to.eql(600)
    expect(theData.images.medium.height).to.eql(600)

    expect(attributes.count).to.eql(30)
    expect(attributes.numberOfPages).to.eql(1)
  })

  it('should get tracks when options.order is \'random\'', async () => {
    //  GET /tracks/${options.order !== "random" ? "latest" : ""}
    //    if the endpoint call has options.order is 'random', add nothing to end of endpoint
    response = await request.get('/tracks')

    expect(response.status).to.eql(200)

    const attributes = response.body
    expect(attributes).to.be.an('object')
    expect(attributes).to.include.keys('data', 'count', 'numberOfPages', 'status')

    expect(attributes.data).to.be.an('array')
    expect(attributes.data.length).to.eql(31)

    const theData = attributes.data[0]
    expect(theData).to.be.an('object')
    expect(theData).to.include.keys('id', 'title', 'album', 'year', 'cover_metadata', 'artist', 'status', 'url', 'images')

    expect(theData.id).to.eql('fcf41302-e549-4ab9-9937-f0bfead5a44f')
    expect(theData.title).to.eql('Virtual clear-thinking standardization')
    expect(theData.album).to.eql('driver')
    expect(theData.year).to.be.null

    expect(theData.cover_metadata).to.be.an('object')
    expect(theData.cover_metadata).to.include.keys('id')
    expect(theData.cover_metadata.id).to.be.null

    expect(theData.artist).to.be.null
    expect(theData.status).to.eql('Paid')
    expect(theData.url).to.eql('https://beta.stream.resonate.localhost/api/v3/user/stream/fcf41302-e549-4ab9-9937-f0bfead5a44f')

    expect(theData.images).to.be.an('object')
    expect(theData.images).to.include.keys('small', 'medium')
    expect(theData.images.small).to.include.keys('width', 'height')
    expect(theData.images.small.width).to.eql(120)
    expect(theData.images.small.height).to.eql(120)
    expect(theData.images.medium).to.include.keys('width', 'height')
    expect(theData.images.medium.width).to.eql(600)
    expect(theData.images.medium.height).to.eql(600)

    expect(attributes.count).to.eql(31)
    expect(attributes.numberOfPages).to.eql(1)
    expect(attributes.status).to.eql('ok')
  })
  it('should get track by id', async () => {
    response = await request.get(`/tracks/${testTrackId}`)

    expect(response.status).to.eql(200)

    const attributes = response.body
    expect(attributes).to.be.an('object')
    expect(attributes).to.include.keys('data')

    expect(attributes.data).to.be.an('object')

    const theData = attributes.data
    expect(theData).to.include.keys('id', 'creatorId', 'title', 'album', 'year', 'artist', 'cover_metadata', 'status', 'url', 'images')
    expect(theData.id).to.eql('b6d160d1-be16-48a4-8c4f-0c0574c4c6aa')
    expect(theData.creatorId).to.eql('49d2ac44-7f20-4a47-9cf5-3ea5d6ef78f6')
    expect(theData.title).to.eql('Sharable maximized utilisation')
    expect(theData.album).to.eql('hard drive')
    expect(theData.year).to.be.null
    expect(theData.artist).to.eq; ('matrix')

    expect(theData.cover_metadata).to.be.an('object')

    expect(theData.status).to.eql('Paid')
    expect(theData.url).to.eql('https://api.resonate.is/v1/stream/b6d160d1-be16-48a4-8c4f-0c0574c4c6aa')

    expect(theData.images).to.include.keys('small', 'medium', 'large')
    expect(theData.images.small).to.include.keys('width', 'height')
    expect(theData.images.small.width).to.eql(120)
    expect(theData.images.small.height).to.eql(120)
    expect(theData.images.medium).to.include.keys('width', 'height')
    expect(theData.images.medium.width).to.eql(600)
    expect(theData.images.medium.height).to.eql(600)
    expect(theData.images.large).to.include.keys('width', 'height')
    expect(theData.images.large.width).to.eql(1500)
    expect(theData.images.large.height).to.eql(1500)
  })
})
