module.exports = (sequelize, DataTypes) => {
  const WpUser = sequelize.define('WpUser', {
    id: {
      type: DataTypes.BIGINT(20),
      primaryKey: true,
      autoIncrement: true,
      field: 'ID'
    },
    login: {
      type: DataTypes.STRING(60),
      unique: true,
      field: 'user_login'
    },
    nicename: {
      type: DataTypes.STRING(50),
      field: 'user_nicename'
    },
    password: {
      type: DataTypes.STRING(255),
      field: 'user_pass',
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(100),
      field: 'user_email',
      unique: true,
      allowNull: false
    },
    registered: {
      type: DataTypes.TIME,
      field: 'user_registered'
    },
    display_name: {
      type: DataTypes.STRING(250),
      field: 'display_name'
    }
  }, {
    sequelize,
    timestamps: false,
    modelName: 'User',
    tableName: 'rsntr_users'
  })

  WpUser.associate = function (models) {
    WpUser.hasMany(models.UserMeta, { as: 'meta', targetKey: 'id', foreignKey: 'userId' })
    WpUser.hasOne(models.Credit, { as: 'credit', targetKey: 'id', foreignKey: 'user_id' })
    WpUser.hasMany(models.TrackGroup, { as: 'trackgroup', targetKey: 'id', foreignKey: 'creatorId' })
    WpUser.hasMany(models.Track, { as: 'track', targetKey: 'id', foreignKey: 'uid' })
  }

  return WpUser
}
