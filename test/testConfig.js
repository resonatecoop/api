
const baseURL = 'http://localhost:4000/api/v3'
// const baseURL = "https://stream.resonate.coop/api/v3/"
const request = require('supertest')(baseURL)

// Do this to enable auth persistence
//      https://stackoverflow.com/questions/14001183/how-to-authenticate-supertest-requests-with-passport
const persistedRequest = require('supertest').agent(baseURL)

const expect = require('chai').expect

//  FIXME: have to switch REDIS_HOST to 127.0.0.1 and comment out REDIS_PASSWORD to get tests to run.
const TestRedisAdapter = require('../src/auth/redis-adapter')

const testUserId = '17203153-e2b0-457f-929d-5abe4e322ea1'
const testTrackGroupId = '84322e4f-0247-427f-8bed-e7617c3df5ad'
const testTagId = 'asdf'
const testLabelId = 'asdf'
const testArtistId = '49d2ac44-7f20-4a47-9cf5-3ea5d6ef78f6'
const testTrackId = 'b6d160d1-be16-48a4-8c4f-0c0574c4c6aa'

const testAccessToken = 'test-!@#$-test-%^&*'
const testInvalidAccessToken = 'invalid-invalid-invalid-invalid'

module.exports = {
  baseURL,
  request,
  persistedRequest,
  expect,
  testUserId,
  testTrackGroupId,
  testTagId,
  testLabelId,
  testArtistId,
  testTrackId,
  testAccessToken,
  TestRedisAdapter,
  testInvalidAccessToken
}
