const numbro = require('numbro')
const roundTo = require('round-to')

const statusValues = ['free+paid', 'hidden', 'free', 'paid', 'deleted']

module.exports = (sequelize, DataTypes) => {
  const Track = sequelize.define('Track', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'tid'
    },
    creator_id: {
      type: DataTypes.UUID,
      field: 'uid'
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
        minimum: 0,
        maximum: 4
      },
      set (status) {
        this.setDataValue('status', statusValues.indexOf(status))
      },
      get () {
        const status = this.getDataValue('status')
        return statusValues[status]
      },
      defaultValue: 1, // hidden
      field: 'status'
    },
    createdAt: {
      type: DataTypes.INTEGER,
      field: 'date'
    }
  }, {
    timestamps: false,
    modelName: 'Track',
    tableName: 'tracks'
  })

  Track.associate = function (models) {
    Track.hasMany(models.Play, { as: 'play', foreignKey: 'tid', sourceKey: 'id' })
    Track.hasMany(models.Tag, { as: 'tags', foreignKey: 'trackId', sourceKey: 'id' })
    Track.hasMany(models.UserMeta, { as: 'meta', foreignKey: 'user_id', sourceKey: 'creator_id' })
    Track.hasOne(models.User, { as: 'creator', sourceKey: 'creator_id', foreignKey: 'id' })
    Track.hasOne(models.File, { as: 'cover_metadata', sourceKey: 'track_cover_art', foreignKey: 'id' })
    Track.belongsTo(models.File, { as: 'audiofile', foreignKey: 'track_url' })
    Track.belongsTo(models.File, { as: 'cover', foreignKey: 'track_cover_art' })
  }

  return Track
}
