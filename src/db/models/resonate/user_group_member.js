module.exports = (sequelize, DataTypes) => {
  const UserGroupMember = sequelize.define('UserGroupMember', {
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

  UserGroupMember.associate = function (models) {
    // UserGroupMember.belongsTo(models.UserGroup, { as: 'members', targetKey: 'id', foreignKey: 'memberId' })
    // UserGroupMember.hasMany(models.UserGroup, { as: 'parents', targetKey: 'id', foreignKey: 'belongsToId' })
  }

  return UserGroupMember
}
