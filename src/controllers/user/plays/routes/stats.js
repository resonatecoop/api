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
    const {
      from = new Date().setFullYear(currentDate.getFullYear() - 1).toISOString().split('T')[0],
      to = currentDate.toISOString().split('T')[0]
      // type = 'paid'
    } = ctx.request.query
    // FIXME: add filtering by type and date
    // const format = getDateFormat(ctx.request.period)

    try {
      const res = await Play.findAll({
        attributes: [
          [sequelize.literal('DATE("created_at")'), 'date'],
          [sequelize.literal('COUNT(*)'), 'count']
        ],
        where: {
          userId: ctx.profile.id,
          createdAt: {
            [Op.between]: [from, to]
          }
        },
        group: ['created_at'],
        order: [['count', 'DESC']]
      })

      ctx.body = {
        data: res
      }
    } catch (err) {
      console.error(err)
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
