const { Credit, User } = require('../../../../db/models')

const stripe = require('stripe')(process.env.STRIPE_KEY)

const values = {
  'Stream-Credit-05': 5,
  'Stream-Credit-10': 10,
  'Stream-Credit-20': 20,
  'Stream-Credit-50': 50
}

module.exports = function () {
  const operations = {
    GET: [GET]
  }

  async function GET (ctx, next) {
    try {
      // FIXME: Better error handling here
      const response = ctx.request.query
      const session = await stripe.checkout.sessions.retrieve(ctx.request.query.session_id)
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id)
      const user = await User.findOne({
        where: { id: response.userId }
      })

      await Promise.all(lineItems.data.map(async lineItem => {
        if (lineItem.description.includes('Stream-Credit')) {
          const [credit] = await Credit.findOrCreate({
            where: { user_id: user.id }
          })
          await credit.update({ total: credit.total + values[lineItem.description] })
          await credit.save()
        }
      }))

      ctx.status = 303
      ctx.redirect(response.callbackURL)
    } catch (err) {
      console.error('err', err)
      ctx.status = err.status
      ctx.throw(ctx.status, err.message)
    }

    await next()
  }

  GET.apiDoc = {
    operationId: 'checkoutSuccess',
    description: 'Checkout success',
    summary: 'Checkout success',
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
