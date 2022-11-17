const { UserGroup, Track, TrackGroup, TrackGroupItem, File } = require('../../../../db/models')
const { Op } = require('sequelize')
const trackgroupService = require('../../../trackgroups/services/trackgroupService')
const ms = require('ms')
const { loadProfileIntoContext } = require('../../../user/authenticate')

module.exports = function () {
  const operations = {
    GET: [loadProfileIntoContext, GET],
    parameters: [
      {
        name: 'id',
        in: 'path',
        type: 'string',
        required: true,
        description: 'Artist id.'
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
          // artistId: ctx.params.id,
          creatorId: ctx.params.id,
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
          'display_artist',
          'id',
          'slug',
          'tags',
          'title',
          'createdAt',
          'releaseDate',
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
          },
          {
            model: TrackGroupItem,
            separate: true,
            attributes: ['id', 'index', 'track_id'],
            order: [['index', 'ASC']],
            as: 'items',
            include: [{
              model: Track.scope('public', { method: ['loggedIn', ctx.profile?.id] }),
              as: 'track'
            }]
          }
        ],
        order: [
          ['releaseDate', 'DESC'],
          ['createdAt', 'DESC'],
          ['title', 'ASC']
        ]
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

      const { rows, count } = await TrackGroup.findAndCountAll(query)

      ctx.body = {
        data: trackgroupService(ctx).list(rows),
        count: count,
        numberOfPages: Math.ceil(count / limit),
        status: 'ok'
      }
    } catch (err) {
      console.error('err', err)
      ctx.throw(ctx.status, err.message)
    }

    await next()
  }

  GET.apiDoc = {
    operationId: 'getArtistReleases',
    description: 'Returns releases (lp, ep, single) for an artist',
    summary: 'Find artist releases',
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
