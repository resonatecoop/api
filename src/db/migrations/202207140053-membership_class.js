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
        allowNull: false,
        field: 'price_id'
      },
      productId: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'product_id'
      }
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('membership_classes')
  }
}
