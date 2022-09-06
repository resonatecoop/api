const types = ['free', 'paid']

module.exports = (sequelize, DataTypes) => {
  const Play = sequelize.define('Play', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'pid'
    },
    track_id: {
      type: DataTypes.INTEGER,
      field: 'tid'
    },
    user_id: {
      type: DataTypes.UUID,
      field: 'uid'
    },
    type: {
      type: DataTypes.INTEGER,
      set (type) {
        this.setDataValue('type', types.indexOf(type))
      },
      get () {
        const type = this.getDataValue('type')
        return types[type]
      },
      validate: {
        minimum: 0,
        maximum: 1
      },
      defaultValue: 0,
      field: 'event'
    },
    createdAt: {
      type: DataTypes.INTEGER,
      field: 'date'
    }
  }, {
    timestamps: false,
    modelName: 'Play',
    tableName: 'plays'
  })

  Play.associate = function (models) {
    Play.hasOne(models.Track, { as: 'track', sourceKey: 'track_id', foreignKey: 'id' })
    Play.hasOne(models.User, { as: 'user', sourceKey: 'user_id', foreignKey: 'id' })
  }

  return Play
}
