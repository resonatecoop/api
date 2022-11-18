
module.exports = function () {
  const operations = {
    GET: [GET]
  }

  async function GET (ctx, next) {
    try {
      const response = ctx.request.query

      ctx.status = 303
      ctx.redirect(response.callbackURL)
    } catch (err) {
      console.error('err', err)
      ctx.status = err.status
      ctx.throw(ctx.status, err.message)
    }

    await next()
  }

  return operations
}
