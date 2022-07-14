const Koa = require('koa')
const Router = require('@koa/router')

const logout = new Koa()
const router = new Router()

router.get('/', async (ctx, next) => {
  const redirectUrl = new URL('/web/logout', process.env.OAUTH_HOST)
  const params = {
    login_redirect_uri: '/web/account-settings'
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
