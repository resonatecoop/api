const { SUPPORTED_MEDIA_TYPES } = require('../../../config/supported-media-types')
const FILE_STATUS_LIST = require('../../../config/file-status-list')

/**
 * File model for both image and audio types
 * Some props are only for images
 */

module.exports = (sequelize, DataTypes) => {
  const File = sequelize.define('File', {
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
    filename: {
      type: DataTypes.STRING,
      field: 'filename'
    },
    filename_prefix: {
      type: DataTypes.STRING,
      field: 'filename_prefix'
    },
    owner_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'owner_id'
    },
    description: {
      type: DataTypes.STRING,
      field: 'description'
    },
    size: {
      type: DataTypes.INTEGER,
      field: 'size'
    },
    hash: {
      type: DataTypes.STRING(64),
      field: 'hash'
    },
    status: {
      type: DataTypes.ENUM,
      defaultValue: 'processing',
      allowNull: false,
      values: FILE_STATUS_LIST
    },
    mime: {
      type: DataTypes.ENUM,
      values: SUPPORTED_MEDIA_TYPES,
      allowNull: false,
      field: 'mime'
    },
    metadata: {
      type: DataTypes.TEXT,
      field: 'metadata',
      get () {
        const metadata = this.getDataValue('metadata')
        if (metadata) return JSON.parse(metadata)
        return metadata
      },
      set (metadata) {
        this.setDataValue('metadata', JSON.stringify(metadata))
      }
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
    timestamps: true,
    modelName: 'File',
    tableName: 'files'
  })

  File.associate = function (models) {
    File.hasMany(models.Track, {
      as: 'audiofile',
      foreignKey: 'track_url'
    })
    File.hasMany(models.Track, {
      as: 'cover',
      foreignKey: 'track_cover_art'
    })
  }

  return File
}
