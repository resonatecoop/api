module.exports = {
  up: (queryInterface, DataTypes) => {
    return queryInterface.createTable('user_group_links', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      ownerId: {
        type: DataTypes.UUID,
        field: 'owner_id'
      },
      uri: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      type: {
        type: DataTypes.STRING
      },
      platform: {
        type: DataTypes.STRING,
        allowNull: false
      }
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('user_group_links')
  }
}
