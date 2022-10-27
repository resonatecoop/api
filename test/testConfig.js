
const { apiRoot } = require('../src/constants')
const expect = require('chai').expect

// We're referencing the URL _inside_ of docker.
const baseURL = `http://api:4000${apiRoot}`

const request = require('supertest')(baseURL)

const TestRedisAdapter = require('../src/auth/redis-adapter')

// generic user
const testUserId = '251c01f6-7293-45f6-b8cd-242bdd76cd0d'
// artist user from table 'users'
const testArtistUserId = '1c88dea6-0519-4b61-a279-4006954c5d4c'
// admin user from table 'users'
const testAdminUserId = '71175a23-9256-41c9-b8c1-cd2170aa6591'
// listerner user from table 'users'
const testListenerUserId = '251c01f6-7293-45f6-b8cd-242bdd76cd0d'
const testTrackGroupId = '84322e4f-0247-427f-8bed-e7617c3df5ad'
const testTagId = 'asdf'
const testArtistId = '49d2ac44-7f20-4a47-9cf5-3ea5d6ef78f6'
const testTrackId = 'b6d160d1-be16-48a4-8c4f-0c0574c4c6aa'

const testAccessToken = 'test-!@#$-test-%^&*'
const testInvalidAccessToken = 'invalid-invalid-invalid-invalid'

module.exports = {
  baseURL,
  request,
  expect,
  testUserId,
  testAdminUserId,
  testArtistUserId,
  testListenerUserId,
  testTrackGroupId,
  testTagId,
  testArtistId,
  testTrackId,
  testAccessToken,
  TestRedisAdapter,
  testInvalidAccessToken
}
