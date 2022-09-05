const { faker } = require('@faker-js/faker')
const { User, Role } = require('../models')

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Seeds something for a local client
    const role = await Role.findOne({
      where: {
        name: 'superadmin'
      }
    })
    await queryInterface.bulkInsert('users', [{
      id: faker.datatype.uuid(),
      email: 'admin@admin.com',
      password: User.hashPassword({ password: 'test1234' }),
      email_confirmed: true,
      role_id: role.id,
      display_name: 'admin',
      created_at: faker.date.past(1),
      updated_at: faker.date.past(1)
    }])
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('users', null, {})
  }
}
