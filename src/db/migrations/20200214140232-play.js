module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('plays', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        field: 'pid',
        primaryKey: true
      },
      track_id: {
        type: Sequelize.INTEGER,
        field: 'tid'
      },
      listener_id: {
        type: Sequelize.INTEGER,
        field: 'uid'
      },
      type: {
        type: Sequelize.INTEGER,
        field: 'event'
      },
      date: {
        type: Sequelize.DATE(),
        defaultValue: Sequelize.fn('NOW'),
        field: 'date'
      }
    },
    {
      charset: 'utf8',
      collate: 'utf8_general_ci'
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('plays')
  }
}
