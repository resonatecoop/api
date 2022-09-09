module.exports = (sequelize, DataTypes) => {
  const UserMembership = sequelize.define('UserMembership', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.UUID
    },
    membershipClassId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    subscriptionId: { // This is in reference to Stripe codes
      type: DataTypes.STRING,
      allowNull: false
    },
    start: {
      type: DataTypes.TIME
    },
    end: {
      type: DataTypes.TIME
    }
  }, {
    timestamps: false,
    underscored: true,
    modelName: 'UserMembership',
    tableName: 'user_memberships'
  })

  return UserMembership
}
