module.exports = (sequelize, DataTypes) => {
  const Link = sequelize.define('Link', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      autoIncrement: true
    },
    uri: {
      type: DataTypes.STRING,
      allowNull: false
    },
    type: {
      type: DataTypes.STRING
    },
    platform: {
      type: DataTypes.STRING,
      allowNull: false
    },
    personalData: { // This is in reference to Stripe codes
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    underscored: true,
    modelName: 'Link',
    tableName: 'links'
  })

  return Link
}
