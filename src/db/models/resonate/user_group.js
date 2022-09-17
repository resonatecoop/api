module.exports = (sequelize, DataTypes) => {
  const UserGroup = sequelize.define('UserGroup', {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      validate: {
        isUUID: 4
      },
      unique: true
    },
    ownerId: {
      type: DataTypes.UUID,
      validate: {
        isUUID: 4
      }
    },
    typeId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    displayName: {
      type: DataTypes.STRING
    },
    description: {
      type: DataTypes.TEXT
    },
    shortBio: {
      type: DataTypes.TEXT
    },
    email: {
      type: DataTypes.STRING
    },
    addressId: {
      type: DataTypes.UUID
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE
    },
    deletedAt: {
      type: DataTypes.DATE
    }
  }, {
    sequelize,
    paranoid: true,
    modelName: 'UserGroup',
    tableName: 'user_groups',
    underscored: true
  })

  UserGroup.associate = function (models) {
    UserGroup.belongsTo(models.UserGroupType, { foreignKey: 'typeId' })
    UserGroup.belongsTo(models.User, { foreignKey: 'ownerId' })
  }

  return UserGroup
}
