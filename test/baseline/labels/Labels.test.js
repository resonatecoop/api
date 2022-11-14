/* eslint-disable no-unused-expressions */
/* eslint-env mocha */
const { faker } = require('@faker-js/faker')
const { UserGroupType, UserGroup, UserGroupMember, TrackGroup } = require('../../../src/db/models')
const ResetDB = require('../../ResetDB')
const { request, expect, testUserId, testArtistUserId } = require('../../testConfig')

describe('baseline/labels endpoint test', async () => {
  ResetDB()
  let response = null
  let labelType
  let artistType

  before('seed data', async () => {
    labelType = await UserGroupType.findOne({
      where: {
        name: 'label'
      }
    })
    artistType = await UserGroupType.findOne({
      where: {
        name: 'artist'
      }
    })
  })

  it('should GET /labels', async () => {
    const name = faker.company.name()
    const label = await UserGroup.create({
      typeId: labelType.id,
      ownerId: testUserId,
      displayName: name
    })

    response = await request.get('/labels')
    expect(response.status).to.eql(200)

    const attributes = response.body
    expect(attributes).to.be.an('object')
    expect(attributes).to.include.keys('data', 'count', 'pages')

    expect(attributes.data).to.be.an('array')
    expect(attributes.data.length).to.greaterThan(0)

    const theData = attributes.data[0]
    expect(theData).to.include.keys('id', 'images', 'avatar', 'banner', 'createdAt', 'deletedAt', 'description', 'displayName', 'shortBio', 'type', 'typeId', 'updatedAt')
    expect(theData.displayName).to.eql(name)
    expect(theData.id).to.eql(label.id)

    expect(attributes.count).to.eql(1)
    expect(attributes.pages).to.eql(1)
    label.destroy({ force: true })
  })

  it('should GET /labels/:id', async () => {
    const name = faker.company.name()
    const bio = faker.lorem.paragraph()

    const label = await UserGroup.create({
      typeId: labelType.id,
      shortBio: bio,
      ownerId: testUserId,
      displayName: name
    })
    response = await request.get(`/labels/${label.id}`)

    expect(response.status).to.eql(200)
    const attributes = response.body
    expect(attributes).to.be.an('object')

    expect(attributes.data).to.be.an('object')
    expect(attributes.data.displayName).to.eql(name)
    expect(attributes.data.id).to.eql(label.id)
    expect(attributes.data.links).to.eql([])
    expect(attributes.data.shortBio).to.eql(bio)

    label.destroy({ force: true })
  })

  it('should GET /labels/:id/releases', async () => {
    const trackgroupName = faker.animal.cat()
    const artist = await UserGroup.create({
      typeId: artistType.id,
      displayName: faker.company.name(),
      ownerId: testArtistUserId
    })
    const label = await UserGroup.create({
      typeId: labelType.id,
      ownerId: testUserId,
      displayName: faker.company.name()
    })
    const labelMember = await UserGroupMember.create({
      memberId: artist.id,
      belongsToId: label.id
    })
    const trackGroup = await TrackGroup.create({
      creatorId: artist.id,
      private: false,
      enabled: true,
      title: trackgroupName,
      cover: faker.datatype.uuid()
    })

    response = await request.get(`/labels/${label.id}/releases`)
    expect(response.status).to.eql(200)

    const attributes = response.body
    expect(attributes).to.be.an('object')
    expect(attributes).to.include.keys('data', 'count', 'pages')

    expect(attributes.data).to.be.an('array')
    expect(attributes.data.length).to.greaterThan(0)
    expect(attributes.data[0].creatorId).to.eql(artist.id)
    expect(attributes.data[0].id).to.eql(trackGroup.id)
    expect(attributes.data[0].title).to.eql(trackGroup.title)
    expect(attributes.data[0].creator.id).to.eql(artist.id)
    expect(attributes.data[0].creator.name).to.eql(artist.name)
    expect(attributes.data[0].creator.memberOf[0].belongsToId).to.eql(label.id)

    label.destroy({ force: true })
    artist.destroy({ force: true })
    label.destroy({ force: true })
    labelMember.destroy({ force: true })
    trackGroup.destroy({ force: true })
  })

  it('should GET /labels/:id/artists', async () => {
    const artist = await UserGroup.create({
      typeId: artistType.id,
      displayName: faker.company.name(),
      ownerId: testArtistUserId
    })
    const label = await UserGroup.create({
      typeId: labelType.id,
      ownerId: testUserId,
      displayName: faker.company.name()
    })
    const labelMember = await UserGroupMember.create({
      memberId: artist.id,
      belongsToId: label.id
    })
    response = await request.get(`/labels/${label.id}/artists`)

    expect(response.status).to.eql(200)

    const attributes = response.body
    expect(attributes).to.be.an('object')
    expect(attributes).to.include.keys('data', 'count', 'pages')

    expect(attributes.data).to.be.an('array')
    expect(attributes.data.length).to.greaterThan(0)

    expect(response.body.data[0].displayName).to.eql(artist.displayName)
    expect(response.body.data[0].id).to.eql(artist.id)

    label.destroy({ force: true })
    artist.destroy({ force: true })
    label.destroy({ force: true })
    labelMember.destroy({ force: true })
  })
})
