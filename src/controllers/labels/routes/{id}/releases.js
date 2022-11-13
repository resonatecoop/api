const { UserGroup, UserGroupMember, TrackGroup, TrackGroupItem, Track, File } = require('../../../../db/models')
const { Op } = require('sequelize')
const ms = require('ms')
const trackgroupService = require('../../../trackgroups/services/trackgroupService')

module.exports = function () {
  const operations = {
    GET,
    parameters: [
      {
        name: 'id',
        in: 'path',
        type: 'string',
        required: true,
        description: 'Label id.',
        format: 'uuid'
      }
    ]
  }

  async function GET (ctx, next) {
    if (await ctx.cashed?.(ms('30s'))) return

    try {
      const { type, limit = 90, page = 1, order } = ctx.request.query

      const query = {
        where: {
          private: false,
          enabled: true,
          releaseDate: {
            [Op.or]: {
              [Op.lte]: new Date(),
              [Op.eq]: null
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
          'type',
          'createdAt'
        ],
        include: [
          {
            model: File,
            required: false,
            attributes: ['id', 'owner_id'],
            as: 'cover_metadata',
            where: {
              mime: {
                [Op.in]: ['image/jpeg', 'image/png']
              }
            }
          },
          {
            model: UserGroup,
            attributes: ['id', 'displayName'],
            required: true,
            as: 'creator',
            include: [{
              model: UserGroupMember,
              required: true,
              as: 'memberOf',
              where: {
                belongsToId: ctx.params.id
              }
            }]
          },
          {
            model: TrackGroupItem,
            order: [['index', 'ASC']],
            as: 'items',
            attributes: ['index'],
            include: [{
              model: Track,
              as: 'track',
              // FIXME: this should be a defaultScope
              where: {
                status: {
                  [Op.in]: [0, 2, 3]
                }
              },
              attributes: ['id', 'creatorId', 'cover_art', 'title', 'duration', 'status'],
              include: [
                {
                  model: File,
                  attributes: ['id', 'size', 'owner_id'],
                  as: 'audiofile'
                }
              ]
            }]
          }
        ],
        order: [
          ['createdAt', 'DESC']
        ],
        subQuery: false
      }

      if (order === 'oldest') {
        query.order = [
          ['createdAt', 'ASC']
        ]
      }

      if (page > 1) {
        query.offset = (page - 1) * limit
      }

      if (type) {
        query.where.type = type
      }

      const { count, rows } = await TrackGroup.findAndCountAll(query)

      ctx.body = {
        data: trackgroupService(ctx).list(rows),
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
    operationId: 'getLabelReleases',
    description: 'Returns all label artists releases',
    summary: 'Find label artists releases',
    tags: ['labels'],
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
        enum: ['oldest', 'newest']
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
