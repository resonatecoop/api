/* eslint-env mocha */

const Umzug = require('umzug')

const { Resonate: sequelize } = require('../src/db/models')

const seedsConfig = {
  storage: 'sequelize',
  storageOptions: {
    sequelize: sequelize,
    modelName: 'SequelizeData' // Or whatever you want to name the seeder storage table
  },
  migrations: {
    params: [
      sequelize.getQueryInterface(),
      sequelize.constructor
    ],
    path: 'src/db/seeders/test', // path to folder containing seeds
    pattern: /\.js$/
  }
}

const seeder = new Umzug(seedsConfig)

const ResetDB = () => {
  before('reset the test database to test seed data', async () => {
    console.log('<<< reseting the db... <<<')
    await seeder.down({ to: 0 })
    await seeder.up()
    console.log('>>> reset the db! >>>')
  })
}

module.exports = ResetDB
