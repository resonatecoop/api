module.exports = (sequelize, DataTypes) => {
  const PlaylistItem = sequelize.define('PlaylistItem', {
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
    playlistId: {
      type: DataTypes.UUID,
      validate: {
        isUUID: 4
      },
      field: 'playlist_id'
    },
    trackId: {
      type: DataTypes.UUID,
      field: 'track_id'
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
    modelName: 'PlaylistItem',
    paranoid: true,
    underscore: true,
    tableName: 'playlist_items'
  })

  PlaylistItem.associate = function (models) {
    PlaylistItem.hasOne(models.Track, { as: 'track', sourceKey: 'trackId', foreignKey: 'id' })
    PlaylistItem.belongsTo(models.Playlist, { foreignKey: 'playlistId' })
  }

  return PlaylistItem
}
