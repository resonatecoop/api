const { authenticate } = require('../../authenticate')
const { Play, Resonate: sequelize } = require('../../../../db/models')
const { Op } = require('sequelize')

// const getDateFormat = (period = 'monthly') => {
//   return {
//     yearly: '%Y',
//     monthly: '%Y-%m',
//     daily: '%Y-%m-%d'
//   }[period]
// }

module.exports = function () {
  const operations = {
    GET: [authenticate, GET]
  }

  async function GET (ctx, next) {
    const currentDate = new Date()
    currentDate.setUTCHours(0, 0, 0, 0)
    const lastYear = new Date()
    lastYear.setUTCHours(23, 59, 59, 999)
    lastYear.setFullYear(currentDate.getFullYear() - 1)
    const {
      from = currentDate.toISOString(),
      to = lastYear.toISOString()
      // type = 'paid'
    } = ctx.request.query
    if (!from || !to) {
      ctx.throw(400, 'Time range required. Set \'from\' and \'to\'')
    }
    // FIXME: add filtering by type
    try {
      const res = await Play.findAll({
        attributes: [
          [sequelize.literal('DATE("created_at")'), 'date'],
          [sequelize.literal('COUNT(*)'), 'count']
        ],
        where: {
          userId: ctx.profile.id,
          createdAt: {
            [Op.gte]: `${from}T00:00:00Z`,
            [Op.lte]: `${to}T23:59:59Z`
          }
        },
        group: [sequelize.literal('DATE("created_at")')],
        order: [['count', 'DESC']]
      })

      ctx.body = {
        data: res
      }
    } catch (err) {
      console.error(err)
      ctx.throw(500, err.message)
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
