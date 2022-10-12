module.exports = (sequelize, DataTypes) => {
  const UserGroupType = sequelize.define('UserGroupMember', {
    memberId: {
      type: DataTypes.UUID,
      validate: {
        isUUID: 4
      },
      primaryKey: true
    },
    belongsToId: {
      type: DataTypes.UUID,
      validate: {
        isUUID: 4
      },
      primaryKey: true
    }
  }, {
    sequelize,
    underscored: true,
    paranoid: true,
    timestamps: false,
    modelName: 'UserGroupMember',
    tableName: 'user_group_members'
  })

  UserGroupType.associate = function (models) {
    UserGroupType.hasMany(models.UserGroup, { as: 'groups', targetKey: 'id', foreignKey: 'typeId' })
  }

  return UserGroupType
}
