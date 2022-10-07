const Koa = require('koa')
const mount = require('koa-mount')

/**
 * Oauth grant config
 */

const grant = require('grant-koa')
const grantConfig = require('../../config/grant')

/**
 * User routing
 */

// FIXME: Adapt these endpoints to all use the same authentication
// methods as the other endpoints.

const logout = require('./logout')
const admin = require('./admin')

const { authenticate } = require('./authenticate')

const user = new Koa()

user.use(mount('/connect', grant(grantConfig)))

user.use(authenticate)

user.use(async (ctx, next) => {
  if (!ctx.accessToken && ctx.request.url.startsWith('/stream')) {
    // 302
    ctx.redirect(`/api${process.env.API_BASE_PATH}${ctx.request.url}`)
  } else {
    await next()
  }
})

// Anything in the user folder requires authorization, but
// we skip the allowlist

user.use(mount('/logout', logout))
user.use(mount('/admin', admin))

module.exports = user
