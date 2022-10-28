/* eslint-disable no-unused-expressions */
/* eslint-env mocha */

const { request, expect, testAccessToken, testArtistUserId } = require('../../testConfig')

const MockAccessToken = require('../../MockAccessToken')
const ResetDB = require('../../ResetDB')

const { faker } = require('@faker-js/faker')

describe('Auth endpoint test', () => {
  ResetDB()
  MockAccessToken(testArtistUserId)
  let response = null

  it('should handle new user registration', async () => {
    response = await request.post('/register')
      .send({
        email: faker.internet.email(),
        password: faker.internet.password()
      })
      .set('Authorization', `Bearer ${testAccessToken}`)
    console.log('AUTH TEST RESPONSE LOG!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!')
    console.log(response)
    expect(response.status).to.eql(200)
  })
})
