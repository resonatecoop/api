const Koa = require('koa')
const Router = require('@koa/router')

const logout = new Koa()
const router = new Router()

router.get('/', async (ctx, next) => {
  const redirectUrl = new URL('/web/logout', process.env.OAUTH_HOST)
  const params = {
    login_redirect_uri: '/web/account-settings',
    client_id: process.env.OAUTH_CLIENT,
    scope: 'read_write'
  }

  if (ctx.session.grant) {
    params.state = ctx.session.grant.state
  }

  redirectUrl.search = new URLSearchParams(params)

  ctx.redirect(redirectUrl.href)

  await next()
})

logout
  .use(router.routes())
  .use(router.allowedMethods({
    throw: true
  }))

module.exports = logout
