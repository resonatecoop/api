const { User } = require('../../../../db/models')
// const { Op } = require('sequelize')

const stripe = require('stripe')(process.env.STRIPE_KEY)

module.exports = function () {
  const operations = {
    GET
  }

  async function GET (ctx, next) {
    try {
      const query = ctx.request.query
      const userId = ctx.request.query.userId

      if (!userId) {
        ctx.status = 400
        ctx.throw(400, 'Missing required userId')
      }

      const user = await User.findOne({
        where: {
          id: userId
        },
        raw: true
      })

      if (!user) {
        ctx.status = 404
        ctx.throw(404, 'User not found')
      }

      const { data: products } = await stripe.products.list({ limit: 50 })

      const priceIds = ctx.request.query.priceIds.split(',')
      let isRecurring = false
      const lineItems = priceIds.map(price => {
        const product = products.find(product => product.default_price === price)
        let quantity = 1
        if (product?.name === 'Supporter Shares') {
          quantity = +query.shareQuantity
        }
        if (product?.name === 'Listener Subscription') {
          isRecurring = true
        }
        return {
          price,
          quantity
        }
      })
      const stripeSession = await stripe.checkout.sessions.create({
        line_items: lineItems,
        mode: isRecurring ? 'subscription' : 'payment',
        success_url: `${process.env.APP_HOST}/api/v3/user/products/success?session_id={CHECKOUT_SESSION_ID}&${new URLSearchParams(query).toString()}`,
        cancel_url: `${process.env.APP_HOST}/api/v3/user/products/cancel?session_id={CHECKOUT_SESSION_ID}${new URLSearchParams(query).toString()}`
      })
      ctx.status = 303
      ctx.redirect(stripeSession.url)
    } catch (err) {
      console.error('err', err)
      ctx.status = err.status
      ctx.throw(ctx.status, err.message)
    }

    await next()
  }

  GET.apiDoc = {
    operationId: 'processChosenProducts',
    description: 'Process chosen products',
    summary: 'Process chosen products',
    tags: ['products'],
    produces: [
      'application/json'
    ],
    responses: {
      400: {
        description: 'Bad request',
        schema: {
          $ref: '#/responses/BadRequest'
        }
      },
      404: {
        description: 'Not found',
        schema: {
          $ref: '#/responses/NotFound'
        }
      },
      default: {
        description: 'error payload',
        schema: {
          $ref: '#/definitions/Error'
        }
      }
    }
  }

  return operations
}
