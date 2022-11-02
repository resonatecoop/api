const models = require('../../../db/models')
const { UserGroup, TrackGroup, TrackGroupItem, Track } = models
// const resolveProfileImage = require('../../../util/profile-image')
// const map = require('awaity/map')
// const he = require('he')

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
          [{ model: TrackGroupItem, as: 'items' }, 'index', 'ASC'],
          ['displayName', 'asc']
        ],
        offset: page > 1 ? (page - 1) * limit : 0,
        include: [
          {
            model: TrackGroup,
            as: 'trackgroups',
            required: true,
            include: [{
              model: TrackGroupItem,
              required: true,
              attributes: ['id', 'index', 'track_id'],
              as: 'items',
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
        data: result.map((item) => {
          const o = Object.assign({}, item.dataValues)

          return o
        }),
        count,
        pages: Math.ceil(count / limit),
        status: 'ok'
      }
    } catch (err) {
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
