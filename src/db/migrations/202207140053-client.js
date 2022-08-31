module.exports = {
  up: async (queryInterface, DataTypes) => {
    return queryInterface.createTable('clients', {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        field: 'id'
      },
      key: {
        type: DataTypes.UUID,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
        validate: {
          isUUID: 4
        },
        unique: true,
        field: 'key'
      },
      secret: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'secret'
      },
      grantTypes: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: false,
        defaultValue: [],
        field: 'grant_types'
      },
      responseTypes: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: false,
        defaultValue: [],
        field: 'response_types'
      },
      redirectURIs: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: [],
        field: 'redirect_uris'
      },
      applicationName: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'application_name'
      },
      applicationURL: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'application_url'
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
      },
      deletedAt: {
        field: 'deleted_at',
        type: DataTypes.DATE
      }
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('clients')
  }
}
