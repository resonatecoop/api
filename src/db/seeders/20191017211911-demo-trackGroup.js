module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('track_groups', [
      {
        id: '32573558-eadb-4e44-b008-f6966e474bc2',
        title: 'Best album ever',
        type: 'lp',
        about: 'this is the best album',
        creator_id: 2124,
        display_artist: '@auggod',
        release_date: new Date('2019-01-01'),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 'f7d32260-934a-4360-b8fa-96c6f8ef309c',
        title: 'Best album ever 2',
        type: 'lp',
        about: 'this is the best album',
        creator_id: 2124,
        display_artist: '@auggod',
        release_date: new Date('2019-01-01'),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: '2672d378-4d26-4b17-aee7-32dd4b6b050f',
        title: 'Best album ever 2',
        type: 'lp',
        about: 'this is the best album',
        creator_id: 2124,
        display_artist: '@auggod',
        performers: ['auggod'],
        release_date: new Date('2019-01-01'),
        created_at: new Date(),
        updated_at: new Date()
      }
    ])
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('track_groups', null, {})
  }
}
