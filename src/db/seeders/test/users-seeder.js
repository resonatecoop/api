const { Credit } = require('../../models')

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Credit.create({
      userId: '251c01f6-7293-45f6-b8cd-242bdd76cd0d',
      total: 10000
    })
    return queryInterface.sequelize.query(
      `
        INSERT INTO public.users (id, legacy_id, password, email, email_confirmed, display_name, country, full_name, member, newsletter_notification, last_login, last_password_change, role_id, updated_at, created_at, deleted_at) 
          VALUES ('1c88dea6-0519-4b61-a279-4006954c5d4c', NULL, '$2a$04$fJ6Du2KKdTG4B2FpvM.diOYSSD6kSBhvwWkeCnejj/s2lublLZIQi', 'artist@admin.com', true, 'artist', NULL, NULL, NULL, NULL, NULL, NULL, 4, '2022-01-30 08:13:41.884+00', '2022-05-15 05:44:49.078+00', NULL);
        INSERT INTO public.users (id, legacy_id, password, email, email_confirmed, display_name, country, full_name, member, newsletter_notification, last_login, last_password_change, role_id, updated_at, created_at, deleted_at) 
          VALUES ('251c01f6-7293-45f6-b8cd-242bdd76cd0d', NULL, '$2a$04$2kRrLFrEW/XL6X4TY2pzTO18N7Y5wd5f32HzxK.4.rSLakFIhh.Qq', 'listener@admin.com', true, 'listener', NULL, NULL, NULL, NULL, NULL, NULL, 4, '2022-05-25 11:16:07.828+00', '2021-11-11 05:55:47.116+00', NULL);
        INSERT INTO public.users (id, legacy_id, password, email, email_confirmed, display_name, country, full_name, member, newsletter_notification, last_login, last_password_change, role_id, updated_at, created_at, deleted_at) 
          VALUES ('71175a23-9256-41c9-b8c1-cd2170aa6591', NULL, '$2a$04$XPeruRJNIrnewWfkhtZ3v.5AZxgRgGUh3T/k57040AFXKUlzDvva.', 'admin@admin.com', true, 'admin', NULL, NULL, NULL, NULL, NULL, NULL, 1, '2021-11-02 23:32:46.074+00', '2021-11-23 02:12:17.516+00', NULL);
      `
    ).catch(console.error)
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('users', null, {})
  }
}
