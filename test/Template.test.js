/* eslint-disable no-unused-expressions */
/* eslint-env mocha */

//  EDIT THIS TO SUIT THE REQUIREMENTS OF THE TEST/S YOU WRITE
const { request, expect } = require('./testConfig') // change this to require('../testConfig') after you copy this template
// uncomment MockAccessToken if you need to test protected routes.
//    look at auth/AccessTokenExample.test.js for infos.
// const MockAccessToken = require('../MockAccessToken')

describe('TEMPLATE endpoint test', () => {
  // If you are writing tests for endpoints that require authentication,
  //    uncomment the next line. Otherwise you can remove these three lines.
  // MockAccessToken(some.test.user.id)

  let response = null

  it('should do something', async () => {
    response = await request.get('/')

    expect(response.status).to.eql(404)

    // Uncomment these lines to start testing the response from the endpoint
    // const attributes = response.body
    // expect(attributes).to.be.an('object')
    // expect(attributes).to.include.keys('')

    // expect(attributes.data).to.be.an('array')
    // expect(attributes.data.length).to.eql(3)

    // const theData = attributes.data[0]
    // expect(theData).to.include.keys('')
    // expect(theData.xxx).to.eql()

    // expect(attributes.count).to.eql(1)
    // expect(attributes.numberOfPages).to.eql(1)
    // expect(attributes.status).to.eql('ok')
  })
})
