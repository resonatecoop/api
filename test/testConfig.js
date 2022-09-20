
const baseURL = "http://localhost:4000/api/v3"
const request = require('supertest')(baseURL) 
const expect = require("chai").expect;

const genAudio = require('../src/util/gen-silent-audio')
const path = require('path')

// this comes from the yarn docker:seed:all command you should have already
//    run as part of the api setup
const testUserId = '17203153-e2b0-457f-929d-5abe4e322ea1'

module.exports = {
  baseURL,
  request, 
  expect,
  testUserId,
  genAudio,
  path
}