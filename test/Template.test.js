
const { request, expect } = require('../../testConfig')

describe('TEMPLATE endpoint test', () => {
  let response = null

  it('should do something', async () => {
    response = await request.get('/')

    expect(response.status).to.eql()

    const attributes = response.body
    expect(attributes).to.be.an('object')
    expect(attributes).to.include.keys('data', 'count', 'numberOfPages', 'status')

    expect(attributes.data).to.be.an('array')
    expect(attributes.data.length).to.eql(3)

    const theData = attributes.data[0]
    expect(theData).to.include.keys('')
    expect(theData.xxx).to.eql()

    expect(attributes.count).to.eql(1)
    expect(attributes.numberOfPages).to.eql(1)
    expect(attributes.status).to.eql('ok')
  })
})
