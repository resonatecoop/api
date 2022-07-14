module.exports = (sequelize, DataTypes) => {
  const Credit = sequelize.define('Credit', {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      validate: {
        isUUID: 4
      },
      unique: true,
      field: 'id'
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
      validate: {
        isUUID: 4
      },
      field: 'user_id'
    },
    total: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'total'
    },
    updatedAt: {
      field: 'updated_at',
      allowNull: false,
      type: DataTypes.DATE
    },
    createdAt: {
      field: 'created_at',
      allowNull: false,
      type: DataTypes.DATE
    },
    deletedAt: {
      field: 'deleted_at',
      allowNull: false,
      type: DataTypes.DATE
    }
  }, {
    sequelize,
    paranoid: true,
    modelName: 'Credit',
    tableName: 'credits'
  })

  return Credit
}
