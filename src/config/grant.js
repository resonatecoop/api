module.exports = {
  defaults: {
    transport: 'session',
    state: true,
    origin: process.env.GRANT_ORIGIN,
    prefix: process.env.GRANT_PREFIX
  },
  resonate: {
    access_url: `${process.env.OAUTH_HOST}/v1/oauth/tokens`,
    authorize_url: `${process.env.OAUTH_HOST}/authorize`,
    oauth: 2,
    key: process.env.OAUTH_CLIENT,
    secret: process.env.OAUTH_SECRET,
    token_endpoint_auth_method: 'client_secret_basic',
    scope: ['read_write'],
    callback: '/'
  }
}
