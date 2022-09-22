module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('playlists', {
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
      creatorId: {
        type: Sequelize.UUID,
        field: 'creator_id'
      },
      tags: {
        type: Sequelize.TEXT,
        field: 'tags'
      },
      tracks: {
        type: Sequelize.ARRAY(Sequelize.UUID)
      },
      featured: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        field: 'featured'
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
      },
      deletedAt: {
        field: 'deleted_at',
        type: Sequelize.DATE
      }
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('playlists')
  }
}
