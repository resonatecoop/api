/* eslint-disable no-unused-expressions */
/* eslint-env mocha */

const { request, expect, testUserId, testAccessToken, testInvalidAccessToken } = require('../../testConfig')
const { User, UserMembership, testListenerUserId, MembershipClass, UserGroupType, Track, Play, UserGroup } = require('../../../src/db/models')
const { faker } = require('@faker-js/faker')
const TestRedisAdapter = require('../../../src/auth/redis-adapter')

const ResetDB = require('../../ResetDB')

describe('baseline/user endpoint test', () => {
  ResetDB()
  const adapter = new TestRedisAdapter('AccessToken')
  let user
  let response = null

  before('set user', async () => {
    user = await User.create({
      password: 'bla',
      displayName: 'Yes',
      email: 'bla@bla.com',
      roleId: 4
    })
    await adapter.upsert(testAccessToken, {
      accountId: user.id
    })
  })

  after('delete user', async () => {
    await user.destroy({ force: true })
    await adapter.destroy(testAccessToken)
  })
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
      'gravatar'
    )
    expect(theData.displayName).to.eql(user.displayName)
    expect(theData.id).to.eql(user.id)
    expect(theData.country).to.be.null
    expect(theData.newsletterNotification).to.be.null
    expect(theData.email).to.eql(user.email)

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
    expect(theUserGroups.length).to.eql(0)

    expect(theData.gravatar).to.eql('https://s.gravatar.com/avatar/ec69cee30e0f484433cdd537ec0ce2db')

    expect(attributes.status).to.eql('ok')
  })

  it('should GET user/profile for a listener member', async () => {
    const membershipClass = await MembershipClass.findOne({
      where: {
        name: 'Listener'
      }
    })
    const userMembership = await UserMembership.create({
      userId: user.id,
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

  it('should GET /user/earnings', async () => {
    const type = await UserGroupType.findOne({ where: { name: 'artist' } })

    const newArtist = await UserGroup.create({
      displayName: faker.animal.cow(),
      ownerId: user.id,
      typeId: type.id
    })
    const track = await Track.create({
      title: faker.animal.cat(),
      creatorId: newArtist.id
    })

    const newPlays = Array(12)
      .fill()
      .map(() => ({
        trackId: track.id,
        userId: testListenerUserId,
        type: 'paid',
        createdAt: '2021-01-01'
      }))
    const plays = await Play.bulkCreate(newPlays)
    response = await request.post('/user/earnings/')
      .send({
        date: {
          from: '2020-01-01',
          to: '2022-12-31'
        }
      })
      .set('Authorization', `Bearer ${testAccessToken}`)

    expect(response.status).to.eql(200)

    const { data, stats } = response.body
    expect(data[0].id).to.eql(track.id)
    expect(data[0].title).to.eql(track.title)
    expect(data[0].userGroup).to.eql(newArtist.displayName)
    expect(data[0].paidPlays).to.eql(9)
    expect(data[0].playsAfterBought).to.eql(3)
    expect(data[0].creditsSpent).to.eql(1022)
    expect(data[0].eurosSpent).to.eql(1.2775)

    expect(stats[0].displayName).to.eql(newArtist.displayName)
    expect(stats[0].totalCredits).to.eql(1022)
    expect(stats[0].artistTotalCredits).to.eql('715.40')
    expect(stats[0].artistTotalEuros).to.eql('0.89')
    expect(stats[0].resonateTotalCredits).to.eql('306.60')
    expect(stats[0].resonateTotalEuros).to.eql('0.38')

    await track.destroy({ force: true })
    await newArtist.destroy({ force: true })
    await Promise.all(plays.map(async (p) => {
      await p.destroy({ force: true })
    }))
  })

  it('should PUT user/profile', async () => {
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

  it('should not PUT user/profile when sending email without password', async () => {
    user.newsletterNotification = true
    await user.save()
    expect(user.newsletterNotification).to.eql(true)
    response = await request.put('/user/profile/')
      .send({
        email: 'test@test.com'
      })
      .set('Authorization', `Bearer ${testAccessToken}`)
    expect(response.status).to.eql(400)
  })

  it('should not PUT user/profile when sending email with wrong password', async () => {
    user.newsletterNotification = true
    await user.save()
    expect(user.newsletterNotification).to.eql(true)
    response = await request.put('/user/profile/')
      .send({
        email: 'test@test.com',
        password: 'wrongpassword'
      })
      .set('Authorization', `Bearer ${testAccessToken}`)
    expect(response.status).to.eql(401)
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
