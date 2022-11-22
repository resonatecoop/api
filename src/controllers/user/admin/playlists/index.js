
const { Playlist, File } = require('../../../../db/models')
const { authenticate, hasAccess } = require('../../authenticate')
const { Op } = require('sequelize')
const playlistService = require('../../../playlists/services/playlistService')

module.exports = function () {
  const operations = {
    GET: [authenticate, hasAccess('admin'), GET],
    POST: [authenticate, hasAccess('admin'), POST]

  }

  async function GET (ctx, next) {
    try {
      const { type, limit = 20, page = 1, featured, private: _private } = ctx.request.query

      const where = {}

      if (_private) {
        where.private = true
      }

      if (featured) {
        where.featured = true
      }

      if (type) {
        where.type = type
      }
      const { rows: result, count } = await Playlist.scope('creator').findAndCountAll({
        limit,
        offset: page > 1 ? (page - 1) * limit : 0,
        attributes: [
          'id',
          'cover',
          'title',
          'about',
          'private',
          'createdAt',
          'creatorId',
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
          ['createdAt', 'DESC']
        ]
      })
      const tgs = playlistService(ctx).list(result)
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
    operationId: 'getPlaylistsThroughAdmin',
    description: 'Returns all playlists',
    summary: 'Find playlists',
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
    const creatorId = body.creatorId || ctx.profile.id

    try {
      const result = await Playlist.create(Object.assign(body, { creatorId: creatorId }))

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
    operationId: 'createPlaylist',
    description: 'Create new playlist',
    tags: ['admin'],
    parameters: [
      {
        in: 'body',
        name: 'playlist',
        description: 'The playlist to create.',
        schema: {
          $ref: '#/definitions/Playlist'
        }
      }
    ],
    responses: {
      201: {
        description: 'Playlist created response.',
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
