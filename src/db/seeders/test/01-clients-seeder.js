
module.exports = {
  up: (queryInterface, Sequelize) => {
    // Seeds something for a local client
    return queryInterface.sequelize.query(
      `INSERT INTO public.clients (id, key, secret, grant_types, response_types, redirect_uris, application_name, application_url, meta_data, updated_at, created_at, deleted_at)
          VALUES(1, '81b4671a-f40a-4479-a449-c87499904ddf', 'matron-fling-raging-send-herself-ninth', '{authorization_code}', '{code}', '{http://localhost:8080}', 'Test', 'http://test.test', '{"allowed-cors-origins": ["http://localhost:8080"]}' ,'2022-09-09 16:39:02.39+00', '2022-06-09 09:58:55.29+00', NULL);`
    ).catch(console.error)
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('clients', null, {})
  }
}
