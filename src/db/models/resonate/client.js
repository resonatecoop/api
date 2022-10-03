module.exports = (sequelize, DataTypes) => {
  const Client = sequelize.define('Client', {
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
      field: 'grant_types'
    },
    responseTypes: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
      field: 'response_types'
    },
    redirectURIs: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: 0,
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
    metaData: {
      type: DataTypes.JSONB
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
  }, {
    sequelize,
    underscore: true,
    paranoid: true,
    modelName: 'Client',
    tableName: 'clients'
  })

  return Client
}
