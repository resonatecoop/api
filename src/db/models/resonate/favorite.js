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

  return Favorite
}
