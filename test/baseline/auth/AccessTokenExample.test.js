/* eslint-disable no-unused-expressions */
/* eslint-env mocha */

// Examaple for how to use the MockAccessToken.js file

const { expect, testAccessToken, testUserId } = require('../../testConfig')
const MockAccessToken = require('../../MockAccessToken')

describe('Access token example test', () => {
  // Provides before() and after(). sets dummy accessToken, in order to test protected routes.
  MockAccessToken(testUserId)

  //  FIXME: should actually get the token from Redis then display it, in order to confirm
  //    that is was set correctly.

  it('should have correct test access token', async () => {
    expect(testAccessToken).to.eql('test-!@#$-test-%^&*')
  })
  it('should have correct test user id', async () => {
    expect(testUserId).to.eql('17203153-e2b0-457f-929d-5abe4e322ea1')
  })
})
