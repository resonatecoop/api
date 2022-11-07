/* eslint-disable no-unused-expressions */
/* eslint-env mocha */

const { request, expect, testAccessToken, testInvalidAccessToken, testUserId, testAdminUserId } = require('../../testConfig')
const MockAccessToken = require('../../MockAccessToken')
const { File } = require('../../../src/db/models')
const ResetDB = require('../../ResetDB')
const { faker } = require('@faker-js/faker')

describe('user/admin/files endpoint test', () => {
  let response = null
  ResetDB()

  describe('Non Authorized', () => {
    MockAccessToken(testUserId)

    it('should handle no authentication', async () => {
      response = await request.get('/user/admin/files')

      expect(response.status).to.eql(401)
    })
    it('should handle an invalid access token', async () => {
      response = await request.get('/user/admin/files')
        .set('Authorization', `Bearer ${testInvalidAccessToken}`)

      expect(response.status).to.eql(401)
    })

    it('should reject access token for non-admin user', async () => {
      response = await request.get('/user/admin/files')
        .set('Authorization', `Bearer ${testAccessToken}`)

      expect(response.status).to.eql(401)
    })

    it('should reject access token for non-admin user', async () => {
      response = await request.put(`/user/admin/files/${faker.datatype.uuid()}`)
        .set('Authorization', `Bearer ${testAccessToken}`)
      expect(response.status).to.eql(401)
    })
  })
  describe('Authorized', () => {
    MockAccessToken(testAdminUserId)

    it('should GET /user/admin/files', async () => {
      const file = await File.create({
        owner_id: testUserId,
        mime: 'image/png'
      })
      response = await request.get('/user/admin/files')
        .set('Authorization', `Bearer ${testAccessToken}`)

      expect(response.status).to.eql(200)
      const { data, count } = response.body
      expect(data.length).to.eql(1)
      expect(data.length).to.eql(count)
      expect(data[0].id).to.eql(file.id)
      expect(data[0].status).to.eql('processing')
      await file.destroy({ force: true })
    })

    it('should PUT /user/admin/files/{id}', async () => {
      const file = await File.create({
        owner_id: testUserId,
        mime: 'image/png'
      })
      response = await request.put(`/user/admin/files/${file.id}`)
        .send({
          filename: 'ok'
        })
        .set('Authorization', `Bearer ${testAccessToken}`)
      expect(response.status).to.eql(201)
      const { data } = response.body
      expect(data.id).to.eql(file.id)
      expect(data.filename).to.eql('ok')
      await file.destroy({ force: true })
    })
  })
})
