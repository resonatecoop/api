module.exports = (sequelize, DataTypes) => {
  const Favorite = sequelize.define('Favorite', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'fid'
    },
    user_id: {
      type: DataTypes.UUID,
      field: 'uid'
    },
    track_id: {
      type: DataTypes.INTEGER,
      field: 'tid'
    },
    type: {
      type: DataTypes.BOOLEAN,
      field: 'type'
    }
  }, {
    timestamps: false,
    modelName: 'Favorite',
    tableName: 'favorites'
  })

  return Favorite
}
