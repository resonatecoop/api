module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
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
    legacyID: {
      type: DataTypes.INTEGER,
      primaryKey: false,
      autoIncrement: true, // SERIAL on postgres
      field: 'legacy_id'
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
    modelName: 'User',
    tableName: 'users'
  })

  return User
}
