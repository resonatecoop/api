module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('track_group_items', {
      id: {
        type: Sequelize.UUID,
        allowNull: false,
        defaultValue: Sequelize.UUIDV4,
        unique: true,
        field: 'id',
        primaryKey: true
      },
      index: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'index'
      },
      trackgroupId: {
        type: Sequelize.UUID,
        field: 'track_group_id'
      },
      track_id: {
        type: Sequelize.INTEGER,
        field: 'track_id'
      },
      track_performers: {
        type: Sequelize.STRING,
        field: 'track_performers'
      },
      track_composers: {
        type: Sequelize.STRING,
        field: 'track_composers'
      },
      updatedAt: {
        field: 'updated_at',
        allowNull: false,
        type: Sequelize.DATE
      },
      createdAt: {
        field: 'created_at',
        allowNull: false,
        type: Sequelize.DATE
      }
    },
    {
      charset: 'utf8',
      collate: 'utf8_general_ci'
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('track_group_items')
  }
}
