const models = require('../../../db/models')
const artistService = require('../artistService')
const { UserGroup, TrackGroup, TrackGroupItem, Track } = models

module.exports = function () {
  const operations = {
    GET
  }

  async function GET (ctx, next) {
    if (await ctx.cashed?.()) return

    try {
      const {
        limit = 20,
        page = 1
      } = ctx.request.query

      const { rows: result, count } = await UserGroup.findAndCountAll({
        limit,
        order: [
          ['displayName', 'asc']
        ],
        offset: page > 1 ? (page - 1) * limit : 0,
        subQuery: false,
        include: [
          {
            model: TrackGroup,
            as: 'trackgroups',
            required: true,
            separate: true,
            include: [{
              model: TrackGroupItem,
              required: true,
              attributes: ['id', 'index', 'track_id'],
              as: 'items',
              separate: true,
              order: [['index', 'ASC']],
              include: [{
                model: Track,
                as: 'track'
              }]
            }]
          }
        ]
      })

      ctx.lastModified = new Date()

      ctx.body = {
        data: await artistService(ctx).list(result),
        count,
        pages: Math.ceil(count / limit),
        status: 'ok'
      }
    } catch (err) {
      console.error(err)
      ctx.throw(ctx.status, err.message)
    }

    await next()
  }

  GET.apiDoc = {
    operationId: 'getArtists',
    description: 'Returns artist profiles',
    summary: 'Find artists',
    tags: ['artists'],
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
    },
    parameters: [
      {
        description: 'The maximum number of results to return',
        in: 'query',
        name: 'limit',
        type: 'integer',
        maximum: 100
      },
      {
        description: 'Order by column',
        in: 'query',
        name: 'orderBy',
        type: 'string',
        enum: ['id', 'name']
      },
      {
        description: 'Order',
        in: 'query',
        name: 'order',
        type: 'string',
        enum: ['asc', 'desc']
      },
      {
        type: 'integer',
        description: 'The current page',
        in: 'query',
        name: 'page',
        minimum: 1
      }
    ]
  }

  return operations
}
