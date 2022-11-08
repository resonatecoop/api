module.exports = {
  up: async (queryInterface, DataTypes) => {
    return queryInterface.addColumn('users', 'email_confirmation_expiration', DataTypes.DATE)
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('users', 'email_confirmation_expiration')
  }
}
