
const { Track } = require('../../../../db/models')
const { authenticate, hasAccess } = require('../../authenticate')
const trackService = require('../../../tracks/services/trackService')

module.exports = function () {
  const operations = {
    GET: [authenticate, hasAccess('admin'), GET]
  }

  async function GET (ctx, next) {
    const { limit = 20, page = 1 } = ctx.request.query

    try {
      const { rows: result, count } = await Track.scope('details').findAndCountAll({
        attributes: [
          'album',
          'album_artist',
          'artist',
          'cover_art',
          'createdAt',
          'creator_id',
          'duration',
          'id',
          'status',
          'title',
          'year'
        ],
        limit,
        offset: page > 1 ? (page - 1) * limit : 0,
        order: [
          ['createdAt', 'DESC']
        ]
      })

      ctx.body = {
        data: trackService(ctx).list(result),
        count: count,
        numberOfPages: Math.ceil(count / limit),
        status: 'ok'
      }
    } catch (err) {
      ctx.throw(ctx.status, err.message)
    }

    await next()
  }

  GET.apiDoc = {
    operationId: 'getTracksThroughAdmin',
    description: 'Returns all tracks',
    summary: 'Find tracks',
    tags: ['admin'],
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
        description: 'Order',
        in: 'query',
        name: 'order',
        type: 'string',
        enum: ['random', 'oldest', 'newest']
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
