const { faker } = require('@faker-js/faker')
const { User } = require('../models')

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Seeds something for a local client
    return queryInterface.bulkInsert('users', [{
      id: faker.datatype.uuid(),
      email: 'admin@admin.com',
      password: User.hashPassword({ password: 'test1234' }),
      email_confirmed: true,
      display_name: 'admin',
      created_at: faker.date.past(1),
      updated_at: faker.date.past(1)
    }])
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('users', null, {})
  }
}
