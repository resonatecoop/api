const types = ['free', 'paid']

module.exports = (sequelize, DataTypes) => {
  const Play = sequelize.define('Play', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    trackId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false
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
        min: 0,
        max: 1
      },
      defaultValue: 0,
      field: 'event'
    },
    createdAt: {
      type: DataTypes.DATE,
      field: 'created_at'
    }
  }, {
    timestamps: false,
    underscored: true,
    modelName: 'Play',
    tableName: 'plays'
  })

  Play.associate = function (models) {
    Play.belongsTo(models.Track, { sourceKey: 'trackId', foreignKey: 'id' })
    Play.belongsTo(models.User, { sourceKey: 'userId', foreignKey: 'id' })
  }

  return Play
}
