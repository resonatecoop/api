module.exports = (sequelize, DataTypes) => {
  const UserGroupType = sequelize.define('UserGroupType', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(250),
      allowNull: false,
      unique: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    sequelize,
    timestamps: false,
    modelName: 'UserGroupType',
    tableName: 'user_group_types'
  })

  UserGroupType.associate = function (models) {
    UserGroupType.hasMany(models.UserGroup, { as: 'groups', targetKey: 'id', foreignKey: 'typeId' })
  }

  return UserGroupType
}
