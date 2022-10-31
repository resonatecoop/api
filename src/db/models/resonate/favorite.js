module.exports = (sequelize, DataTypes) => {
  const Favorite = sequelize.define('Favorite', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.UUID
    },
    trackId: {
      type: DataTypes.UUID
    },
    type: {
      type: DataTypes.BOOLEAN
    }
  }, {
    timestamps: false,
    underscored: true,
    modelName: 'Favorite',
    tableName: 'favorites'
  })

  Favorite.associate = function (models) {
    Favorite.belongsTo(models.Track, { as: 'track', foreignKey: 'trackId' })
    Favorite.belongsTo(models.User, { as: 'user', foreignKey: 'userId' })
  }

  return Favorite
}
