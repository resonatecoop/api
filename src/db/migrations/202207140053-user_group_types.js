module.exports = {
  up: (queryInterface, DataTypes) => {
    return queryInterface.createTable('user_group_types', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: DataTypes.STRING(250)
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false
      }
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('user_group_types')
  }
}
