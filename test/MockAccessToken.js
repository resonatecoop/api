/* eslint-env mocha */

// Technically, this doesn't really look like a 'mock' function thing, but
//    hopefully you get the idea behind it.
// 'require' this in tests that need to pass accessToken-based authentication.
//    In the test's primary 'describe' block, enter
//      require('../BeforeAndAfter.js')
//      as the first line inside of the describe block
//    Look at test/auth/AccessTokenExample.test.js for more infos

const { TestRedisAdapter, testAccessToken, testUserId } = require('./testConfig')

// get a Redis
const adapter = new TestRedisAdapter()

// Give a test access token to a Redis. Then Redis will believe there is a valid login.
before('send access token to Redis', () => {
  adapter.upsert(testAccessToken, {
    accountId: testUserId
  })
})
// Remove a test access token from a Redis. Because we are thoughtful and clean up
//    after ourselves.
after('remove access token from Redis', () => {
  adapter.destroy(testAccessToken)
  //  FIXME: should also remove / disconnect / destroy adapter
  //      does this simply happen by itself when the test exits?
})
