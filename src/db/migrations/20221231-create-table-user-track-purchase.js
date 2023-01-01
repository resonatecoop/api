module.exports = {
  up: (queryInterface, DataTypes) => {
    return queryInterface.createTable('user_track_purchase', {
      userId: {
        type: DataTypes.UUID,
        field: 'user_id',
        primaryKey: true
      },
      trackId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'track_id',
        primaryKey: true
      },
      type: {
        type: DataTypes.ENUM,
        allowNull: false,
        values: ['purchase', 'plays']
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE
      }
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('user_track_purchase')
  }
}
