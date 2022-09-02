module.exports = {
  up: (queryInterface, DataTypes) => {
    return queryInterface.createTable('orders', {
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
        field: 'details'
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
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('orders')
  }
}
