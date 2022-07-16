const { faker } = require('@faker-js/faker')

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Seeds something for a local client
    return queryInterface.bulkInsert('clients', [{
      key: faker.datatype.uuid(),
      secret: 'matron-fling-raging-send-herself-ninth',
      grant_types: ['authorization_code'],
      response_types: ['code'],
      redirect_uris: ['http://localhost:8080'],
      application_name: 'Test',
      application_url: 'http://test.test',
      created_at: faker.date.past(1),
      updated_at: faker.date.past(1)
    }])
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('clients', null, {})
  }
}
