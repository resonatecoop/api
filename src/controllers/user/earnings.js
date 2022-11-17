const { findOneArtistEarnings } = require('../../scripts/reports/earnings')
const { authenticate } = require('./authenticate')

module.exports = function () {
  const operations = {
    POST: [authenticate, POST]
  }

  async function POST (ctx, next) {
    const body = ctx.request.body

    try {
      const { from: periodStart, to: periodEnd } = body.date

      const { report, sums } = await findOneArtistEarnings(periodStart, periodEnd, ctx.profile.id)

      ctx.body = {
        status: 'ok',
        data: report,
        stats: sums
      }
    } catch (err) {
      console.error(err)
      ctx.throw(ctx.status, err.message)
    }

    await next()
  }

  POST.apiDoc = {
    operationId: 'generateEarningsReport',
    description: 'Generate an earnings report for user',
    tags: ['user'],
    parameters: [
      {
        in: 'body',
        name: 'date',
        schema: {
          type: 'object',
          properties: {
            from: {
              type: 'string',
              format: 'date'
            },
            to: {
              type: 'string',
              format: 'date'
            }
          }
        }
      }, {
        in: 'body',
        name: 'creatorId',
        schema: {
          type: 'string',
          format: 'uuid'
        }
      }
    ],
    responses: {
      200: {
        description: 'The requested earning report for the user',
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
