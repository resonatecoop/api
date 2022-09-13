
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
      is_default: false
    }, {
      name: 'label',
      description: 'A label',
      is_default: false
    }, {
      name: 'user',
      description: 'A basic user',
      is_default: true
    }])

    await queryInterface.bulkInsert('membership_classes', [{
      name: 'Listener',
      price_id: 'price_',
      product_id: 'prod_'
    }, {
      name: 'Artist',
      price_id: 'price_',
      product_id: 'prod_'
    }, {
      name: 'Label',
      price_id: 'price_',
      product_id: 'prod_'
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

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('roles', null, {})
    await queryInterface.bulkDelete('user_group_types', null, {})
    return queryInterface.bulkDelete('membership_classes', null, {})
  }
}
