/* eslint-disable no-unused-expressions */
/* eslint-env mocha */

const { request, expect, testAccessToken, testInvalidAccessToken, testUserId } = require('../../testConfig')
const MockAccessToken = require('../../MockAccessToken')
const { File } = require('../../../src/db/models')
const ResetDB = require('../../ResetDB')

describe('user/admin/files endpoint test', () => {
  let response = null
  ResetDB()

  describe('Non Authorized', () => {
    MockAccessToken(testUserId)

    it('should handle no authentication', async () => {
      response = await request.get('/user/files')

      expect(response.status).to.eql(401)
    })
    it('should handle an invalid access token', async () => {
      response = await request.get('/user/files')
        .set('Authorization', `Bearer ${testInvalidAccessToken}`)

      expect(response.status).to.eql(401)
    })
  })
  describe('Authorized', () => {
    MockAccessToken(testUserId)

    it('should GET /user/admin/files', async () => {
      const file = await File.create({
        ownerId: testUserId,
        mime: 'image/png'
      })
      response = await request.get('/user/files')
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
        ownerId: testUserId,
        mime: 'image/png'
      })
      response = await request.put(`/user/files/${file.id}`)
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
