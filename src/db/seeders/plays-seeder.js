function getRandomInt (min, max) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1)) + min
}

const { faker } = require('@faker-js/faker')
console.log('faker', faker)

const generatePlays = () => {
  console.log('generating plays')
  return Array(getRandomInt(1000, 2000))
    .fill()
    .map((v, i) => {
      return {
        uid: getRandomInt(1, 100), // listener id
        tid: getRandomInt(1, 100), // track id
        event: 1, // paid
        date: faker.date.between(1506828778, 1633059178).toISOString()
      }
    })
}

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const plays = generatePlays()
    return queryInterface.bulkInsert('plays', plays)
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('plays', null, {})
  }
}
