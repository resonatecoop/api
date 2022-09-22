module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('playlist_items', {
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
      playlistId: {
        type: Sequelize.UUID,
        field: 'playlist_id'
      },
      trackId: {
        type: Sequelize.UUID,
        field: 'track_id'
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
      },
      deletedAt: {
        field: 'deleted_at',
        allowNull: true,
        type: Sequelize.DATE
      }
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('playlist_items')
  }
}
