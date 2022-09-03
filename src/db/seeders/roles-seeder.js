
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Seeds standard roles
    return queryInterface.bulkInsert('roles', [{
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
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('roles', null, {})
  }
}
