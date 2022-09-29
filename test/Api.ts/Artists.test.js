/* eslint-disable no-unused-expressions */
/* eslint-env mocha */
const { request, expect, testArtistId } = require('../testConfig')

describe('Api.ts/artists endpoint test', () => {
  let response = null

  it('should get all artists', async () => {
    response = await request.get('/artists')

    expect(response.status).to.eql(200)

    const attributes = response.body
    expect(attributes).to.be.an('object')
    expect(attributes).to.include.keys('data', 'count', 'pages', 'status')

    expect(attributes.data).to.be.an('array')
    expect(attributes.data.length).to.eql(1)

    const theData = attributes.data[0]
    //  FIXME: there is 'addressId' and 'AddressId'
    expect(theData).to.include.keys('id', 'ownerId', 'typeId', 'displayName', 'description', 'shortBio', 'email', 'addressId', 'updatedAt', 'createdAt', 'deletedAt', 'AddressId', 'TrackGroups')
    expect(theData.id).to.eql('251c01f6-7293-45f6-b8cd-242bdd76cd0d')
    expect(theData.ownerId).to.eql('17203153-e2b0-457f-929d-5abe4e322ea1')
    expect(theData.typeId).to.eql(1)
    expect(theData.displayName).to.eql('capacitor')
    expect(theData.description).to.be.null
    expect(theData.shortBio).to.be.null
    expect(theData.email).to.be.null
    expect(theData.addressId).to.be.null
    expect(theData.AddressId).to.be.null

    expect(theData.TrackGroups).to.be.an('array')
    expect(theData.TrackGroups.length).to.eql(3)

    const theTG = theData.TrackGroups[0]

    expect(theTG).to.include.keys('composers', 'performers', 'tags', 'id', 'cover', 'title', 'slug', 'type', 'about', 'private', 'display_artist', 'creatorId',
      'release_date', 'download', 'featured', 'enabled', 'updatedAt', 'createdAt', 'deletedAt', 'items')
    expect(theTG.composers).to.be.an('array')
    expect(theTG.composers.length).to.eql(0)
    expect(theTG.performers).to.be.an('array')
    expect(theTG.performers.length).to.eql(0)
    expect(theTG.tags).to.be.an('array')
    expect(theTG.tags.length).to.eql(0)
    expect(theTG.id).to.eql('c91bf101-2d3d-4181-8010-627ecce476de')
    expect(theTG.cover).to.be.null
    expect(theTG.title).to.eql('Best album ever')
    expect(theTG.slug).to.be.null
    expect(theTG.type).to.eql('lp')
    expect(theTG.about).to.eql('this is the best album')
    expect(theTG.private).to.be.false
    expect(theTG.display_artist).to.eql('Jack')
    expect(theTG.creatorId).to.eql('251c01f6-7293-45f6-b8cd-242bdd76cd0d')
    expect(theTG.release_date).to.eql('2019-01-01')
    expect(theTG.download).to.be.false
    expect(theTG.featured).to.be.false
    expect(theTG.enabled).to.be.null
    expect(theTG.updatedAt).to.eql('2022-09-20T14:53:35.763Z')
    expect(theTG.createdAt).to.eql('2022-09-20T14:53:35.763Z')
    expect(theTG.deletedAt).to.be.null

    expect(theTG.items).to.be.an('array')
    expect(theTG.items.length).to.eql(10)

    const theItem = theTG.items[0]

    expect(theItem).to.be.an('object')
    expect(theItem).to.include.keys('id', 'index', 'track_id', 'track')
    expect(theItem.id).to.eql('e619e3f8-32c1-41c2-a9b1-314976e9a368')
    expect(theItem.index).to.eql(1)
    expect(theItem.track_id).to.eql('dd6c606c-0178-4887-8735-d3f84048c521')

    expect(theItem.track).to.be.an('object')
    const theTrack = theItem.track

    expect(theTrack).to.include.keys('status', 'id', 'legacyId', 'creatorId', 'title', 'artist', 'album', 'album_artist', 'composer', 'year',
      'url', 'cover_art', 'number', 'tags', 'updatedAt', 'createdAt', 'deletedAt', 'track_url', 'track_cover_art')
    expect(theTrack.status).to.eql('free')
    expect(theTrack.id).to.eql('dd6c606c-0178-4887-8735-d3f84048c521')
    expect(theTrack.legacyId).to.be.null
    expect(theTrack.creatorId).to.eql('251c01f6-7293-45f6-b8cd-242bdd76cd0d')
    expect(theTrack.title).to.eql('De-engineered bottom-line migration')
    expect(theTrack.artist).to.eql('Jared Blick')
    expect(theTrack.album).to.eql('application')
    expect(theTrack.album_artist).to.be.null
    expect(theTrack.composer).to.be.null
    expect(theTrack.year).to.be.null
    expect(theTrack.url).to.be.null
    expect(theTrack.cover_art).to.be.null
    expect(theTrack.number).to.be.null
    expect(theTrack.tags).to.be.null
    expect(theTrack.updatedAt).to.eql('2022-09-20T14:53:35.794Z')
    expect(theTrack.createdAt).to.eql('2022-09-20T14:53:35.794Z')
    expect(theTrack.deletedAt).to.be.null
    expect(theTrack.track_url).to.be.null
    expect(theTrack.track_cover_art).to.be.null

    expect(attributes.count).to.eql(30)
    expect(attributes.pages).to.eql(2)
    expect(attributes.status).to.eql('ok')
  })
  it('should get an artist by id', async () => {
    response = await request.get(`/artists/${testArtistId}`)

    expect(response.status).to.eql(200)

    const attributes = response.body
    expect(attributes).to.be.an('object')
    expect(attributes).to.include.keys('data')

    expect(attributes.data).to.be.an('object')

    const theData = attributes.data
    //  FIXME: there is 'addressId' and 'AddressId'
    expect(theData).to.include.keys('id', 'ownerId', 'typeId', 'displayName', 'description', 'shortBio', 'email', 'addressId', 'updatedAt', 'createdAt', 'deletedAt', 'AddressId', 'User')
    expect(theData.id).to.eql('251c01f6-7293-45f6-b8cd-242bdd76cd0d')
    expect(theData.ownerId).to.eql('17203153-e2b0-457f-929d-5abe4e322ea1')
    expect(theData.typeId).to.eql(1)
    expect(theData.displayName).to.eql('capacitor')
    expect(theData.description).to.be.null
    expect(theData.shortBio).to.be.null
    expect(theData.email).to.be.null
    expect(theData.addressId).to.be.null
    expect(theData.AddressId).to.be.null

    expect(theData.User).to.be.an('object')
    expect(theData.User).to.include.keys('id', 'displayName')
    expect(theData.User.id).to.eql('17203153-e2b0-457f-929d-5abe4e322ea1')
    expect(theData.User.displayName).to.eql('artist')
  })
  it('should get an artist\'s releases by artist id', async () => {
    response = await request.get(`/artists/${testArtistId}/releases`)

    expect(response.status).to.eql(200)

    const attributes = response.body
    expect(attributes).to.be.an('object')
    expect(attributes).to.include.keys('data', 'count', 'numberOfPages', 'status')

    expect(attributes.data).to.be.an('array')
    expect(attributes.data.length).to.eql(1)

    const theData = attributes.data[0]

    expect(theData).to.include.keys('tags', 'about', 'cover', 'creatorId', 'display_artist', 'id', 'slug', 'title', 'createdAt', 'release_date', 'type',
      'cover_metadata', 'userGroup', 'items')
    expect(theData.tags).to.be.an('array')
    expect(theData.tags.length).to.eql(0)
    expect(theData.about).to.eql('this is the best album2')
    expect(theData.cover).to.be.null
    expect(theData.creatorId).to.eql('251c01f6-7293-45f6-b8cd-242bdd76cd0d')
    expect(theData.display_artist).to.eql('Jill')
    expect(theData.id).to.eql('5e2a28a8-d767-4b94-9a16-a6403848b512')
    expect(theData.slug).to.eql('best-album-ever-2')
    expect(theData.title).to.eql('Best album ever 2')
    expect(theData.createdAt).to.eql('2022-09-20T14:53:35.763Z')
    expect(theData.release_date).to.eql('2019-01-01')
    expect(theData.type).to.eql('lp')
    expect(theData.cover_metadata).to.be.null

    expect(theData.userGroup).to.be.an('object')
    expect(theData.userGroup).to.include.keys('id', 'displayName')
    expect(theData.userGroup.id).to.eql('251c01f6-7293-45f6-b8cd-242bdd76cd0d')
    expect(theData.userGroup.displayName).to.eql('capacitor')

    expect(theData.items).to.be.an('array')
    expect(theData.items.length).to.eql(10)

    const theItem = theData.items[0]
    expect(theItem).to.include.keys('id', 'index', 'track_id', 'track')
    expect(theItem.id).to.eql('c688036b-658b-467e-8188-831e78eeba9b')
    expect(theItem.index).to.eql(1)
    expect(theItem.track_id).to.eql('cd62b193-2faa-45a4-9afa-36e09305d507')

    const theTrack = theItem.track
    expect(theTrack).to.include.keys('status', 'id', 'legacyId', 'creatorId', 'title', 'artist', 'album', 'album_artist', 'composer', 'year', 'url', 'cover_art',
      'number', 'tags', 'updatedAt', 'createdAt', 'deletedAt', 'track_url', 'track_cover_art')
    expect(theTrack.status).to.eql('free')
    expect(theTrack.id).to.eql('cd62b193-2faa-45a4-9afa-36e09305d507')
    expect(theTrack.legacyId).to.be.null
    expect(theTrack.creatorId).to.eql('251c01f6-7293-45f6-b8cd-242bdd76cd0d')
    expect(theTrack.title).to.eql('Seamless bi-directional conglomeration')
    expect(theTrack.artist).to.eql('Susan Ankunding')
    expect(theTrack.album).to.eql('program')
    expect(theTrack.album_artist).to.be.null
    expect(theTrack.composer).to.be.null
    expect(theTrack.year).to.be.null
    expect(theTrack.url).to.be.null
    expect(theTrack.cover_art).to.be.null
    expect(theTrack.number).to.null
    expect(theTrack.tags).to.be.null
    expect(theTrack.updatedAt).to.eql('2022-09-20T14:53:35.797Z')
    expect(theTrack.createdAt).to.eql('2022-09-20T14:53:35.797Z')
    expect(theTrack.deletedAt).to.be.null
    expect(theTrack.track_url).to.be.null
    expect(theTrack.track_cover_art).to.be.null

    expect(attributes.count).to.eql(10)
    expect(attributes.numberOfPages).to.eql(1)
    expect(attributes.status).to.eql('ok')
  })

  it('should get an artist\'s top tracks by artist id', async () => {
    response = await request.get(`/artists/${testArtistId}/tracks/top`)

    expect(response.status).to.eql(200)

    const attributes = response.body
    expect(attributes).to.be.an('object')
    expect(attributes).to.include.keys('data')

    const theData = attributes.data
    expect(theData).to.be.an('array')
    expect(theData.length).to.eql(1)

    const theItem = theData[0]
    expect(theItem).to.include.keys('id', 'title', 'album', 'cover_metadata', 'artist', 'status', 'url', 'images')

    expect(theItem.id).to.eql('b6d160d1-be16-48a4-8c4f-0c0574c4c6aa')
    expect(theItem.title).to.eql('Organized empowering success')
    expect(theItem.album).to.eql('driver')

    expect(theItem.cover_metadata).to.be.an('object')
    expect(theItem.cover_metadata).to.include.keys('id')
    expect(theItem.cover_metadata.id).to.be.null

    expect(theItem.artist).to.eql('capacitor')
    expect(theItem.status).to.eql('Paid')
    expect(theItem.url).to.eql('https://beta.stream.resonate.localhost/api/v3/user/stream/b6d160d1-be16-48a4-8c4f-0c0574c4c6aa')

    expect(theItem.images).to.be.an('object')
    expect(theItem.images).to.include.keys('small', 'medium')
    expect(theItem.images.small).to.include.keys('width', 'height')
    expect(theItem.images.small.width).to.eql(120)
    expect(theItem.images.small.height).to.eql(120)
    expect(theItem.images.medium.width).to.eql(600)
    expect(theItem.images.medium.height).to.eql(600)
  })
})
