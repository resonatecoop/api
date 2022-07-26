const { Provider } = require('oidc-provider')
const configuration = require('./configuration')
const routes = require('./routes')
const { User } = require('../db/models')
const adapter = require('./redis-adapter')

configuration.findAccount = async (ctx, id, token) => {
  const isExisting = await User.findOne({
    where: {
      id
    }
  })

  if (isExisting) {
    return {
      accountId: id,
      profile: isExisting,
      claims: async () => {
        return {
          sub: id // it is essential to always return a sub claim

          // address: {
          //   country: '000',
          //   formatted: '000',
          //   locality: '000',
          //   postal_code: '000',
          //   region: '000',
          //   street_address: '000'
          // },
          // birthdate: '1987-10-16',
          // email: 'johndoe@example.com',
          // email_verified: false,
          // family_name: 'Doe',
          // gender: 'male',
          // given_name: 'John',
          // locale: 'en-US',
          // middle_name: 'Middle',
          // name: 'John Doe',
          // nickname: 'Johny',
          // phone_number: '+49 000 000000',
          // phone_number_verified: false,
          // picture: 'http://lorempixel.com/400/200/',
          // preferred_username: 'johnny',
          // profile: 'https://johnswebsite.com',
          // updated_at: 1454704946,
          // website: 'http://example.com',
          // zoneinfo: 'Europe/Berlin'
        }
      }
    }
  }
  return null
}

const { APP_PORT = 3000, APP_HOST = `http://localhost:${APP_PORT}` } = process.env

const provider = new Provider(APP_HOST, { adapter, ...configuration })

module.exports = { provider, routes }
