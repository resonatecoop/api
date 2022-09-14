const { renderError } = require('./utils')
const keys = require('./../../jwk-keys.json')
const cookies = require('./../../cookies-keys.json')

module.exports = {
  clients: [],
  scopes: ['read_write'],
  interactions: {
    url (ctx, interaction) { // eslint-disable-line no-unused-vars
      return `/interaction/${interaction.uid}`
    }
  },
  renderError,
  cookies: {
    keys: cookies
  },
  features: {
    devInteractions: { enabled: false }, // defaults to true
    deviceFlow: { enabled: true }, // defaults to false
    revocation: { enabled: true } // defaults to false
  },
  jwks: {
    keys
  }
}
