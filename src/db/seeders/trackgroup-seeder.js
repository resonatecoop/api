const { faker } = require('@faker-js/faker')
const { User, Artist } = require('../models')

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.bulkInsert('users', [{
        id: faker.datatype.uuid(),
        email: 'artist@admin.com',
        password: User.hashPassword({ password: 'test1234' }),
        email_confirmed: true,
        display_name: 'artist',
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
    } catch (e) {
      console.error(e)
    }
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('track_groups', null, {})
  }
}
