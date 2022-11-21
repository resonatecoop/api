const numbro = require('numbro')
const roundTo = require('round-to')
const { Op } = require('sequelize')

const statusValues = ['free+paid', 'hidden', 'free', 'paid', 'deleted']

module.exports = (sequelize, DataTypes) => {
  const Track = sequelize.define('Track', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
      validate: {
        isUUID: 4
      },
      unique: true
    },
    legacyId: {
      type: DataTypes.INTEGER
    },
    creatorId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    title: {
      type: DataTypes.STRING,
      field: 'track_name'
    },
    artist: {
      type: DataTypes.STRING,
      field: 'track_artist'
    },
    album: {
      type: DataTypes.STRING,
      field: 'track_album'
    },
    duration: {
      type: DataTypes.STRING(15),
      field: 'track_duration',
      get () {
        const duration = this.getDataValue('duration')
        return numbro.unformat(duration)
      },
      set (duration) {
        this.setDataValue('duration', numbro(roundTo.down(duration, 2)).format())
      }
    },
    album_artist: {
      type: DataTypes.STRING,
      field: 'track_album_artist'
    },
    composer: {
      type: DataTypes.STRING,
      field: 'track_composer'
    },
    year: {
      type: DataTypes.INTEGER,
      field: 'track_year'
    },
    url: {
      type: DataTypes.UUID,
      field: 'track_url'
    },
    cover_art: {
      type: DataTypes.UUID,
      field: 'track_cover_art'
    },
    number: {
      type: DataTypes.INTEGER,
      field: 'track_number'
    },
    status: {
      type: DataTypes.INTEGER,
      validate: {
        min: 0,
        max: 4
      },
      set (status) {
        this.setDataValue('status', statusValues.indexOf(status))
      },
      get () {
        const status = this.getDataValue('status')
        return statusValues[status]
      },
      defaultValue: 1 // hidden
    },
    tags: {
      type: DataTypes.ARRAY(DataTypes.STRING)
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
    modelName: 'Track',
    paranoid: true,
    scopes: {
      details: () => ({
        include: [{
          model: sequelize.models.TrackGroupItem,
          attributes: ['index'],
          as: 'trackOn',
          include: [{
            model: sequelize.models.TrackGroup,
            as: 'trackGroup',
            attributes: ['title', 'cover', 'id']
          }]
        }, {
          model: sequelize.models.File,
          attributes: ['id'],
          as: 'audiofile'
        },
        {
          model: sequelize.models.UserGroup,
          attributes: ['displayName', 'id'],
          as: 'creator'
        }]
      }),
      public: () => ({
        where: {
          status: {
            [Op.in]: [0, 2, 3]
          }
        }

      }),
      publicTrackgroup: () => ({
        include: [
          {
            model: sequelize.models.TrackGroupItem,
            attributes: ['index'],
            required: true,
            as: 'trackOn',
            include: [{
              model: sequelize.models.TrackGroup,
              required: true,
              as: 'trackGroup',
              attributes: ['title', 'cover', 'id'],
              where: {
                enabled: true,
                private: false
              }
            }]
          }
        ]
      }),
      loggedIn: (userId) => {
        return userId
          ? {
              include: [{
                as: 'plays',
                required: false,
                model: sequelize.models.Play,
                where: {
                  userId
                }
              }, {
                as: 'favorites',
                required: false,
                model: sequelize.models.Favorite,
                where: {
                  userId,
                  type: true
                }
              }]
            }
          : {}
      }
    },
    underscored: true,
    tableName: 'tracks'
  })

  Track.associate = function (models) {
    Track.hasMany(models.TrackGroupItem, { targetKey: 'trackId', as: 'trackOn' })
    Track.hasMany(models.Play, { targetKey: 'trackId', as: 'plays' })
    Track.hasMany(models.Favorite, { targetKey: 'trackId', as: 'favorites' })
    Track.hasOne(models.UserGroup, { as: 'creator', sourceKey: 'creatorId', foreignKey: 'id' })
    Track.hasOne(models.File, { as: 'cover_metadata', sourceKey: 'track_cover_art', foreignKey: 'id' })
    Track.belongsTo(models.File, { as: 'audiofile', foreignKey: 'track_url' })
    Track.belongsTo(models.File, { as: 'cover', foreignKey: 'track_cover_art' })
  }

  return Track
}
