module.exports = (sequelize, DataTypes) => {
  const UserLedgerEntry = sequelize.define('UserLedgerEntry', {
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
      allowNull: false,
      type: DataTypes.DATE
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE
    },
    deletedAt: {
      type: DataTypes.DATE
    }
  }, {
    sequelize,
    timestamps: true,
    paranoid: true,
    underscored: true,
    modelName: 'UserLedgerEntry',
    tableName: 'user_ledger_entries'
  })

  UserLedgerEntry.associate = (models) => {
    UserLedgerEntry.belongsTo(models.User, { as: 'user', sourceKey: 'userId', foreignKey: 'id' })
  }

  return UserLedgerEntry
}
