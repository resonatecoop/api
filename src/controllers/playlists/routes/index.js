const { User, Resonate: Sequelize, Playlist, File } = require('../../../db/models')
const { Op } = require('sequelize')
const ms = require('ms')
const playlistService = require('../services/playlistService')

module.exports = function () {
  const operations = {
    GET
  }

  async function GET (ctx, next) {
    if (ctx.request.query.order !== 'random' && await ctx.cashed?.(ms('30s'))) return

    try {
      const { limit = 90, page = 1, featured, order } = ctx.request.query

      const query = {
        where: {
          private: false
        },
        limit: limit,
        attributes: [
          'about',
          'cover',
          'creatorId',
          'id',
          'tags',
          'title'
        ],
        include: [
          {
            model: File,
            required: false,
            attributes: ['id', 'ownerId'],
            as: 'cover_metadata',
            where: {
              mime: {
                [Op.in]: ['image/jpeg', 'image/png']
              }
            }
          },
          {
            model: User,
            required: false,
            attributes: ['id', 'displayName'],
            as: 'creator'

          }
        ],
        order: [
          ['createdAt', 'DESC'],
          ['creatorId', 'ASC'],
          ['title', 'ASC']
        ]
      }

      if (order === 'random') {
        query.order = Sequelize.literal('rand()')
      } else if (order === 'oldest') {
        query.order = [
          ['createdAt', 'ASC'],
          ['creatorId', 'ASC'],
          ['title', 'ASC']
        ]
      }

      if (page > 1) {
        query.offset = (page - 1) * limit
      }

      if (featured) {
        query.where.featured = true
      }

      const { rows, count } = await Playlist.findAndCountAll(query)

      ctx.body = {
        data: playlistService(ctx).list(rows),
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
    operationId: 'getPlaylists',
    description: 'Returns playlists',
    summary: 'Find playlists',
    tags: ['playlists'],
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
      },
      {
        type: 'boolean',
        description: 'Filter featured releases',
        in: 'query',
        name: 'featured'
      },
      {
        type: 'string',
        description: 'The trackgroup type',
        in: 'query',
        enum: ['ep', 'lp', 'single', 'playlist'],
        name: 'type'
      }
    ]
  }

  return operations
}
