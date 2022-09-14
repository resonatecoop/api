module.exports = (sequelize, DataTypes) => {
  const MembershipClass = sequelize.define('MembershipClass', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    priceId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    productId: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    timestamps: false,
    underscored: true,
    modelName: 'MembershipClass',
    tableName: 'membership_classes'
  })

  return MembershipClass
}
