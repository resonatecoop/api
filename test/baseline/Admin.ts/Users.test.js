/* eslint-disable no-unused-expressions */
/* eslint-env mocha */

const { request, expect, testAccessToken, testInvalidAccessToken, testUserId, testAdminUserId } = require('../../testConfig')
const MockAccessToken = require('../../MockAccessToken')
const { User } = require('../../../src/db/models')
const ResetDB = require('../../ResetDB')

describe('Admin.ts/users endpoint test', () => {
  let response = null
  ResetDB()

  describe('Non Authorized', () => {
    MockAccessToken(testUserId)

    it('should handle no authentication', async () => {
      response = await request.get('/user/admin/users/')

      expect(response.status).to.eql(401)
    })
    it('should handle an invalid access token', async () => {
      response = await request.get('/user/admin/users/')
        .set('Authorization', `Bearer ${testInvalidAccessToken}`)

      expect(response.status).to.eql(401)
    })

    it('should reject access token for non-admin user', async () => {
      response = await request.get('/user/admin/users/')
        .set('Authorization', `Bearer ${testAccessToken}`)

      expect(response.status).to.eql(401)
    })
  })

  describe('Admin User', () => {
    MockAccessToken(testAdminUserId)

    it('should GET /user/admin/users', async () => {
      response = await request.get('/user/admin/users/')
        .set('Authorization', `Bearer ${testAccessToken}`)

      expect(response.status).to.eql(200)

      const attributes = response.body
      expect(attributes).to.be.an('object')
      expect(attributes).to.include.keys('count', 'numberOfPages', 'data', 'status')

      expect(attributes.count).to.eql(3)
      expect(attributes.numberOfPages).to.eql(1)

      expect(attributes.data).to.be.an('array')
      expect(attributes.data.length).to.eql(3)

      const theData = attributes.data[0]
      expect(theData).to.include.keys('id', 'displayName', 'email', 'emailConfirmed', 'country', 'fullName', 'member', 'role')
      expect(theData.id).to.eql('71175a23-9256-41c9-b8c1-cd2170aa6591')
      expect(theData.displayName).to.eql('admin')
      expect(theData.email).to.eql('admin@admin.com')
      expect(theData.emailConfirmed).to.be.true
      expect(theData.country).to.be.null
      expect(theData.fullName).to.be.null
      expect(theData.member).to.be.null

      const theRole = theData.role
      expect(theRole).to.be.an('object')
      expect(theRole).to.include.keys('id', 'name', 'description', 'isDefault')
      expect(theRole.id).to.eql(1)
      expect(theRole.name).to.eql('superadmin')
      expect(theRole.description).to.eql('SuperAdminRole has all permissions and can assign admins')
      expect(theRole.isDefault).to.be.false

      expect(attributes.status).to.eql('ok')
    })
    it('should GET /usdr/admin/users/:id', async () => {
      const user = await User.findOne({ where: { id: testUserId } })
      response = await request.get(`/user/admin/users/${user.id}`).set('Authorization', `Bearer ${testAccessToken}`)

      expect(response.status).to.eql(200)

      const { data } = response.body

      expect(data.id).to.eql(user.id)
      expect(data.displayName).to.eql(user.displayName)
    })
  })
})
