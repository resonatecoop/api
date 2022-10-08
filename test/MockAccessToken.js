/* eslint-env mocha */

// require this in tests that need accessToken-based authentication.
//    const MockAccessToken = require('../MockAccessToken')

//    In the test's primary 'describe' block, put
//      MockAccessToken(some.user.id)
//      as the first line inside of the describe block
//    Look at test/auth/AccessTokenExample.test.js for more infos

const { TestRedisAdapter, testAccessToken } = require('./testConfig')

const MockAccessToken = (userId) => {
  // get a Redis
  const adapter = new TestRedisAdapter('AccessToken')

  // Give a test access token to a Redis. Then Redis will believe there is a valid login.
  before('send access token to Redis', () => {
    adapter.upsert(testAccessToken, {
      accountId: userId
    })
  })
  // Remove a test access token from a Redis.
  after('remove access token from Redis', () => {
    adapter.destroy(testAccessToken)
  })
}

module.exports = MockAccessToken
