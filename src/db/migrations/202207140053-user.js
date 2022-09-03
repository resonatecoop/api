module.exports = {
  up: (queryInterface, DataTypes) => {
    return queryInterface.createTable('users', {
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
      legacyID: {
        type: DataTypes.INTEGER,
        primaryKey: false,
        autoIncrement: true, // SERIAL on postgres
        field: 'legacy_id'
      },
      password: {
        type: DataTypes.STRING(1024),
        allowNull: false,
        field: 'password'
      },
      email: {
        type: DataTypes.STRING,
        unique: true,
        field: 'email',
        allowNull: false
      },
      emailConfirmed: {
        type: DataTypes.BOOLEAN,
        field: 'email_confirmed',
        defaultValue: false
      },
      displayName: {
        type: DataTypes.STRING,
        field: 'display_name'
      },
      country: {
        type: DataTypes.STRING
      },
      fullName: {
        type: DataTypes.STRING
      },
      member: {
        type: DataTypes.BOOLEAN
      },
      newsletterNotification: {
        type: DataTypes.BOOLEAN,
        default: false
      },
      lastLogin: {
        type: DataTypes.DATE
      },
      lastPasswordChange: {
        type: DataTypes.DATE
      },
      roleId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'role_id'
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
      timestamps: false,
      modelName: 'User',
      tableName: 'users'
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('users')
  }
}
