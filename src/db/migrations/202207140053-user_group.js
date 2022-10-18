module.exports = {
  up: (queryInterface, DataTypes) => {
    return queryInterface.createTable('user_groups', {
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
      ownerId: {
        type: DataTypes.UUID,
        validate: {
          isUUID: 4
        },
        field: 'owner_id',
        allowNull: false
      },
      typeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'type_id'
      },
      displayName: {
        type: DataTypes.STRING,
        field: 'display_name'
      },
      description: {
        type: DataTypes.TEXT,
        field: 'description'
      },
      shortBio: {
        type: DataTypes.TEXT,
        field: 'short_bio'
      },
      email: {
        type: DataTypes.STRING
      },
      addressId: {
        type: DataTypes.UUID,
        field: 'address_id'
      },
      avatar: {
        type: DataTypes.UUID
      },
      banner: {
        type: DataTypes.UUID
      },
      tags: {
        type: DataTypes.ARRAY(DataTypes.UUID)
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
    return queryInterface.dropTable('user_groups')
  }
}
