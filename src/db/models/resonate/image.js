module.exports = (sequelize, DataTypes) => {
  const Image = sequelize.define('Image', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'iid'
    },
    creator_id: {
      type: DataTypes.INTEGER,
      field: 'uid'
    },
    uuid: {
      type: DataTypes.UUID,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
      unique: true,
      field: 'name'
    }
  }, {
    timestamps: false,
    modelName: 'Image',
    tableName: 'images'
  })

  return Image
}
