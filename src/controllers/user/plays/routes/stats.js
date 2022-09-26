const { findAllPlayCounts } = require('../../../../scripts/reports/plays')
const authenticate = require('../../authenticate')

const getDateFormat = (period = 'monthly') => {
  return {
    yearly: '%Y',
    monthly: '%Y-%m',
    daily: '%Y-%m-%d'
  }[period]
}

module.exports = function () {
  const operations = {
    GET: [authenticate, GET]
  }

  async function GET (ctx, next) {
    const { from = '2020-01-01', to = '2020-12-01', type = 'paid' } = ctx.request.query
    const format = getDateFormat(ctx.request.period)
    const isLabel = ctx.profile.role === 'label-owner'

    try {
      const res = await findAllPlayCounts(ctx.profile.id, from, to, format, type, isLabel)

      ctx.body = {
        data: res
      }
    } catch (err) {
      ctx.throw(ctx.status, err.message)
    }

    await next()
  }

  GET.apiDoc = {
    operationId: 'getUserStats',
    description: 'Returns user stats',
    tags: ['plays'],
    parameters: [
      {
        in: 'query',
        name: 'from',
        type: 'string',
        format: 'date'
      },
      {
        in: 'query',
        name: 'to',
        type: 'string',
        format: 'date'
      },
      {
        in: 'query',
        name: 'period',
        type: 'string'
      }
    ],
    responses: {
      200: {
        description: 'The requested user stats.',
        schema: {
          type: 'object'
        }
      },
      404: {
        description: 'No results were found.'
      }
    }
  }

  return operations
}
