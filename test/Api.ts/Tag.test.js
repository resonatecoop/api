
const { request, expect, testTagId } = require('../testConfig')

describe('Api.ts/tag endpoint test', () => {
  let response = null

  it('should get a tag by id', async () => {
    response = await request.get(`/tag/${testTagId}`)

    expect(response.status).to.eql(200)

    const attributes = response.body
    expect(attributes).to.be.an('object')
    expect(attributes).to.include.keys("id", "type", "name")

    // expect(attributes.data).to.be.an('array')
    // expect(attributes.data.length).to.be.greaterThan(0)

    // const theData = attributes.data[0]
    // expect(theData).to.include.keys("")
    // expect(theData.xxx).to.eql()

    // expect(attributes.count).to.eql(1)
    // expect(attributes.numberOfPages).to.eql(1)
    // expect(attributes.status).to.eql('ok')

  })
})