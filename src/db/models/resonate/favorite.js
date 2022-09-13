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
      type: DataTypes.INTEGER
    },
    type: {
      type: DataTypes.BOOLEAN
    }
  }, {
    timestamps: false,
    underscore: true,
    modelName: 'Favorite',
    tableName: 'favorites'
  })

  return Favorite
}
