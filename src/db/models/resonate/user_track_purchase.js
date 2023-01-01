module.exports = (sequelize, DataTypes) => {
  const UserTrackPurchase = sequelize.define('UserTrackPurchase', {
    userId: {
      type: DataTypes.UUID,
      field: 'user_id',
      primaryKey: true
    },
    trackId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'track_id',
      primaryKey: true
    },
    type: {
      type: DataTypes.ENUM,
      allowNull: false,
      values: ['purchase', 'plays']
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
    underscored: true,
    modelName: 'UserTrackPurchase',
    tableName: 'user_track_purchase'
  })

  UserTrackPurchase.associate = (models) => {
    UserTrackPurchase.belongsTo(models.Track, { as: 'track', sourceKey: 'trackId', foreignKey: 'id' })
    UserTrackPurchase.belongsTo(models.User, { as: 'user', sourceKey: 'userId', foreignKey: 'id' })
  }

  return UserTrackPurchase
}
