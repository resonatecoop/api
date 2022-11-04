/* eslint-disable no-unused-expressions */
/* eslint-env mocha */

const { request, expect, testAccessToken, testInvalidAccessToken, testUserId, testAdminUserId, testListenerUserId } = require('../../testConfig')
const MockAccessToken = require('../../MockAccessToken')
const { UserGroup, User, Track, Play, UserGroupType } = require('../../../src/db/models')
const ResetDB = require('../../ResetDB')
const { faker } = require('@faker-js/faker')

describe.only('user/admin/earnings endpoint test', () => {
  let response = null
  ResetDB()

  describe('Non Authorized', () => {
    MockAccessToken(testUserId)

    it('should handle no authentication', async () => {
      response = await request.post('/user/admin/earnings/')

      expect(response.status).to.eql(401)
    })
    it('should handle an invalid access token', async () => {
      response = await request.post('/user/admin/earnings/')
        .set('Authorization', `Bearer ${testInvalidAccessToken}`)

      expect(response.status).to.eql(401)
    })

    it('should reject access token for non-admin user', async () => {
      response = await request.post('/user/admin/earnings/')
        .set('Authorization', `Bearer ${testAccessToken}`)

      expect(response.status).to.eql(401)
    })
  })
  describe('Authorized', () => {
    MockAccessToken(testAdminUserId)

    it('should GET /user/admin/earnings', async () => {
      const type = await UserGroupType.findOne({ where: { name: 'artist' } })

      const newUser = await User.create({
        password: '324',
        roleId: 1,
        email: 'hi'
      })
      const newArtist = await UserGroup.create({
        displayName: faker.animal.cow(),
        ownerId: newUser.id,
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
      response = await request.post('/user/admin/earnings/')
        .send({
          date: {
            from: '2020-01-01',
            to: '2022-12-31'
          },
          creatorId: newUser.id
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
  })
})
