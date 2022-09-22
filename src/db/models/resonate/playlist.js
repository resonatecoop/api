module.exports = (sequelize, DataTypes) => {
  const Playlist = sequelize.define('Playlist', {
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
    cover: {
      type: DataTypes.UUID,
      validate: {
        isUUID: 4
      }
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Title is a required field'
        }
      }
    },
    about: {
      type: DataTypes.TEXT
    },
    private: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false
    },
    creatorId: {
      type: DataTypes.UUID
    },
    tags: {
      type: DataTypes.TEXT,
      set (tags) {
        if (tags) {
          this.setDataValue('tags', tags.join(','))
        }
      },
      get () {
        const tags = this.getDataValue('tags')
        if (tags) {
          return tags
            .split(',')
            .map(tag => tag
              .trim()
              .toLowerCase()
            ).filter(Boolean)
        }
        return []
      }
    },
    tracks: {
      type: DataTypes.ARRAY(DataTypes.UUID)
    },
    featured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
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
    sequelize,
    paranoid: true,
    underscore: true,
    modelName: 'Playlist',
    tableName: 'playlists'
  })

  Playlist.associate = function (models) {
    Playlist.hasOne(models.File, { as: 'cover_metadata', sourceKey: 'cover', foreignKey: 'id' })
    Playlist.hasOne(models.User, { as: 'creator', sourceKey: 'creatorId', foreignKey: 'id' })
  }

  return Playlist
}
