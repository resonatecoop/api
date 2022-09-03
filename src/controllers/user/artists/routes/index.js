const { Artist, TrackGroup, TrackGroupItem, Track } = require('../../../../db/models')

module.exports = function () {
  const operations = {
    POST,
    GET
  }

  async function POST (ctx, next) {
    const body = ctx.request.body

    try {
      const result = await Artist.create(Object.assign(body, {
        userId: ctx.profile.id
      }))

      ctx.status = 201
      ctx.body = {
        data: result.get({
          plain: true
        }),
        status: 201
      }
    } catch (err) {
      console.error(err)
      ctx.status = err.status || 500
      ctx.throw(ctx.status, err.message)
    }

    await next()
  }

  POST.apiDoc = {
    operationId: 'createArtist',
    description: 'Create new artist',
    tags: ['artists'],
    parameters: [
      {
        in: 'body',
        name: 'artist',
        description: 'The artist to create.',
        schema: {
          $ref: '#/definitions/Artist'
        }
      }
    ],
    responses: {
      201: {
        description: 'Artist created response.',
        schema: {
          type: 'object'
        }
      },
      400: {
        description: 'Bad request'
      },
      default: {
        description: 'Unexpected error',
        schema: {
          $ref: '#/definitions/Error'
        }
      }
    }
  }

  async function GET (ctx, next) {
    try {
      const { limit = 100, page = 1 } = ctx.request.query

      const where = {
        userId: ctx.profile.id
      }

      const { rows: result, count } = await Artist.findAndCountAll({
        limit,
        offset: page > 1 ? (page - 1) * limit : 0,
        where,
        include: [
          {
            model: TrackGroup,
            as: 'trackgroups',
            include: [{
              model: TrackGroupItem,
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

      ctx.body = {
        data: result.map((item) => {
          const o = Object.assign({}, item.dataValues)

          return o
        }),
        count: count,
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
    description: 'Returns artists',
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
        minimum: 1,
        maximum: 100
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
