const { faker } = require('@faker-js/faker')
const { User, Artist, TrackGroup, Track, TrackGroupItem, Role } = require('../models')

const generateTracks = async (trackgroup) => {
  await Promise.all(Array(10)
    .fill()
    .map(async (v, i) => {
      const track = await Track.create({
        uid: 1,
        title: faker.company.catchPhrase(),
        artist: faker.name.findName(),
        album: faker.hacker.noun(),
        status: 'free',
        date: faker.date.past(1)
      })
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
      await queryInterface.bulkInsert('users', [{
        id: faker.datatype.uuid(),
        email: 'artist@admin.com',
        password: User.hashPassword({ password: 'test1234' }),
        email_confirmed: true,
        display_name: 'artist',
        role_id: role.id,
        created_at: faker.date.past(1),
        updated_at: faker.date.past(1)
      }])

      const artistUser = await User.findOne({
        where: {
          display_name: 'artist'
        }
      })

      const artist = await Artist.create({
        display_name: faker.hacker.noun(),
        userId: artistUser.id
      })

      await queryInterface.bulkInsert('track_groups', [
        {
          id: '32573558-eadb-4e44-b008-f6966e474bc2',
          title: 'Best album ever',
          type: 'lp',
          about: 'this is the best album',
          artist_id: artist.id,
          private: false,
          user_id: artistUser.id,
          display_artist: 'Jack',
          release_date: new Date('2019-01-01'),
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: 'f7d32260-934a-4360-b8fa-96c6f8ef309c',
          title: 'Best album ever 2',
          type: 'lp',
          about: 'this is the best album2',
          artist_id: artist.id,
          user_id: artistUser.id,
          enabled: true,
          private: false,
          display_artist: 'Jill',
          release_date: new Date('2019-01-01'),
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: '2672d378-4d26-4b17-aee7-32dd4b6b050f',
          title: 'Best album ever 3',
          type: 'lp',
          about: 'this is the best album3',
          artist_id: artist.id,
          user_id: artistUser.id,
          private: false,
          display_artist: '@auggod',
          performers: ['auggod'],
          release_date: new Date('2019-01-01'),
          created_at: new Date(),
          updated_at: new Date()
        }
      ])

      const albums = await TrackGroup.findAll({
        where: { userId: artistUser.id }
      })

      await Promise.all(albums.map(async album => {
        return generateTracks(album)
      }))
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
