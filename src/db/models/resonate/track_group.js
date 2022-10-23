const slug = require('slug')

module.exports = (sequelize, DataTypes) => {
  const TrackGroup = sequelize.define('TrackGroup', {
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
      allowNull: false,
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
    slug: {
      type: DataTypes.STRING
    },
    type: {
      type: DataTypes.ENUM,
      values: [
        'lp', // long player
        'ep', // extended play
        'single',
        'playlist',
        'compilation',
        'collection',
        'podcast'
      ]
    },
    about: {
      type: DataTypes.TEXT
    },
    private: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false
    },
    display_artist: {
      type: DataTypes.STRING
    },
    creatorId: {
      type: DataTypes.UUID
    },
    composers: {
      type: DataTypes.TEXT,
      set (composers) {
        if (composers) {
          this.setDataValue('composers', composers.join(','))
        }
      },
      get () {
        const composers = this.getDataValue('composers')
        return composers ? composers.split(',') : []
      }
    },
    performers: {
      type: DataTypes.TEXT,
      set (performers) {
        if (performers) {
          this.setDataValue('performers', performers.join(','))
        }
      },
      get () {
        const performers = this.getDataValue('performers')
        return performers ? performers.split(',') : []
      }
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
    release_date: {
      type: DataTypes.DATEONLY,
      defaultValue: DataTypes.NOW
    },
    download: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    featured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    enabled: {
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
    underscored: true,
    modelName: 'TrackGroup',
    tableName: 'track_groups'
  })

  TrackGroup.beforeCreate(async (trackGroup, options) => {
    const slugTitle = slug(trackGroup.title)
    const result = await TrackGroup.findOne({
      attributes: ['id'],
      where: {
        creatorId: trackGroup.creatorId,
        slug: slugTitle // slug needs to be unique within user scope
      }
    })

    if (result) {
      const err = new Error('A release or playlist with the same title already exists within your account.')
      return Promise.reject(err)
    }

    trackGroup.slug = slugTitle
  })

  TrackGroup.associate = function (models) {
    TrackGroup.hasOne(models.File, { as: 'cover_metadata', sourceKey: 'cover', foreignKey: 'id' })
    TrackGroup.hasOne(models.UserGroup, { as: 'creator', sourceKey: 'creatorId', foreignKey: 'id' })
    TrackGroup.hasMany(models.TrackGroupItem, { as: 'items', foreignKey: 'trackgroupId', sourceKey: 'id' })
  }

  return TrackGroup
}
