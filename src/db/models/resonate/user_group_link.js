module.exports = (sequelize, DataTypes) => {
  const UserGroupLink = sequelize.define('UserGroupLink', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    ownerId: {
      type: DataTypes.UUID
    },
    uri: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    type: {
      type: DataTypes.STRING
    },
    platform: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    underscored: true,
    timestamps: false,
    modelName: 'UserGroupLink',
    tableName: 'user_group_links'
  })

  return UserGroupLink
}
