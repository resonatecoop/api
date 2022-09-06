// const { UserMeta, User, Role, OauthUser /* Resonate: sequelize */ } = require('../../../../db/models')
// const { Op } = require('sequelize')

const stripe = require('stripe')(process.env.STRIPE_KEY)

module.exports = function () {
  const operations = {
    GET
  }

  async function GET (ctx, next) {
    try {
      const products = await stripe.products.list({ limit: 50 })
      // const prices = await stripe.prices.list({ limit: 50 })

      ctx.body = {
        data: products.data,
        status: 'ok'
      }
    } catch (err) {
      console.error('err', err)
      ctx.status = err.status
      ctx.throw(ctx.status, err.message)
    }

    await next()
  }

  GET.apiDoc = {
    operationId: 'getProducts',
    description: 'Get products',
    summary: 'Get products',
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
