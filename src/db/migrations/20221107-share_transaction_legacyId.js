module.exports = {
  up: async (queryInterface, DataTypes) => {
    return queryInterface.addColumn('share_transactions', 'legacy_source', DataTypes.STRING)
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('share_transactions', 'legacy_source')
  }
}
