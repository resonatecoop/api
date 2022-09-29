
const { request, expect } = require('../testConfig')

describe('Api.ts/search endpoint test', () => {
  let response = null

  it('should handle no provided search term/s', async () => {
    response = await request.get('/search')

    expect(response.status).to.eql(400)
  })
  it('should return results for a search term', async () => {
    const searchTerm = 'asdf'

    response = await request.get(`/search?q=${searchTerm}`)

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
})
