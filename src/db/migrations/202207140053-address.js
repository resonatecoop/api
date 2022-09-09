module.exports = {
  up: (queryInterface, DataTypes) => {
    return queryInterface.createTable('addresses', {
      id: {
        primaryKey: true,
        type: DataTypes.UUID,
        defaultvalue: DataTypes.UUIDV4
      },
      personalData: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        field: 'personal_data'
      },
      data: {
        type: DataTypes.ARRAY(DataTypes.STRING)
      }
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('addresses')
  }
}
