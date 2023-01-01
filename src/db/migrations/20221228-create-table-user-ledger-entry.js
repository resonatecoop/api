module.exports = {
  up: (queryInterface, DataTypes) => {
    return queryInterface.createTable('user_ledger_entries', {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        validate: {
          isUUID: 4
        },
        unique: true
      },
      userId: {
        type: DataTypes.UUID,
        field: 'user_id'
      },
      type: {
        type: DataTypes.ENUM,
        values: ['credit', 'debit'],
        allowNull: false
      },
      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      extra: {
        type: DataTypes.JSONB,
        field: 'extra'
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
    return queryInterface.dropTable('user_ledger_entries')
  }
}
