const { Play, Resonate: sequelize } = require('../../../db/models')
const { Op } = require('sequelize')

module.exports = function () {
  const operations = {
    GET: [
      GET
    ]
  }

  async function GET (ctx, next) {
    const { from = '2020-01-01', to = '2020-12-01' } = ctx.request.query

    try {
      const result = await Play.findAll({
        attributes: [
          [sequelize.fn('FROM_UNIXTIME', sequelize.col('date'), '%Y-%m-%d'), 'd'],
          [sequelize.fn('IF', [sequelize.fn('count', sequelize.col('pid')), 'count'] > 8, 9, sequelize.fn('count', sequelize.col('pid'))), 'count']
        ],
        where: {
          event: 1,
          uid: ctx.profile.id,
          date: {
            [Op.and]: {
              [Op.gt]: sequelize.fn('UNIX_TIMESTAMP', from),
              [Op.lt]: sequelize.fn('UNIX_TIMESTAMP', to)
            }
          }
        },
        group: [
          sequelize.fn('FROM_UNIXTIME', sequelize.col('date'), '%Y-%m-%d')
        ],
        order: [
          [[sequelize.literal('d'), 'desc']]
        ],
        raw: true
      })

      ctx.body = {
        data: result.map(item => ({ date: item.d, plays: item.count }))
      }
    } catch (err) {
      ctx.status = err.status
      ctx.throw(ctx.status, err.message)
    }
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
