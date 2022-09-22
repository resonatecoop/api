const { Resonate: Sequelize, UserMeta, Track, File } = require('../../../../db/models')
const { Op } = require('sequelize')
const ms = require('ms')
const authenticate = require('../../authenticate')

module.exports = function (trackService) {
  const operations = {
    POST: [authenticate, POST],
    GET: [authenticate, GET]
  }

  async function GET (ctx, next) {
    if (ctx.request.query.order !== 'random' && await ctx.cashed(ms('30s'))) return

    const { limit = 50, page = 1, order } = ctx.request.query

    const query = {
      limit,
      offset: page > 1 ? page * limit : 0,
      where: {
        creator_id: ctx.profile.id
      },
      attributes: [
        'id',
        'creator_id',
        'title',
        'url',
        'cover_art',
        'album',
        'duration',
        'year',
        'status'
      ],
      include: [
        {
          model: File,
          attributes: ['id', 'owner_id'],
          as: 'cover'
        },
        {
          model: File,
          attributes: ['id', 'owner_id'],
          as: 'audiofile'
        },
        {
          model: UserMeta,
          attributes: ['meta_key', 'meta_value'],
          required: false,
          where: { meta_key: { [Op.in]: ['nickname'] } },
          as: 'meta'
        }
      ],
      order: [
        ['id', 'DESC']
      ]
    }

    if (order === 'random') {
      query.order = Sequelize.literal('rand()')
    } else if (order === 'oldest') {
      query.order = [
        ['id', 'ASC']
      ]
    }

    try {
      const { rows, count } = await Track.findAndCountAll(query)

      ctx.body = {
        data: trackService(ctx).list(rows),
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
    operationId: 'getUserTracks',
    description: 'Returns user tracks',
    summary: 'Find user tracks',
    tags: ['tracks'],
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

    try {
      // const data = Object.assign(body, { creator_id: ctx.profile.id })
      const result = await Track.create(body)
      ctx.status = 201
      ctx.body = {
        data: result.get({
          plain: true
        }),
        status: 201
      }
    } catch (err) {
      console.error('er', err)
      ctx.throw(ctx.status, err.message)
    }

    await next()
  }

  // TODO: Swagger dogs for POST

  return operations
}
