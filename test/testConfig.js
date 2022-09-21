
const baseURL = "http://localhost:4000/api/v3"
const request = require('supertest')(baseURL) 
const expect = require("chai").expect;

// genAudio and path are used in the old / as-built tests
const genAudio = require('../src/util/gen-silent-audio')
const path = require('path')

// test ids come from the yarn docker:seed:all command you should have already
//    run as part of the api setup
const testUserId = '17203153-e2b0-457f-929d-5abe4e322ea1'
const testTrackGroupId = 'c91bf101-2d3d-4181-8010-627ecce476de'
const testTagId = 'asdf'
const testLabelId = 'asdf'
const testArtistId = "251c01f6-7293-45f6-b8cd-242bdd76cd0d"
const testTrackId = "e8fc6dd4-f6ed-4b2b-be0f-efe9f32c3def"

module.exports = {
  baseURL,
  request, 
  expect,
  testUserId,
  testTrackGroupId,
  testTagId,
  testLabelId,
  testArtistId,
  testTrackId,
  genAudio,
  path
}