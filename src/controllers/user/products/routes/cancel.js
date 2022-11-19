// const { User, Role, OauthUser /* Resonate: sequelize */ } = require('../../../../db/models')
// const { Op } = require('sequelize')

// const stripe = require('stripe')(process.env.STRIPE_KEY)

module.exports = function () {
  const operations = {
    GET: [GET]
  }

  async function GET (ctx, next) {
    try {
      ctx.body = {
        data: {}
      }
    } catch (err) {
      console.error('err', err)
      ctx.status = err.status
      ctx.throw(ctx.status, err.message)
    }

    await next()
  }

  return operations
}
