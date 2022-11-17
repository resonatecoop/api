const { UserGroup, Resonate: Sequelize, TrackGroup, File } = require('../../../db/models')
const { Op } = require('sequelize')
const ms = require('ms')
const trackgroupService = require('../services/trackgroupService')

module.exports = function () {
  const operations = {
    GET
  }

  async function GET (ctx, next) {
    if (ctx.request.query.order !== 'random' && await ctx.cashed?.(ms('30s'))) return

    try {
      const { type, limit = 90, page = 1, featured, order } = ctx.request.query

      const query = {
        where: {
          private: false,
          enabled: true,
          releaseDate: {
            [Op.or]: {
              [Op.lte]: new Date(),
              [Op.eq]: null
            }
          },
          type: {
            [Op.or]: {
              [Op.eq]: null,
              [Op.notIn]: ['playlist', 'compilation'] // hide playlists and compilations
            }
          }
        },
        limit: limit,
        attributes: [
          'about',
          'cover',
          'creatorId',
          'id',
          'slug',
          'tags',
          'title',
          'type'
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
            model: UserGroup,
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

      if (type) {
        query.where.type = type
      }

      if (featured) {
        query.where.featured = true
      }

      const { rows, count } = await TrackGroup.findAndCountAll(query)

      ctx.body = {
        data: trackgroupService(ctx).list(rows),
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
    operationId: 'getTrackgroups',
    description: 'Returns trackgroups (lp, ep, single)',
    summary: 'Find trackgroups',
    tags: ['trackgroups'],
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
