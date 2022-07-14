module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('track_groups', {
      id: {
        type: Sequelize.UUID,
        allowNull: false,
        defaultValue: Sequelize.UUIDV4,
        unique: true,
        field: 'id',
        primaryKey: true
      },
      cover: {
        type: Sequelize.UUID,
        field: 'cover'
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
        field: 'title'
      },
      type: {
        type: Sequelize.ENUM,
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
        type: Sequelize.TEXT,
        field: 'about'
      },
      private: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false,
        field: 'private'
      },
      display_artist: {
        type: Sequelize.STRING,
        field: 'display_artist'
      },
      creator_id: {
        type: Sequelize.INTEGER,
        field: 'creator_id'
      },
      composers: {
        type: Sequelize.TEXT,
        field: 'composers'
      },
      performers: {
        type: Sequelize.TEXT,
        field: 'performers'
      },
      tags: {
        type: Sequelize.TEXT,
        field: 'tags'
      },
      release_date: {
        type: Sequelize.DATEONLY,
        defaultValue: Sequelize.NOW,
        field: 'release_date'
      },
      download: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        field: 'download'
      },
      featured: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        field: 'featured'
      },
      enabled: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        field: 'enabled'
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
    return queryInterface.dropTable('track_groups')
  }
}
