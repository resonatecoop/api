const { faker } = require('@faker-js/faker')

function getRandomInt (min, max) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1)) + min
}

const generateTracks = () => {
  return Array(200)
    .fill()
    .map((v, i) => {
      return {
        uid: getRandomInt(1, 1000),
        track_name: faker.company.catchPhrase(),
        track_artist: faker.name.findName(),
        track_album: 'Best album ever',
        status: getRandomInt(0, 3),
        date: getRandomInt(1622697305, Math.floor(Date.now() / 1000))
      }
    })
}

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tracks = generateTracks()
    return queryInterface.bulkInsert('tracks', tracks)
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('tracks', null, {})
  }
}
