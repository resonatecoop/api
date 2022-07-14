const decodeUriComponent = require('decode-uri-component')

/**
 * This is a legacy table and should be READ ONLY
 */

module.exports = (sequelize, DataTypes) => {
  const Tag = sequelize.define('Tag', {
    id: {
      primaryKey: true,
      autoIncrement: true,
      type: DataTypes.INTEGER,
      field: 'tagid'
    },
    trackId: {
      type: DataTypes.INTEGER,
      field: 'tid'
    },
    tagnames: {
      type: DataTypes.STRING,
      field: 'tagnames',
      get () {
        const tags = this.getDataValue('tagnames')
        // tags may have been urlencoded twice...
        return decodeUriComponent(tags)
          .split(',')
          .map(item => item.trim())
          .map(tag => decodeUriComponent(tag)
            .split(',')
            .map(tag => tag.trim())
          ).flat(1)
      }
    }
  }, {
    timestamps: false,
    modelName: 'Tag',
    tableName: 'tags'
  })

  Tag.associate = function (models) {
    Tag.belongsTo(models.Track, { as: 'Tag', foreignKey: 'id' })
  }

  return Tag
}
