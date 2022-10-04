/* eslint-disable no-unused-expressions */
/* eslint-env mocha */

//  EDIT THIS TO SUIT THE REQUIREMENTS OF THE TEST/S YOU WRITE
const { request, expect } = require('./testConfig') // change this to require('../testConfig') after you copy this template

describe('TEMPLATE endpoint test', () => {
  // If you are writing tests for endpoints that require authentication,
  //    uncomment the next line. Otherwise you can remove these three lines.
  // require('../MockAccessToken.js')

  let response = null

  it('should do something', async () => {
    response = await request.get('/')

    expect(response.status).to.eql()

    const attributes = response.body
    expect(attributes).to.be.an('object')
    expect(attributes).to.include.keys('')

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
