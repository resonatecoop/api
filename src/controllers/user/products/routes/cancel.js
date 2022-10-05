// const { UserMeta, User, Role, OauthUser /* Resonate: sequelize */ } = require('../../../../db/models')
// const { Op } = require('sequelize')

// const stripe = require('stripe')(process.env.STRIPE_KEY)
const { authenticate } = require('../../authenticate')

module.exports = function () {
  const operations = {
    GET: [authenticate, GET]
  }

  async function GET (ctx, next) {
    try {
      // FIXME: Better error handling here, cancellatoin doesn't do anything right now
      // const response = ctx.request.query
      // const session = await stripe.checkout.sessions.retrieve(ctx.request.query.session_id)
      // const lineItems = await stripe.checkout.sessions.listLineItems(session.id)

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

  GET.apiDoc = {
    operationId: 'checkoutCancel',
    description: 'Checkout cancelled',
    summary: 'Checkout cancelled',
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
