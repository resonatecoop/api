
const baseURL = 'http://localhost:4000/api/v3'
// const baseURL = "https://stream.resonate.coop/api/v3/"
const request = require('supertest')(baseURL)

// Do this to enable auth persistence
//      https://stackoverflow.com/questions/14001183/how-to-authenticate-supertest-requests-with-passport
const persistedRequest = require('supertest').agent(baseURL)

const expect = require('chai').expect

// test ids come from the yarn docker:seed:all command you should have already
//    run as part of the api setup
const testUserId = '17203153-e2b0-457f-929d-5abe4e322ea1'
const testTrackGroupId = 'c91bf101-2d3d-4181-8010-627ecce476de'
const testTagId = 'asdf'
const testLabelId = 'asdf'
const testArtistId = '49d2ac44-7f20-4a47-9cf5-3ea5d6ef78f6'
const testTrackId = 'e8fc6dd4-f6ed-4b2b-be0f-efe9f32c3def'

const testAccessToken = 'asdf'

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
  testAccessToken
}
