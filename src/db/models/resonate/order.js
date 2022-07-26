module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define('Order', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'oid'
    },
    user_id: {
      type: DataTypes.UUID,
      field: 'uid'
    },
    amount: {
      type: DataTypes.DOUBLE,
      field: 'amount'
    },
    currency: {
      type: DataTypes.STRING(10),
      field: 'currency',
      allowNull: true,
      enum: [
        'USD',
        'EUR'
      ]
    },
    transaction_id: {
      type: DataTypes.STRING,
      field: 'txid'
    },
    vat: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'vat'
    },
    details: {
      type: DataTypes.TEXT,
      field: 'details',
      set (details) {
        this.setDataValue('details', JSON.stringify(details))
      },
      get () {
        const details = this.getDataValue('details')
        if (details) return JSON.parse(details)
        return details
      }
    },
    payment_status: {
      type: DataTypes.INTEGER,
      field: 'pstatus'
    },
    status: {
      type: DataTypes.INTEGER,
      field: 'ostatus'
    },
    type: {
      type: DataTypes.INTEGER,
      field: 'type'
    },
    createdAt: {
      type: DataTypes.INTEGER,
      field: 'date'
    }
  }, {
    timestamps: false,
    modelName: 'Order',
    tableName: 'orders'
  })

  return Order
}
