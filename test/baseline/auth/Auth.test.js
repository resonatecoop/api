/* eslint-disable no-unused-expressions */
/* eslint-env mocha */

const baseURL = `${process.env.APP_HOST}`
const request = require('supertest')(baseURL)
const { expect } = require('../../testConfig')

const ResetDB = require('../../ResetDB')

const { faker } = require('@faker-js/faker')

describe('Auth endpoint test', () => {
  ResetDB()
  let response = null

  it('should handle new user registration', async () => {
    response = await request.post('/register')
      .send({
        email: faker.internet.email(),
        password: faker.internet.password()
      })
      .type('form')

    expect(response.status).to.eql(200)
  })
})
