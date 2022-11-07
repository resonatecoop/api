
const { authenticate, hasAccess } = require('../authenticate')
const { findOneArtistEarnings } = require('../../../scripts/reports/earnings')

module.exports = () => {
  const operations = {
    POST: [authenticate, hasAccess('admin'), POST]
  }

  async function POST (ctx, next) {
    const body = ctx.request.body

    try {
      const { from: periodStart, to: periodEnd } = body.date
      const { creatorId } = body

      const { report, sums } = await findOneArtistEarnings(periodStart, periodEnd, creatorId)

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

  // FIXME: is this actually doing validation?
  POST.apiDoc = {
    operationId: 'generateEarningsReport',
    description: 'Generate an earnings report for an artist',
    tags: ['admin'],
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
        description: 'The requested earning report for an user',
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
