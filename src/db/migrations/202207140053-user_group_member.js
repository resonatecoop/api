module.exports = {
  up: (queryInterface, DataTypes) => {
    return queryInterface.createTable('user_group_members', {
      member_id: {
        type: DataTypes.UUID,
        field: 'member_id',
        primaryKey: true
      },
      belongsToId: {
        type: DataTypes.UUID,
        field: 'belongs_to_id',
        primaryKey: true
      }
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('user_group_members')
  }
}
