module.exports = (sequelize, DataTypes) => {
  const UserMembership = sequelize.define('UserMembership', {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      validate: {
        isUUID: 4
      },
      unique: true
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
    legacySource: {
      type: DataTypes.STRING,
      field: 'legacy_source'
    },
    start: {
      type: DataTypes.TIME
    },
    end: {
      type: DataTypes.TIME
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE
    },
    deletedAt: {
      type: DataTypes.DATE
    }
  }, {
    // timestamps: false,
    underscored: true,
    modelName: 'UserMembership',
    tableName: 'user_memberships'
  })

  return UserMembership
}
