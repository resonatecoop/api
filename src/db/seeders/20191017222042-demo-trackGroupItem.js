const { v4: uuid } = require('uuid')

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('track_group_items', [
      {
        id: uuid(),
        track_group_id: 'f7d32260-934a-4360-b8fa-96c6f8ef309c',
        index: 1,
        track_id: 33,
        track_composers: 'AGF',
        track_performers: 'AGF',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuid(),
        track_group_id: 'f7d32260-934a-4360-b8fa-96c6f8ef309c',
        index: 2,
        track_id: 33,
        track_composers: 'AGF',
        track_performers: 'AGF',
        created_at: new Date(),
        updated_at: new Date()
      }
    ])
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('track_group_items', null, {})
  }
}
