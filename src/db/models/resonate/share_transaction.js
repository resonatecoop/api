module.exports = (sequelize, DataTypes) => {
  const ShareTransaction = sequelize.define('ShareTransaction', {
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
    legacySource: {
      type: DataTypes.STRING,
      field: 'legacy_source'
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    invoiceId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false
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
    underscored: true,
    modelName: 'ShareTransaction',
    tableName: 'share_transactions'
  })

  return ShareTransaction
}
