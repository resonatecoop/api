module.exports = {
  up: (queryInterface, DataTypes) => {
    return queryInterface.createTable('tags', {
      id: {
        primaryKey: true,
        autoIncrement: true,
        type: DataTypes.INTEGER,
        field: 'tagid'
      },
      trackId: {
        type: DataTypes.INTEGER,
        field: 'tid'
      },
      tagnames: {
        type: DataTypes.STRING,
        field: 'tagnames'

      }
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('tags')
  }
}
