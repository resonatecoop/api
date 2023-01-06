module.exports = (sequelize, DataTypes) => {
  const UserTrackGroupPurchase = sequelize.define('UserTrackGroupPurchase', {
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
      type: DataTypes.UUID,
      field: 'user_id',
      primaryKey: true
    },
    trackGroupId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'track_group_id',
      primaryKey: true
    },
    type: {
      type: DataTypes.ENUM,
      allowNull: false,
      values: ['purchase']
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE
    }
  }, {
    sequelize,
    timestamps: true,
    paranoid: true,
    underscored: true,
    modelName: 'UserTrackGroupPurchase',
    tableName: 'user_track_group_purchase'
  })

  UserTrackGroupPurchase.associate = (models) => {
    UserTrackGroupPurchase.belongsTo(models.TrackGroup, { as: 'track_group', sourceKey: 'trackGroupId', foreignKey: 'id' })
    UserTrackGroupPurchase.belongsTo(models.User, { as: 'user', sourceKey: 'userId', foreignKey: 'id' })
  }

  return UserTrackGroupPurchase
}
