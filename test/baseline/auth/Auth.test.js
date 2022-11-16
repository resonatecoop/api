/* eslint-disable no-unused-expressions */
/* eslint-env mocha */

const baseURL = `${process.env.APP_HOST}`
const request = require('supertest')(baseURL)
const { expect } = require('../../testConfig')
const { User } = require('../../../src/db/models')

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

  it('should handle password reset', async () => {
    const user = await User.create({
      email: faker.internet.email(),
      password: 'blabla',
      roleId: 1
    })
    response = await request.post('/password-reset')
      .send({
        email: user.email
      })
      .type('form')

    expect(response.status).to.eql(200)
    expect(response.text).to.include('Password reset email sent')

    await user.reload()
    expect(user.emailConfirmationToken).not.to.be.null
    expect(user.emailConfirmationExpiration).not.to.be.null

    await user.destroy({ force: true })
  })

  it('should handle password reset with non-existent password', async () => {
    response = await request.post('/password-reset')
      .send({
        email: faker.internet.email()
      })
      .type('form')

    expect(response.status).to.eql(200)
    expect(response.text).to.include('No user with this email exists')
  })
})
