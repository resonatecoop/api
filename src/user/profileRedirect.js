const Koa = require('koa')
const Router = require('@koa/router')

const profileRedirect = new Koa()
const router = new Router()

router.get('/', async (ctx, next) => {
  const redirectUrl = new URL('/profile', process.env.OAUTH_HOST)

  redirectUrl.search = new URLSearchParams({
    client_id: process.env.OAUTH_CLIENT,
    response_type: 'code',
    redirect_uri: `https://${process.env.APP_HOST}/api/user/connect/resonate/callback`,
    scope: 'stream2own',
    state: ctx.session.grant.state
  })

  ctx.redirect(redirectUrl.href)

  await next()
})

profileRedirect
  .use(router.routes())
  .use(router.allowedMethods({
    throw: true
  }))

module.exports = profileRedirect
