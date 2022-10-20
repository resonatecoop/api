const { Track, Play } = require('../../../../../db/models')
const { authenticate } = require('../../../authenticate')
const { Op } = require('sequelize')

module.exports = function (trackService) {
  const operations = {
    GET: [authenticate, GET]
  }

  async function GET (ctx, next) {
    const {
      limit = 10,
      page = 1
    } = ctx.request.query

    const offset = page > 1 ? (page - 1) * limit : 0
    try {
      const { count, rows: result } = await Play.findAndCountAll({
        limit,
        offset,
        where: {
          userId: ctx.profile.id
        },
        include: [{
          model: Track,
          as: 'track',
          required: true,
          where: {
            status: {
              [Op.in]: [0, 2, 3]
            }
          }
        }],
        order: [['createdAt', 'DESC']]
      })

      ctx.body = {
        data: trackService(ctx).list(result.map(r => r.track)),
        count,
        pages: Math.ceil(count / limit)
      }
    } catch (err) {
      console.error(err)
      ctx.status = err.status
      ctx.throw(ctx.status, err.message)
    }

    await next()
  }

  GET.apiDoc = {
    operationId: 'getPlayHistory',
    description: 'Returns user play history',
    tags: ['plays'],
    parameters: [
      {
        description: 'The maximum number of results to return',
        in: 'query',
        name: 'limit',
        type: 'integer'
      },
      {
        description: 'The current page',
        in: 'query',
        name: 'page',
        type: 'integer'
      }
    ],
    responses: {
      200: {
        description: 'The requested search results.',
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
