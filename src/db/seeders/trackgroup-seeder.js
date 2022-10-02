const { faker } = require('@faker-js/faker')
const { User, UserGroup, UserGroupType, TrackGroup, Track, TrackGroupItem, Role, Play } = require('../models')

const generateTracks = async (trackgroup, listener) => {
  await Promise.all(Array(10)
    .fill()
    .map(async (v, i) => {
      const track = await Track.create({
        creatorId: trackgroup.creatorId,
        title: faker.company.catchPhrase(),
        artist: faker.name.findName(),
        album: faker.hacker.noun(),
        status: 'free',
        date: faker.date.past(1)
      })
      await Promise.all(Array(faker.datatype.number(1, 5)).fill().map(async (v, i) => {
        await Play.create({
          userId: listener.id,
          trackId: track.id,
          type: 'paid'
        })
      }))

      await TrackGroupItem.create({
        trackgroupId: trackgroup.id,
        track_id: track.id,
        index: i
      })
    }))
}

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      const role = await Role.findOne({
        where: {
          name: 'artist'
        }
      })
      //  FIXME: 'users' is replicated in users-seeder.js
      await queryInterface.bulkInsert('users', [{
        id: '251c01f6-7293-45f6-b8cd-242bdd76cd0d', // hard coded user id to pass tests for now
        email: 'artist@admin.com',
        password: await User.hashPassword({ password: 'test1234' }),
        email_confirmed: true,
        display_name: 'artist',
        role_id: role.id,
        created_at: faker.date.past(1),
        updated_at: faker.date.past(1)
      }, {
        id: faker.datatype.uuid(),
        email: 'listener@admin.com',
        password: await User.hashPassword({ password: 'test1234' }),
        email_confirmed: true,
        display_name: 'listener',
        role_id: role.id,
        created_at: faker.date.past(1),
        updated_at: faker.date.past(1)
      }])

      const artistUser = await User.findOne({
        where: {
          displayName: 'artist'
        }
      })

      const listener = await User.findOne({
        where: {
          displayName: 'listener'
        }
      })

      const artistGroupType = await UserGroupType.findOne({
        where: {
          name: 'artist'
        }
      })

      const artist = await UserGroup.create({
        displayName: faker.hacker.noun(),
        ownerId: artistUser.id,
        typeId: artistGroupType.id
      })

      await queryInterface.bulkInsert('track_groups', [
        {
          id: faker.datatype.uuid(),
          title: 'Best album ever',
          type: 'lp',
          about: 'this is the best album',
          creator_id: artist.id,
          enabled: true,
          private: false,
          display_artist: 'Jack',
          release_date: new Date('2019-01-01'),
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: faker.datatype.uuid(),
          title: 'Best album ever 2',
          type: 'lp',
          about: 'this is the best album2',
          creator_id: artist.id,
          enabled: true,
          private: false,
          display_artist: 'Jill',
          release_date: new Date('2019-01-01'),
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: faker.datatype.uuid(),
          title: 'Best album ever 3',
          type: 'lp',
          about: 'this is the best album3',
          creator_id: artist.id,
          enabled: true,
          private: false,
          display_artist: '@auggod',
          performers: ['auggod'],
          release_date: new Date('2019-01-01'),
          created_at: new Date(),
          updated_at: new Date()
        }
      ])

      const albums = await TrackGroup.findAll({
        where: { creatorId: artist.id }
      })

      await Promise.all(albums.map(async album => {
        return generateTracks(album, listener)
      }))

      // Data for tests
      const testTrackId = 'b6d160d1-be16-48a4-8c4f-0c0574c4c6aa'
      await Track.create({
        id: testTrackId,
        creatorId: albums[0].creatorId,
        title: faker.company.catchPhrase(),
        artist: faker.name.findName(),
        album: faker.hacker.noun(),
        status: 'free',
        date: faker.date.past(1)
      })
      await Play.create({
        userId: listener.id,
        trackId: testTrackId,
        type: 'paid'
      })
      await Play.create({
        userId: listener.id,
        trackId: testTrackId,
        type: 'paid'
      })
    } catch (e) {
      console.error(e)
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('track_groups', null, {})
    await queryInterface.bulkDelete('tracks', null, {})
    await queryInterface.bulkDelete('track_group_items', null, {})
    return queryInterface.bulkDelete('users', null, {})
  }
}
