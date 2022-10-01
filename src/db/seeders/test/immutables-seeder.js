
// https://www.appsloveworld.com/sequelizejs/100/6/orm-sequelize-can-i-use-raw-queries-in-seeders-files

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(
      `
        INSERT INTO public.roles (id, name, description, is_default) VALUES (1, 'superadmin', 'SuperAdminRole has all permissions and can assign admins', false);
        INSERT INTO public.roles (id, name, description, is_default) VALUES (2, 'admin', 'AdminRole has Admin permissions across all tenants, except the ability to assign other Admins', false);
        INSERT INTO public.roles (id, name, description, is_default) VALUES (3, 'tenantadmin', 'TenantAdmin has Admin permissions over other users in their tenant', false);
        INSERT INTO public.roles (id, name, description, is_default) VALUES (4, 'artist', 'An artist', false);
        INSERT INTO public.roles (id, name, description, is_default) VALUES (5, 'label', 'A label', false);
        INSERT INTO public.roles (id, name, description, is_default) VALUES (6, 'user', 'A basic user', true);     

        INSERT INTO public.membership_classes (id, name, price_id, product_id) VALUES (1, 'Listener', 'price_', 'prod_');
        INSERT INTO public.membership_classes (id, name, price_id, product_id) VALUES (2, 'Artist', 'price_', 'prod_');
        INSERT INTO public.membership_classes (id, name, price_id, product_id) VALUES (3, 'Label', 'price_', 'prod_');

        INSERT INTO public.user_group_types (id, name, description) VALUES (1, 'artist', 'Artist');
        INSERT INTO public.user_group_types (id, name, description) VALUES (2, 'band', 'Band');
        INSERT INTO public.user_group_types (id, name, description) VALUES (3, 'label', 'Label');
        INSERT INTO public.user_group_types (id, name, description) VALUES (4, 'distributor', 'Distributor');
      `
    )
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('roles', null, {})
    await queryInterface.bulkDelete('user_group_types', null, {})
    return queryInterface.bulkDelete('membership_classes', null, {})
  }
}
