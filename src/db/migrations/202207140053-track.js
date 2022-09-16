module.exports = {
  up: (queryInterface, DataTypes) => {
    return queryInterface.createTable('tracks', {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
        unique: true,
        field: 'id',
        primaryKey: true
      },
      legacyId: {
        type: DataTypes.INTEGER,
        field: 'legacy_id'
      },
      creatorId: {
        type: DataTypes.UUID,
        field: 'creator_id'
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
        field: 'track_duration'
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
      tags: {
        type: DataTypes.ARRAY(DataTypes.STRING)
      },
      status: {
        type: DataTypes.INTEGER,
        validate: {
          minimum: 0,
          maximum: 4
        },
        defaultValue: 1, // hidden
        field: 'status'
      },
      createdAt: {
        type: DataTypes.DATE,
        field: 'created_at',
        allowNull: false
      },
      updatedAt: {
        type: DataTypes.DATE,
        field: 'updated_at',
        allowNull: false
      },
      deletedAt: {
        type: DataTypes.DATE,
        field: 'deleted_at'
      }
    }, {
      timestamps: false,
      modelName: 'Track',
      tableName: 'tracks'
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('tracks')
  }
}
