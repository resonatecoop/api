/* eslint-disable no-unused-expressions */
/* eslint-env mocha */

const { request, expect } = require('../../testConfig')
const { faker } = require('@faker-js/faker')
const { UserGroup, UserGroupType } = require('../../../src/db/models')

describe('Api.ts/search endpoint test', () => {
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

  it('should return a usergroup with a matching search', async () => {
    const displayName = faker.name.fullName()
    const type = await UserGroupType.findOne({ where: { name: 'artist' } })

    await UserGroup.create({
      displayName: displayName,
      typeId: type.id
    })

    const response = await request.get(`/search?q=${displayName}`)

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
