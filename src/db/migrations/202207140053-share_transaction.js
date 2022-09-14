module.exports = {
  up: (queryInterface, DataTypes) => {
    return queryInterface.createTable('share_transactions', {
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
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'user_id'
      },
      invoiceId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        field: 'invoice_id'
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false
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
    return queryInterface.dropTable('share_transactions')
  }
}
