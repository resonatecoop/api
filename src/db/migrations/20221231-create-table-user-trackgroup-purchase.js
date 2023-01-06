module.exports = {
  up: (queryInterface, DataTypes) => {
    return queryInterface.createTable('user_track_group_purchase', {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        validate: {
          isUUID: 4
        },
        unique: true
      },
      userId: {
        type: DataTypes.UUID,
        field: 'user_id'
      },
      trackGroupId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'track_group_id'
      },
      type: {
        type: DataTypes.ENUM,
        allowNull: false,
        values: ['purchase']
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
        field: 'updated_at'
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
        field: 'created_at'
      }
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('user_track_group_purchase')
  }
}
