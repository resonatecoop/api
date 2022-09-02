module.exports = {
  up: (queryInterface, DataTypes) => {
    return queryInterface.createTable('favorites', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'fid'
      },
      user_id: {
        type: DataTypes.UUID,
        field: 'uid'
      },
      track_id: {
        type: DataTypes.INTEGER,
        field: 'tid'
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
