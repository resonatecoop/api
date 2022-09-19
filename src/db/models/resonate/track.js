const numbro = require('numbro')
const roundTo = require('round-to')

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
      type: DataTypes.UUID
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
    underscored: true,
    tableName: 'tracks'
  })

  Track.associate = function (models) {
    Track.hasMany(models.TrackGroupItem, { foreignKey: 'trackId' })
    Track.hasMany(models.Play, { foreignKey: 'trackId', sourceKey: 'id' })
    // Track.hasMany(models.Tag, { as: 'tags', foreignKey: 'trackId', sourceKey: 'id' })
    // Track.hasMany(models.UserMeta, { as: 'meta', foreignKey: 'user_id', sourceKey: 'creator_id' })
    Track.hasOne(models.UserGroup, { as: 'creator', sourceKey: 'creatorId', foreignKey: 'id' })
    Track.hasOne(models.File, { as: 'cover_metadata', sourceKey: 'track_cover_art', foreignKey: 'id' })
    Track.belongsTo(models.File, { as: 'audiofile', foreignKey: 'track_url' })
    Track.belongsTo(models.File, { as: 'cover', foreignKey: 'track_cover_art' })
  }

  return Track
}
