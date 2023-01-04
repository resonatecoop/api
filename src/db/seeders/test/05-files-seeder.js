// THIS HAS TO RUN AFTER THE TRACKGROUP SEEDER FILE
//    it updates tracks table, so tracks table needs records
//      tracks table is seeded in trackgroups seeder

// const { request, testArtistUserId, testAccessToken, TestRedisAdapter } = require('../../../../test/testConfig')

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Seeds the files table with test audio. 30 files total, 10 per album

    // raw sql goes here vvv

  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('files', null, {})
  }
}
