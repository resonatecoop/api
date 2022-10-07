/* eslint-disable no-unused-expressions */
/* eslint-env mocha */

// Examaple for how to use the MockAccessToken.js file

const { testAccessToken, testAuthUserId } = require('../testConfig')
const MockAccessToken = require('../MockAccessToken')

describe('Access token example test', () => {
  // Provides before() and after(). sets dummy accessToken, in order to test protected routes.
  MockAccessToken(testAuthUserId)

  //  FIXME: should actually get the token from Redis, then display it

  it('should do something', async () => {
    console.log('one: ', testAccessToken)
  })
  it('should do something else', async () => {
    console.log('two: ', testAuthUserId)
  })
})
