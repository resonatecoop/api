const { User } = require('../../db/models')
const RedisAdapter = require('../../auth/redis-adapter')

const allowlist = [
  '/collection/apiDocs',
  '/favorites/apiDocs',
  '/plays/apiDocs',
  '/trackgroups/apiDocs',
  '/tracks/apiDocs',
  '/products',
  '/products/checkout',
  '/products/success',
  '/products/apiDocs'
]

const adapter = new RedisAdapter('AccessToken')

const checkForAuthentication = async (ctx, next) => {
  console.log('checking authentication')
  if (ctx.get('Authorization').startsWith('Bearer ')) {
    // bearer auth
    ctx.accessToken = ctx.get('Authorization').slice(7, ctx.get('Authorization').length).trimLeft()
  } else if (ctx.session.grant && ctx.session.grant.response) {
    // session auth
    ctx.accessToken = ctx.session.grant.response.access_token
  }

  if (!ctx.accessToken && ctx.request.url.startsWith('/stream')) {
    // 302
    ctx.redirect(`/api${process.env.API_BASE_PATH}${ctx.request.url}`)
  } else {
    if (allowlist.includes(ctx.path)) return

    if (!ctx.accessToken) {
      ctx.status = 401
      console.log('throw')
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
  }
}

module.exports = checkForAuthentication
