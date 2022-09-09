module.exports = (sequelize, DataTypes) => {
  const Address = sequelize.define('Address', {
    id: {
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4
    },
    personalData: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'personal_data'
    },
    data: {
      type: DataTypes.ARRAY(DataTypes.STRING)
    }
  }, {
    timestamps: false,
    modelName: 'Address',
    tableName: 'addresses'
  })

  Address.associate = function (models) {
    Address.hasMany(models.UserGroup, { as: 'user_group', sourceKey: 'id' })
  }

  return Address
}
