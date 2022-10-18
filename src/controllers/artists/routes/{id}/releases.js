const { UserGroup, Track, TrackGroup, TrackGroupItem, File } = require('../../../../db/models')
const { Op } = require('sequelize')
// const slug = require('slug')
// const coverSrc = require('../../../../util/cover-src')
// const map = require('awaity/map')
const ms = require('ms')

module.exports = function () {
  const operations = {
    GET,
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
          release_date: {
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
          'release_date',
          'type'
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
            required: false,
            attributes: ['id', 'displayName'],
            as: 'creator'
          },
          {
            model: TrackGroupItem,
            attributes: ['id', 'index', 'track_id'],
            as: 'items',
            include: [{
              model: Track,
              as: 'track'
            }]
          }
        ],
        order: [
          ['release_date', 'DESC'],
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

      const { rows: result, count } = await TrackGroup.findAndCountAll(query)

      if (!result.length) {
        ctx.status = 404
        ctx.throw(ctx.status, 'No results')
      }

      ctx.body = {
        data: result,
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
