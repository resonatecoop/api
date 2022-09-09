module.exports = {
  up: (queryInterface, DataTypes) => {
    return queryInterface.createTable('user_memberships', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      userId: {
        type: DataTypes.UUID
      },
      membershipClassId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      subscriptionId: { // This is in reference to Stripe codes
        type: DataTypes.STRING,
        allowNull: false
      },
      start: {
        type: DataTypes.TIME
      },
      end: {
        type: DataTypes.TIME
      }
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('user_memberships')
  }
}
