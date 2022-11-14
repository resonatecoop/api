/* eslint-disable no-unused-expressions */
/* eslint-env mocha */

const { request, expect, testArtistId, testArtistUserId, testAccessToken, testInvalidAccessToken } = require('../../testConfig')
const MockAccessToken = require('../../MockAccessToken')
const ResetDB = require('../../ResetDB')
const { faker } = require('@faker-js/faker')
const { UserGroupType, UserGroup } = require('../../../src/db/models')

describe('User.ts/user artist endpoint test', () => {
  ResetDB()
  MockAccessToken(testArtistUserId)

  let response = null

  it('should handle no authentication / accessToken', async () => {
    response = await request.get('/user/artists')

    expect(response.status).to.eql(401)
  })

  it('should handle an invalid access token', async () => {
    response = await request.get('/user/artists').set('Authorization', `Bearer ${testInvalidAccessToken}`)

    expect(response.status).to.eql(401)
  })

  it('should GET user/artists', async () => {
    response = await request.get('/user/artists').set('Authorization', `Bearer ${testAccessToken}`)

    expect(response.status).to.eql(200)

    const attributes = response.body
    expect(attributes).to.be.an('object')
    expect(attributes).to.include.keys('count', 'data', 'pages', 'status')

    expect(attributes.data).to.be.an('array')
    expect(attributes.data.length).to.eql(1)
    expect(attributes.data[0]).to.include.keys('trackgroups')

    expect(attributes.count).to.eql(1)
    expect(attributes.pages).to.eql(1)
    expect(attributes.status).to.eql('ok')
  })

  it('should GET user/artists/:id', async () => {
    response = await request.get(`/user/artists/${testArtistId}`).set('Authorization', `Bearer ${testAccessToken}`)

    expect(response.status).to.eql(200)

    const attributes = response.body
    expect(attributes).to.be.an('object')
    expect(attributes).to.include.keys('data', 'status')

    expect(attributes.data).to.be.an('object')

    const theData = attributes.data
    // FIXME: has addressId and AddressId
    expect(theData).to.include.keys('id', 'owner', 'avatar', 'banner', 'typeId', 'displayName', 'description', 'shortBio', 'updatedAt', 'createdAt', 'deletedAt')
    expect(theData.id).to.eql('49d2ac44-7f20-4a47-9cf5-3ea5d6ef78f6')
    expect(theData.typeId).to.eql(1)
    expect(theData.displayName).to.eql('matrix')
    expect(theData.description).to.be.null
    expect(theData.shortBio).to.be.null

    expect(theData.updatedAt).to.eql('2022-09-28T17:31:59.495Z')
    expect(theData.createdAt).to.eql('2022-09-28T17:31:59.495Z')
    expect(theData.deletedAt).to.be.null

    const theUser = theData.owner
    expect(theUser).to.be.an('object')
    expect(theUser).to.include.keys('id', 'displayName')
    expect(theUser.id).to.eql('1c88dea6-0519-4b61-a279-4006954c5d4c')
    expect(theUser.displayName).to.eql('artist')

    expect(attributes.status).to.eql('ok')
  })

  it('should handle an invalid access token', async () => {
    response = await request.post('/user/artists')
      .send({
        displayName: 'blah'
      })
      .set('Authorization', `Bearer ${testInvalidAccessToken}`)

    expect(response.status).to.eql(401)
  })

  it('should post to user/artists', async () => {
    const name = faker.name.fullName()
    const artistType = await UserGroupType.findOne({
      where: {
        name: 'artist'
      }
    })
    response = await request.post('/user/artists')
      .send({
        displayName: name
      })
      .set('Authorization', `Bearer ${testAccessToken}`)

    expect(response.status).to.eql(201)

    const { data } = response.body

    expect(data.displayName).to.eql(name)
    expect(data.typeId).to.eql(artistType.id)
    expect(data.ownerId).to.eql(testArtistUserId)

    await UserGroup.destroy({
      where: {
        id: data.id
      },
      paranoid: true
    })
  })

  it('should fail to post to user/artists if displayName not provided', async () => {
    response = await request.post('/user/artists')
      .set('Authorization', `Bearer ${testAccessToken}`)

    expect(response.status).to.eql(400)

    const { body } = response
    expect(body.message).to.contain('Bad Request')
    expect(body.errors[0].path).to.eql('displayName')
  })
})
