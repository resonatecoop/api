module.exports = {
  up: (queryInterface, DataTypes) => {
    return queryInterface.createTable('rsntr_gf_entry', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'id'
      },
      form_id: {
        type: DataTypes.INTEGER,
        field: 'form_id'
      },
      date_created: {
        type: DataTypes.DATE,
        field: 'date_created'
      },
      date_updated: {
        type: DataTypes.DATE,
        field: 'date_updated'
      },
      currency: {
        type: DataTypes.STRING(5),
        field: 'currency'
      },
      ip: {
        type: DataTypes.STRING(39),
        allowNull: false,
        field: 'ip'
      },
      user_agent: {
        type: DataTypes.STRING(250),
        field: 'user_agent'
      },
      payment_status: {
        type: DataTypes.STRING(15),
        field: 'payment_status'
      },
      payment_date: {
        type: DataTypes.DATE,
        field: 'payment_date'
      },
      payment_amount: {
        type: DataTypes.DECIMAL(19, 2),
        field: 'payment_amount'
      },
      payment_method: {
        type: DataTypes.STRING(30),
        field: 'payment_method'
      },
      transaction_id: {
        type: DataTypes.STRING(50),
        field: 'transaction_id'
      },
      is_fulfilled: {
        type: DataTypes.INTEGER,
        field: 'is_fulfilled'
      },
      created_by: {
        type: DataTypes.BIGINT,
        field: 'created_by'
      },
      transaction_type: {
        type: DataTypes.INTEGER,
        field: 'transaction_type'
      },
      status: {
        type: DataTypes.STRING(20),
        field: 'status'
      }
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('rsntr_gf_entry')
  }
}
