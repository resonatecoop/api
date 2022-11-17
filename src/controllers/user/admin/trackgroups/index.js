
const { TrackGroup, File } = require('../../../../db/models')
const { authenticate, hasAccess } = require('../../authenticate')
const { Op } = require('sequelize')
const trackgroupService = require('../../../trackgroups/services/trackgroupService')

module.exports = function () {
  const operations = {
    GET: [authenticate, hasAccess('admin'), GET],
    POST: [authenticate, hasAccess('admin'), POST]

  }

  async function GET (ctx, next) {
    try {
      const { type, limit = 20, page = 1, featured, private: _private, download, enabled } = ctx.request.query

      const where = {}

      if (download) {
        where.download = true
      }

      if (_private) {
        where.private = true
      }

      if (enabled) {
        where.enabled = true
      }

      if (featured) {
        where.featured = true
      }

      if (type) {
        where.type = type
      }
      const { rows: result, count } = await TrackGroup.findAndCountAll({
        limit,
        offset: page > 1 ? (page - 1) * limit : 0,
        attributes: [
          'id',
          'cover',
          'title',
          'type',
          'about',
          'private',
          'createdAt',
          'display_artist',
          'creatorId',
          'composers',
          'performers',
          'releaseDate',
          'enabled',
          'featured'
        ],
        include: [
          {
            model: File,
            required: false,
            attributes: ['id', 'ownerId', 'mime'],
            as: 'cover_metadata',
            where: {
              mime: {
                [Op.in]: ['image/jpeg', 'image/png']
              }
            }
          }
        ],
        where,
        order: [
          ['createdAt', 'DESC'],
          ['releaseDate', 'DESC']
        ]
      })
      const tgs = trackgroupService(ctx).list(result)
      ctx.body = {
        data: tgs,
        count: count,
        numberOfPages: Math.ceil(count / limit),
        status: 'ok'
      }
    } catch (err) {
      console.error(err)
      ctx.throw(500, err.message)
    }

    await next()
  }

  GET.apiDoc = {
    operationId: 'getTrackgroupsThroughAdmin',
    description: 'Returns all trackgroups',
    summary: 'Find trackgroups',
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

  async function POST (ctx, next) {
    const body = ctx.request.body
    const creatorId = body.creator_id || ctx.profile.id

    try {
      const result = await TrackGroup.create(Object.assign(body, { creator_id: creatorId }))

      ctx.status = 201
      ctx.body = {
        data: result.get({
          plain: true
        }),
        status: 201
      }
    } catch (err) {
      ctx.throw(ctx.status, err.message)
    }

    await next()
  }

  POST.apiDoc = {
    operationId: 'createTrackgroup',
    description: 'Create new trackgroup',
    tags: ['admin'],
    parameters: [
      {
        in: 'body',
        name: 'trackgroup',
        description: 'The trackgroup to create.',
        schema: {
          $ref: '#/definitions/Trackgroup'
        }
      }
    ],
    responses: {
      201: {
        description: 'Trackgroup created response.',
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

  return operations
}
