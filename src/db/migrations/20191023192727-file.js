const { SUPPORTED_MEDIA_TYPES } = require('../../config/supported-media-types')
const FILE_STATUS_LIST = require('../../config/file-status-list')

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('files', {
      id: {
        type: Sequelize.UUID,
        allowNull: false,
        defaultValue: Sequelize.UUIDV4,
        unique: true,
        field: 'id',
        primaryKey: true
      },
      filename: {
        type: Sequelize.STRING,
        field: 'filename'
      },
      filename_prefix: {
        type: Sequelize.STRING,
        field: 'filename_prefix'
      },
      ownerId: {
        type: Sequelize.UUID,
        allowNull: false,
        field: 'owner_id'
      },
      description: {
        type: Sequelize.STRING,
        field: 'description'
      },
      size: {
        type: Sequelize.INTEGER,
        field: 'size'
      },
      hash: {
        type: Sequelize.STRING(64),
        field: 'hash'
      },
      status: {
        type: Sequelize.ENUM,
        defaultValue: 'processing',
        allowNull: false,
        values: FILE_STATUS_LIST
      },
      mime: {
        type: Sequelize.ENUM,
        values: SUPPORTED_MEDIA_TYPES,
        allowNull: false,
        field: 'mime'
      },
      metadata: {
        type: Sequelize.TEXT,
        field: 'metadata'
      },
      updatedAt: {
        field: 'updated_at',
        allowNull: false,
        type: Sequelize.DATE
      },
      createdAt: {
        field: 'created_at',
        allowNull: false,
        type: Sequelize.DATE
      }
    },
    {
      charset: 'utf8',
      collate: 'utf8_general_ci'
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('files')
  }
}
