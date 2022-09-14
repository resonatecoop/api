module.exports = (sequelize, DataTypes) => {
  const UserMeta = sequelize.define('UserMeta', {
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

  UserMeta.associate = function (models) {
    // UserMeta.belongsTo(models.User, { as: 'UserMeta', targetKey: 'id', foreignKey: 'userId' })
  }

  return UserMeta
}
