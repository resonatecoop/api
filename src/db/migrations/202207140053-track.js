module.exports = {
  up: (queryInterface, DataTypes) => {
    return queryInterface.createTable('tracks', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'tid'
      },
      creator_id: {
        type: DataTypes.INTEGER,
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
        type: DataTypes.INTEGER,
        field: 'date'
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
