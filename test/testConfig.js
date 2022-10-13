
const baseURL = `${process.env.APP_HOST}/api/v3`
const request = require('supertest')(baseURL)

const expect = require('chai').expect
const { faker } = require('@faker-js/faker')

const TestRedisAdapter = require('../src/auth/redis-adapter')

// generic user
const testUserId = '17203153-e2b0-457f-929d-5abe4e322ea1'
// artist user from table 'users'
const testArtistUserId = '1c88dea6-0519-4b61-a279-4006954c5d4c'
// admin user from table 'users'
const testAdminUserId = '71175a23-9256-41c9-b8c1-cd2170aa6591'
// listerner user from table 'users'
const testListenerUserId = '251c01f6-7293-45f6-b8cd-242bdd76cd0d'
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
  expect,
  faker,
  testUserId,
  testAdminUserId,
  testArtistUserId,
  testListenerUserId,
  testTrackGroupId,
  testTagId,
  testLabelId,
  testArtistId,
  testTrackId,
  testAccessToken,
  TestRedisAdapter,
  testInvalidAccessToken
}
