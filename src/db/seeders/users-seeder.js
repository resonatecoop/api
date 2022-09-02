const { faker } = require('@faker-js/faker')
const { User } = require('../models')

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Seeds something for a local client
    queryInterface.bulkInsert('users', [{
      id: faker.datatype.uuid(),
      email: 'admin@admin.com',
      password: User.hashPassword({ password: 'test1234' }),
      email_confirmed: true,
      display_name: 'admin',
      created_at: faker.date.past(1),
      updated_at: faker.date.past(1)
    }, {
      id: faker.datatype.uuid(),
      email: 'artist@admin.com',
      password: User.hashPassword({ password: 'test1234' }),
      email_confirmed: true,
      display_name: 'artist',
      created_at: faker.date.past(1),
      updated_at: faker.date.past(1)
    }])

    const artist = await User.findOne({
      where: {
        display_name: 'artist'
      }
    })

    await queryInterface.bulkInsert('artists', [{
      display_name: faker.hacker.noun(),
      user_id: artist.id
    }])
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('users', null, {})
  }
}
