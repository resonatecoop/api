const Koa = require('koa')
const mount = require('koa-mount')
const request = require('superagent')
const { validate: isValidUUID } = require('uuid')

/**
 * Oauth grant config
 */

const grant = require('grant-koa')
const grantConfig = require('../config/grant')

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

/**
 * Swagger client for user-api
 */
const SwaggerClient = require('swagger-client')

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
  '/tracks/apiDocs'
]

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
user.use(async (ctx, next) => {
  if (allowlist.includes(ctx.path)) return await next()

  if (!ctx.accessToken) {
    ctx.status = 401
    ctx.throw(401, 'Missing required access token')
  }

  if (!isValidUUID(ctx.accessToken)) {
    ctx.status = 401
    ctx.throw(401, 'Invalid access token')
  }

  try {
    let response

    const requestUrl = new URL('/v1/oauth/introspect', process.env.OAUTH_HOST)

    response = await request
      .post(requestUrl.href)
      .auth(process.env.OAUTH_CLIENT, process.env.OAUTH_SECRET)
      .type('form')
      .send({
        token: ctx.accessToken,
        token_type_hint: 'access_token'
      })

    const { user_id: userId, scope } = response.body

    const specUrl = new URL('/user/user.swaggeron', process.env.USER_API_HOST) // user-api swagger docs
    const client = await new SwaggerClient({
      url: specUrl.href,
      authorizations: {
        bearer: 'Bearer ' + ctx.accessToken
      }
    })

    response = await client.apis.Users.ResonateUser_GetUser({
      id: userId
    })

    const {
      legacyId,
      username: email,
      fullName,
      firstName,
      lastName,
      country,
      member = false
    } = response.body

    const [role] = scope.split(' ').slice(-1) // expect last part of scope to be role

    ctx.profile = {
      userId, // user api user id (uuid)
      role: role,
      legacyId: legacyId,
      id: legacyId, // id defaults to legacyId for compat, use ctx.profile.userId for user api id
      uid: legacyId, // extra fallback
      email,
      fullName,
      firstName,
      lastName,
      country,
      member
    }
  } catch (err) {
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
user.use(mount('/stream', stream))

module.exports = user
