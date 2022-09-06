const Koa = require('koa')
const mount = require('koa-mount')

/**
 * Oauth grant config
 */

const grant = require('grant-koa')
const grantConfig = require('../../config/grant')
const { User } = require('../../db/models')

/**
 * User routing
 */

const collection = require('./collection')
const favorites = require('./favorites')
const logout = require('./logout')
const plays = require('./plays')
const profile = require('./profile')
const trackgroups = require('./trackgroups')
const tracks = require('./tracks')
const stream = require('./stream')
const artists = require('./artists')
const admin = require('./admin')
const products = require('./products')

/**
 * Swagger client for user-api
 */
const RedisAdapter = require('../../auth/redis-adapter')

const user = new Koa()

user.use(mount('/connect', grant(grantConfig)))

user.use(async (ctx, next) => {
  if (ctx.get('Authorization').startsWith('Bearer ')) {
    // bearer auth
    ctx.accessToken = ctx.get('Authorization').slice(7, ctx.get('Authorization').length).trimLeft()
  } else if (ctx.session.grant && ctx.session.grant.response) {
    // session auth
    ctx.accessToken = ctx.session.grant.response.access_token
  }

  await next()
})

const allowlist = [
  '/collection/apiDocs',
  '/favorites/apiDocs',
  '/plays/apiDocs',
  '/profile/apiDocs',
  '/trackgroups/apiDocs',
  '/tracks/apiDocs',
  '/products',
  '/products/checkout',
  '/products/success',
  '/products/apiDocs'
]

user.use(async (ctx, next) => {
  if (!ctx.accessToken && ctx.request.url.startsWith('/stream')) {
    // 302
    ctx.redirect(`/api${process.env.API_BASE_PATH}${ctx.request.url}`)
  } else {
    await next()
  }
})

const adapter = new RedisAdapter('AccessToken')

// Anything in the user folder requires authorization, but
// we skip the allowlist
user.use(async (ctx, next) => {
  if (allowlist.includes(ctx.path)) return await next()
  if (!ctx.accessToken) {
    ctx.status = 401
    ctx.throw(401, 'Missing required access token')
  }

  try {
    // let response
    // const adapter = new RedisAdapter('AccessToken')
    const session = await adapter.find(ctx.accessToken)
    if (session.accountId) {
      const user = await User.findOne({
        where: {
          id: session.accountId
        },
        raw: true
      })

      if (user) {
        ctx.profile = user
      }
    }
  } catch (err) {
    console.error(err)
    let message = err.message
    if (err.response) {
      // handle token expiration
      ctx.status = 401
      message = err.response.body.error
    }
    ctx.throw(ctx.status, message)
  }
  await next()
})

user.use(collection.routes())
user.use(favorites.routes())
user.use(mount('/logout', logout))
user.use(profile.routes())
user.use(plays.routes())
user.use(trackgroups.routes())
user.use(tracks.routes())
user.use(artists.routes())
user.use(stream.routes())
user.use(mount('/admin', admin))
user.use(products.routes())

module.exports = user
