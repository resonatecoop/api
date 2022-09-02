module.exports = {
  up: (queryInterface, DataTypes) => {
    return queryInterface.createTable('artists', {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        field: 'ID'
      },
      display_name: {
        type: DataTypes.STRING(250),
        field: 'display_name'
      },
      userId: {
        type: DataTypes.UUID,
        field: 'user_id',
        allowNull: false
      }
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('artists')
  }
}
