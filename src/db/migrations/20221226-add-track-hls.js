module.exports = {
  up: async (queryInterface, DataTypes) => {
    return queryInterface.addColumn('tracks', 'hls', DataTypes.BOOLEAN)
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('tracks', 'hls')
  }
}
