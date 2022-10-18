/* eslint-disable no-unused-expressions */
/* eslint-env mocha */

const { request, expect, testTrackGroupId } = require('../../testConfig')

describe('Api.ts/Trackgroups endpoint test', () => {
  let response = null

  it('should GET /trackgroups', async () => {
    response = await request.get('/trackgroups')

    expect(response.status).to.eql(200)

    const attributes = response.body
    expect(attributes).to.be.an('object')
    expect(attributes).to.include.keys('data', 'count', 'numberOfPages', 'status')

    expect(attributes.data).to.be.an('array')
    expect(attributes.data.length).to.eql(3) // there are three in the base track_groups table

    const theData = attributes.data[0]
    expect(theData).to.include.keys('about', 'creatorId', 'display_artist', 'id', 'slug', 'tags', 'title', 'type', 'cover_metadata', 'creator', 'uri', 'images')
    expect(theData.about).to.eql('this is the best album')
    expect(theData.creatorId).to.eql('49d2ac44-7f20-4a47-9cf5-3ea5d6ef78f6')
    expect(theData.display_artist).to.eql('Jack')
    expect(theData.id).to.eql('84322e4f-0247-427f-8bed-e7617c3df5ad')
    expect(theData.slug).to.eql('best-album-ever')
    expect(theData.tags).to.be.an('array')
    expect(theData.tags.length).to.eql(0)
    expect(theData.title).to.eql('Best album ever')
    expect(theData.type).to.eql('lp')
    expect(theData.cover_metadata).to.be.null

    expect(theData.creator).to.include.keys('id', 'displayName')
    expect(theData.creator.id).to.eql('49d2ac44-7f20-4a47-9cf5-3ea5d6ef78f6')
    expect(theData.creator.displayName).to.eql('matrix')

    expect(theData.uri).to.eql('http://localhost:4000/v3/trackgroups/84322e4f-0247-427f-8bed-e7617c3df5ad')

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

    expect(attributes.count).to.eql(3)
    expect(attributes.numberOfPages).to.eql(1)
    expect(attributes.status).to.eql('ok')
  })

  it('should handle request with non-existent id', async () => {
    response = await request.get('/trackgroups/asdf')

    expect(response.status).to.eql(400)
  })

  it('should GET trackgroups/:id', async () => {
    response = await request.get(`/trackgroups/${testTrackGroupId}`)

    expect(response.status).to.eql(200)

    const attributes = response.body
    expect(attributes).to.be.an('object')
    expect(attributes).to.include.keys('data', 'status')

    expect(attributes.data).to.be.an('object')

    const theData = attributes.data
    expect(theData).to.include.keys('about', 'cover_metadata', 'creatorId', 'display_artist', 'creator', 'download', 'id', 'items', 'images', 'private', 'release_date', 'slug', 'tags', 'title', 'type')
    expect(theData.about).to.eql('this is the best album')

    expect(theData.cover_metadata).to.be.an('object')
    expect(theData.cover_metadata).to.include.keys('id')
    expect(theData.cover_metadata.id).to.be.null

    expect(theData.creatorId).to.eql('49d2ac44-7f20-4a47-9cf5-3ea5d6ef78f6')
    expect(theData.display_artist).to.eql('Jack')

    expect(theData.creator).to.be.an('object')
    expect(theData.creator).to.include.keys('displayName', 'id')
    expect(theData.creator.displayName).to.eql('matrix')
    expect(theData.creator.id).to.eql('49d2ac44-7f20-4a47-9cf5-3ea5d6ef78f6')

    expect(theData.download).to.be.false
    expect(theData.id).to.eql('84322e4f-0247-427f-8bed-e7617c3df5ad')

    expect(theData.items).to.be.an('array')
    expect(theData.items.length).to.eql(10)

    const theItem = theData.items[0]
    expect(theItem).to.be.an('object')
    expect(theItem).to.include.keys('index', 'track')
    expect(theItem.index).to.eql(0)

    const theTrack = theItem.track
    expect(theTrack).to.be.an('object')
    expect(theTrack).to.include.keys('id', 'title', 'status', 'album', 'artistId', 'artist', 'images', 'url')
    expect(theTrack.id).to.eql('44a28752-1101-4e0d-8c40-2c36dc82d035')
    expect(theTrack.title).to.eql('Ergonomic interactive concept')
    expect(theTrack.status).to.eql('free')
    expect(theTrack.album).to.eql('firewall')
    expect(theTrack.artistId).to.eql('49d2ac44-7f20-4a47-9cf5-3ea5d6ef78f6')
    expect(theTrack.artist).to.eql('Laurie Yost')
    expect(theTrack.images).to.be.an('object')
    expect(theTrack.images).to.include.keys('small', 'medium')
    expect(theTrack.images.small).to.include.keys('width', 'height')
    expect(theTrack.images.small.width).to.eql(120)
    expect(theTrack.images.small.height).to.eql(120)
    expect(theTrack.images.medium).to.include.keys('width', 'height')
    expect(theTrack.images.medium.width).to.eql(600)
    expect(theTrack.images.medium.height).to.eql(600)

    expect(theData.images).to.include.keys('small', 'medium')
    expect(theData.images.small).to.include.keys('width', 'height')
    expect(theData.images.small.width).to.eql(120)
    expect(theData.images.small.height).to.eql(120)
    expect(theData.images.medium).to.include.keys('width', 'height')
    expect(theData.images.medium.width).to.eql(600)
    expect(theData.images.medium.height).to.eql(600)

    expect(theData.private).to.be.false
    expect(theData.release_date).to.eql('2019-01-01')
    expect(theData.slug).to.eql('best-album-ever')
    expect(theData.tags).to.be.an('array')
    expect(theData.tags.length).to.eql(0)
    expect(theData.title).to.eql('Best album ever')
    expect(theData.type).to.eql('lp')

    expect(attributes.status).to.eql('ok')
  })
})
