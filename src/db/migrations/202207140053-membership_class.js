module.exports = {
  up: (queryInterface, DataTypes) => {
    return queryInterface.createTable('membership_classes', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      priceId: {
        type: DataTypes.STRING,
        allowNull: false
      },
      productId: {
        type: DataTypes.STRING,
        allowNull: false
      }
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('membership_classes')
  }
}
