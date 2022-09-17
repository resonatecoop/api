module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('plays', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        field: 'id',
        primaryKey: true
      },
      trackId: {
        type: Sequelize.UUID,
        field: 'track_id'
      },
      userId: {
        type: Sequelize.UUID,
        field: 'user_id'
      },
      type: {
        type: Sequelize.INTEGER,
        field: 'event'
      },
      createdAt: {
        type: Sequelize.DATE(),
        defaultValue: Sequelize.fn('NOW'),
        field: 'created_at'
      }
    },
    {
      charset: 'utf8',
      collate: 'utf8_general_ci'
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('plays')
  }
}
