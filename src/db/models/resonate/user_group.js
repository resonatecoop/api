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
      },
      allowNull: false
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
    banner: {
      type: DataTypes.UUID
    },
    avatar: {
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
    defaultScope: {
      attributes: {
        exclude: ['addressId', 'email', 'ownerId', 'AddressId']
      }
    },
    modelName: 'UserGroup',
    tableName: 'user_groups',
    underscored: true
  })

  UserGroup.associate = function (models) {
    UserGroup.belongsTo(models.Address, { foreignKey: 'addressId', as: 'address' })
    UserGroup.belongsToMany(models.UserGroup, { through: models.UserGroupMember, as: 'members', foreignKey: 'memberId', otherKey: 'belongsToId' })
    UserGroup.hasMany(models.UserGroupMember, { foreignKey: 'belongsToId', as: 'parent' })
    UserGroup.hasMany(models.UserGroupMember, { foreignKey: 'memberId', as: 'memberOf' })
    UserGroup.belongsTo(models.UserGroupType, { foreignKey: 'typeId', as: 'type' })
    UserGroup.belongsTo(models.User, { as: 'owner', foreignKey: 'ownerId' })
    UserGroup.belongsTo(models.File, { foreignKey: 'banner' })
    UserGroup.belongsTo(models.File, { foreignKey: 'avatar' })
    UserGroup.hasMany(models.TrackGroup, { foreignKey: 'creatorId', as: 'trackgroups' })
    UserGroup.hasMany(models.Track, { foreignKey: 'creatorId', as: 'tracks' })
    UserGroup.hasMany(models.UserGroupLink, { as: 'links', foreignKey: 'ownerId' })
  }

  return UserGroup
}
