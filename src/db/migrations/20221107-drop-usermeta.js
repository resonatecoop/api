module.exports = {
  up: (queryInterface) => {
    return queryInterface.dropTable('rsntr_usermeta')
  },

  down: (queryInterface, DataTypes) => {
    return queryInterface.createTable('rsntr_usermeta', {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        field: 'umeta_id'
      },
      userId: {
        type: DataTypes.UUID,
        field: 'user_id'
      },
      meta_key: {
        type: DataTypes.STRING,
        field: 'meta_key'
      },
      meta_value: {
        type: DataTypes.TEXT,
        field: 'meta_value'
      }
    }, {
      timestamps: false,
      modelName: 'UserMeta',
      tableName: 'rsntr_usermeta'
    })
  }
}
