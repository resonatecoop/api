module.exports = (sequelize, DataTypes) => {
  const TrackGroupItem = sequelize.define('TrackGroupItem', {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      validate: {
        isUUID: 4
      },
      unique: true,
      field: 'id'
    },
    index: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'index'
    },
    trackgroupId: {
      type: DataTypes.UUID,
      validate: {
        isUUID: 4
      },
      field: 'track_group_id'
    },
    track_id: {
      type: DataTypes.INTEGER,
      field: 'track_id'
    },
    track_performers: {
      type: DataTypes.STRING,
      field: 'track_performers'
    },
    track_composers: {
      type: DataTypes.STRING,
      field: 'track_composers'
    },
    updatedAt: {
      field: 'updated_at',
      allowNull: false,
      type: DataTypes.DATE
    },
    createdAt: {
      field: 'created_at',
      allowNull: false,
      type: DataTypes.DATE
    },
    deletedAt: {
      field: 'deleted_at',
      type: DataTypes.DATE
    }
  }, {
    modelName: 'TrackGroupItem',
    paranoid: true,
    underscore: true,
    tableName: 'track_group_items'
  })

  TrackGroupItem.associate = function (models) {
    TrackGroupItem.hasOne(models.Track, { as: 'track', sourceKey: 'track_id', foreignKey: 'id' })
    TrackGroupItem.belongsTo(models.TrackGroup, { as: 'TrackGroupItem', foreignKey: 'trackgroupId' })
  }

  return TrackGroupItem
}
