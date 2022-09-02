module.exports = (sequelize, DataTypes) => {
  const Artist = sequelize.define('Artist', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      field: 'ID'
    },
    display_name: {
      type: DataTypes.STRING(250),
      field: 'display_name'
    },
    userId: {
      type: DataTypes.UUID,
      field: 'user_id',
      allowNull: false
    }
  }, {
    sequelize,
    timestamps: false,
    modelName: 'Artist',
    tableName: 'artists'
  })

  Artist.associate = function (models) {
    Artist.hasOne(models.User, { as: 'user', sourceKey: 'userId', foreignKey: 'id' })
    // Artist.hasMany(models.UserMeta, { as: 'meta', targetKey: 'id', foreignKey: 'userId' })
    Artist.hasMany(models.TrackGroup, { as: 'trackgroup', targetKey: 'id', foreignKey: 'creatorId' })
    Artist.hasMany(models.Track, { as: 'track', targetKey: 'id', foreignKey: 'uid' })
  }

  return Artist
}
