const { Track, TrackGroup, TrackGroupItem, Favorite, UserGroup } = require('../../../../db/models')
const trackService = require('../../../tracks/services/trackService')
const { authenticate } = require('../../authenticate')
const { Op } = require('sequelize')

module.exports = function () {
  const operations = {
    GET: [authenticate, GET],
    POST: [authenticate, POST]
  }

  async function POST (ctx, next) {
    const { trackId } = ctx.request.body

    try {
      let result = await Favorite.findOne({
        where: {
          trackId,
          userId: ctx.profile.id
        }
      })

      if (result) {
        result.type = !result.type // fav|unfav
        await result.save()
      } else {
        result = await Favorite.create({
          trackId,
          userId: ctx.profile.id,
          type: 1
        })
      }

      ctx.body = {
        data: result
      }
    } catch (err) {
      ctx.status = err.status || 500
      ctx.throw(ctx.status, err.message)
    }

    await next()
  }

  POST.apiDoc = {
    operationId: 'createOrUpdateFavorite',
    description: 'Create or toggle favorite type',
    tags: ['favorites'],
    parameters: [
      {
        in: 'body',
        name: 'favorite',
        schema: {
          type: 'object',
          additionalProperties: false,
          required: ['trackId'],
          properties: {
            trackId: {
              type: 'string',
              format: 'uuid'
            }
          }
        }
      }
    ],
    responses: {
      200: {
        description: 'The favorite data',
        schema: {
          type: 'object'
        }
      },
      404: {
        description: 'No favorite found.'
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
    const {
      limit = 10,
      page = 1
    } = ctx.request.query

    const offset = page > 1 ? (page - 1) * limit : 0

    try {
      const { count, rows: result } = await Favorite.findAndCountAll({
        where: {
          type: true,
          userId: ctx.profile.id
        },
        offset,
        limit,
        include: [{
          as: 'track',
          model: Track,
          required: true,
          where: {
            status: {
              [Op.in]: [0, 2, 3]
            }
          },
          include: [{
            as: 'trackOn',
            model: TrackGroupItem,
            include: {
              as: 'trackGroup',
              model: TrackGroup,
              where: {
                private: false,
                enabled: true
              }
            }
          }, {
            as: 'creator',
            model: UserGroup
          }]
        }]
      })

      ctx.body = {
        data: trackService(ctx).list(result.map(r => r.track)),
        count,
        pages: Math.ceil(count / limit)
      }
    } catch (err) {
      console.error(err)
      ctx.status = err.status
      ctx.throw(ctx.status, err.message)
    }

    await next()
  }

  GET.apiDoc = {
    operationId: 'getFavorites',
    description: 'Returns user favorites tracks',
    tags: ['favorites'],
    parameters: [
      {
        description: 'The maximum number of results to return',
        in: 'query',
        name: 'limit',
        type: 'integer'
      },
      {
        description: 'The current page',
        in: 'query',
        name: 'page',
        type: 'integer'
      }
    ],
    responses: {
      200: {
        description: 'The requested search results.',
        schema: {
          type: 'object'
        }
      },
      404: {
        description: 'No results were found.'
      }
    }
  }

  return operations
}
