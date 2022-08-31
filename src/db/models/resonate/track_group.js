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
      unique: true,
      field: 'id'
    },
    cover: {
      type: DataTypes.UUID,
      allowNull: false,
      validate: {
        isUUID: 4
      },
      field: 'cover'
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'title',
      validate: {
        notNull: {
          msg: 'Title is a required field'
        }
      }
    },
    slug: {
      type: DataTypes.STRING,
      field: 'slug'
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
      ],
      field: 'type'
    },
    about: {
      type: DataTypes.TEXT,
      field: 'about'
    },
    private: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
      field: 'private'
    },
    display_artist: {
      type: DataTypes.STRING,
      field: 'display_artist'
    },
    creator_id: {
      type: DataTypes.UUID,
      field: 'creator_id'
    },
    composers: {
      type: DataTypes.TEXT,
      field: 'composers',
      set (composers) {
        this.setDataValue('composers', composers.join(','))
      },
      get () {
        const composers = this.getDataValue('composers')
        return composers ? composers.split(',') : []
      }
    },
    performers: {
      type: DataTypes.TEXT,
      field: 'performers',
      set (performers) {
        this.setDataValue('performers', performers.join(','))
      },
      get () {
        const performers = this.getDataValue('performers')
        return performers ? performers.split(',') : []
      }
    },
    tags: {
      type: DataTypes.TEXT,
      field: 'tags',
      set (tags) {
        this.setDataValue('tags', tags.join(','))
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
      defaultValue: DataTypes.NOW,
      field: 'release_date'
    },
    download: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'download'
    },
    featured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'featured'
    },
    enabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'enabled'
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
    }
  }, {
    sequelize,
    timestamps: true,
    modelName: 'TrackGroup',
    tableName: 'track_groups'
  })

  TrackGroup.beforeCreate(async (trackGroup, options) => {
    const slugTitle = slug(trackGroup.title)
    const result = await TrackGroup.findOne({
      attributes: ['id'],
      where: {
        creator_id: trackGroup.creator_id,
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
    TrackGroup.hasOne(models.User, { as: 'user', sourceKey: 'creator_id', foreignKey: 'id' })
    TrackGroup.hasMany(models.UserMeta, { as: 'usermeta', sourceKey: 'creator_id', foreignKey: 'user_id' })
    TrackGroup.hasMany(models.TrackGroupItem, { as: 'items', foreignKey: 'trackgroupId', sourceKey: 'id' })
  }

  return TrackGroup
}
