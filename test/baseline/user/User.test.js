/* eslint-disable no-unused-expressions */
/* eslint-env mocha */

const { request, expect, testUserId, testAccessToken, testInvalidAccessToken, testArtistUserId } = require('../../testConfig')
const { User, UserMembership, MembershipClass } = require('../../../src/db/models')

const MockAccessToken = require('../../MockAccessToken')
const ResetDB = require('../../ResetDB')

describe('baseline/user endpoint test', () => {
  ResetDB()
  MockAccessToken(testArtistUserId)
  let response = null

  it('should handle no authentication / accessToken', async () => {
    response = await request.get('/user/profile')

    expect(response.status).to.eql(401)
  })

  it('should handle an invalid access token', async () => {
    response = await request.get('/user/profile').set('Authorization', `Bearer ${testInvalidAccessToken}`)

    expect(response.status).to.eql(401)
  })

  it('should GET user/profile', async () => {
    response = await request.get('/user/profile/').set('Authorization', `Bearer ${testAccessToken}`)

    expect(response.status).to.eql(200)

    const attributes = response.body
    expect(attributes).to.be.an('object')
    expect(attributes).to.include.keys('data', 'status')

    const theData = attributes.data
    expect(theData).to.be.an('object')

    expect(theData).to.include.keys(
      'displayName',
      'emailConfirmed',
      'member',
      'memberships',
      'id',
      'country',
      'newsletterNotification',
      'isListenerMember',
      'isMusicMember',
      'email',
      'role',
      'roleId',
      'credit',
      'userGroups',
      'gravatar',
      'avatar')
    expect(theData.displayName).to.eql('artist')
    expect(theData.id).to.eql('1c88dea6-0519-4b61-a279-4006954c5d4c')
    expect(theData.country).to.be.null
    expect(theData.newsletterNotification).to.be.null
    expect(theData.email).to.eql('artist@admin.com')

    const theRole = theData.role
    expect(theRole).to.be.an('object')
    expect(theRole).to.include.keys('id', 'name', 'description', 'isDefault')
    expect(theRole.id).to.eql(4)
    expect(theRole.name).to.eql('artist')
    expect(theRole.description).to.eql('An artist')
    expect(theRole.isDefault).to.be.false

    const theCredit = theData.credit
    expect(theCredit).to.be.an('object')
    expect(theCredit).to.include.keys('total')
    expect(theCredit.total).to.eql(0)

    const theUserGroups = theData.userGroups
    expect(theUserGroups).to.be.an('array')
    expect(theUserGroups.length).to.eql(1)

    expect(theData.gravatar).to.eql('https://s.gravatar.com/avatar/97f8b41e7967dcc56a5a0de728807d23')

    expect(theData.avatar).to.be.an('object')

    expect(attributes.status).to.eql('ok')
  })

  it('should GET user/profile for a listener member', async () => {
    const membershipClass = await MembershipClass.findOne({
      where: {
        name: 'Listener'
      }
    })
    const userMembership = await UserMembership.create({
      userId: testArtistUserId,
      membershipClassId: membershipClass.id,
      subscriptionId: 'arandomstring'
    })
    response = await request.get('/user/profile/').set('Authorization', `Bearer ${testAccessToken}`)

    expect(response.status).to.eql(200)

    const attributes = response.body
    expect(attributes).to.be.an('object')
    expect(attributes).to.include.keys('data', 'status')

    const theData = attributes.data
    expect(theData).to.be.an('object')

    expect(theData).to.include.keys(
      'isListenerMember'
    )
    expect(theData.isListenerMember).to.eql(true)

    await userMembership.destroy({ force: true })
  })

  it('should PUT user/profile', async () => {
    const user = await User.findOne({
      where: {
        id: testArtistUserId
      }
    })
    user.newsletterNotification = true
    await user.save()
    expect(user.newsletterNotification).to.eql(true)
    response = await request.put('/user/profile/')
      .send({
        newsletterNotification: false
      })
      .set('Authorization', `Bearer ${testAccessToken}`)

    expect(response.status).to.eql(200)
    expect(response.body.data.newsletterNotification).to.eql(false)
    await user.reload()
    expect(user.newsletterNotification).to.eql(false)
  })

  it('should GET user/:id/playlists', async () => {
    response = await request.get(`/users/${testUserId}/playlists`).set('Authorization', `Bearer ${testAccessToken}`)

    expect(response.status).to.eql(200)

    const attributes = response.body
    expect(attributes).to.be.an('object')
    expect(attributes).to.include.keys('data', 'count', 'numberOfPages', 'status')

    expect(attributes.data).to.be.an('array')
    expect(attributes.data.length).to.eql(0)

    expect(attributes.count).to.eql(0)
    expect(attributes.numberOfPages).to.eql(0)
    expect(attributes.status).to.eql('ok')
  })
})
