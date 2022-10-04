/* eslint-disable no-unused-expressions */
/* eslint-env mocha */

// How to use the MockAccessToken.js file≥
const { testAccessToken, testUserId } = require('../testConfig')

describe('Access token example test', () => {
  // Provides before() and after(). sets dummy accessToken, in order to test protected routes.
  require('../MockAccessToken.js')

  it('should do something', async () => {
    console.log('one: ', testAccessToken)
  })
  it('should do something else', async () => {
    console.log('two: ', testUserId)
  })
})
