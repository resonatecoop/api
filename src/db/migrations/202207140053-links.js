module.exports = {
  up: (queryInterface, DataTypes) => {
    return queryInterface.createTable('links', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      uri: {
        type: DataTypes.STRING,
        allowNull: false
      },
      type: {
        type: DataTypes.STRING
      },
      platform: {
        type: DataTypes.STRING,
        allowNull: false
      },
      personalData: { // This is in reference to Stripe codes
        type: DataTypes.STRING,
        allowNull: false,
        field: 'personal_data'
      }
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('links')
  }
}
