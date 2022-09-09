
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Seeds standard roles
    await queryInterface.bulkInsert('roles', [{
      name: 'superadmin',
      description: 'SuperAdminRole has all permissions and can assign admins',
      is_default: false
    }, {
      name: 'admin',
      description: 'AdminRole has Admin permissions across all tenants, except the ability to assign other Admins',
      is_default: false
    }, {
      description: 'TenantAdmin has Admin permissions over other users in their tenant',
      name: 'tenantadmin',
      is_default: false
    }, {
      name: 'artist',
      description: 'An artist',
      is_default: true
    }, {
      name: 'user',
      description: 'A basic user',
      is_default: true
    }])

    await queryInterface.bulkInsert('membership_classes', [{
      name: 'Listener',
      priceId: 'price_',
      productId: 'prod_'
    }, {
      name: 'Artist',
      priceId: 'price_',
      productId: 'prod_'
    }, {
      name: 'Label',
      priceId: 'price_',
      productId: 'prod_'
    }])

    await queryInterface.bulkInsert('user_group_types', [{
      name: 'artist',
      description: 'Artist'
    }, {
      name: 'band',
      description: 'Band'
    }, {
      name: 'label',
      description: 'Label'
    }, {
      name: 'distributor',
      description: 'Distributor'
    }])
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('roles', null, {})
  }
}
