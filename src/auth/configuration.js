const { renderError, logoutSource, postLogoutSuccessSource } = require('./utils')
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
    revocation: { enabled: true }, // defaults to false,
    rpInitiatedLogout: {
      enabled: true,
      logoutSource,
      postLogoutSuccessSource
    }
  },
  jwks: {
    keys
  },
  ttl: {
    Session: 14 * 24 * 60 * 60, /* 14 days in seconds */
    AccessToken: function AccessTokenTTL (ctx, token, client) {
      if (token.resourceServer) {
        return token.resourceServer.accessTokenTTL || 60 * 60 // 1 hour in seconds
      }
      return 60 * 60
      // return 60 * 60 // 1 hour in seconds
    }
  }
}
