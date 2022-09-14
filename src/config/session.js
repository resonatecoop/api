module.exports = {
  key: process.env.APP_COOKIE_KEY || 'stream.koa.sess',
  domain: process.env.APP_COOKIE_DOMAIN || 'stream.resonate.coop',
  maxAge: 86400000,
  autoCommit: true,
  overwrite: true,
  httpOnly: true,
  signed: true,
  rolling: false,
  renew: false,
  secure: true,
  sameSite: 'None'
}
