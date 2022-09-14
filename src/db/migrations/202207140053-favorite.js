module.exports = {
  up: (queryInterface, DataTypes) => {
    return queryInterface.createTable('favorites', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'id'
      },
      userId: {
        type: DataTypes.UUID,
        field: 'user_id'
      },
      trackid: {
        type: DataTypes.INTEGER,
        field: 'track_id'
      },
      type: {
        type: DataTypes.BOOLEAN,
        field: 'type'
      }
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('favorites')
  }
}
