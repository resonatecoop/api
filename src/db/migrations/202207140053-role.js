module.exports = {
  up: async (queryInterface, DataTypes) => {
    return queryInterface.createTable('roles', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      description: {
        type: DataTypes.STRING,
        allowNull: false
      },
      isDefault: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: 'is_default'
      }
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('roles')
  }
}
