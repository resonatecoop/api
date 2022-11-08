module.exports = {
  up: async (queryInterface, DataTypes) => {
    return queryInterface.addColumn('user_memberships', 'legacy_source', DataTypes.STRING)
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('user_memberships', 'legacy_source')
  }
}
