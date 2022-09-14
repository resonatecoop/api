module.exports = {
  up: (queryInterface, DataTypes) => {
    return queryInterface.createTable('user_memberships', {
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
        field: 'user_id'
      },
      membershipClassId: {
        type: DataTypes.INTEGER,
        field: 'membership_class_id',
        allowNull: false
      },
      subscriptionId: { // This is in reference to Stripe codes
        type: DataTypes.STRING,
        field: 'subscription_id',
        allowNull: false
      },
      start: {
        type: DataTypes.TIME
      },
      end: {
        type: DataTypes.TIME
      },
      updated_at: {
        allowNull: false,
        type: DataTypes.DATE
      },
      created_at: {
        allowNull: false,
        type: DataTypes.DATE
      },
      deleted_at: {
        type: DataTypes.DATE
      }
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('user_memberships')
  }
}
