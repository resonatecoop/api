/* eslint-disable no-unused-expressions */
/* eslint-env mocha */

const { request, expect, testArtistUserId } = require('../../testConfig')
const { faker } = require('@faker-js/faker')
const { UserGroup, UserGroupType } = require('../../../src/db/models')
const ResetDB = require('../../ResetDB')

describe('baseline/search endpoint test', () => {
  ResetDB()

  it('should handle no provided search term/s', async () => {
    const response = await request.get('/search')

    expect(response.status).to.eql(400)
  })

  it('should return empty results for a search term', async () => {
    const searchTerm = 'asdf'

    const response = await request.get(`/search?q=${searchTerm}`)
    expect(response.status).to.eql(200)
    expect(response.body.data).to.include.keys('artists', 'labels', 'tracks', 'trackgroups', 'bands')
  })

  it('should GET /search?q=', async () => {
    const displayName = faker.name.fullName()
    const type = await UserGroupType.findOne({ where: { name: 'artist' } })

    await UserGroup.create({
      displayName: displayName,
      ownerId: testArtistUserId,
      typeId: type.id
    })

    const response = await request.get(`/search?q=${displayName}`)
    console.log('response', response.body)
    expect(response.status).to.eql(200)
    expect(response.body.data.artists[0].displayName).to.eql(displayName)

    await UserGroup.destroy({
      where: {
        displayName,
        typeId: type.id
      },
      force: true
    })
  })
})
