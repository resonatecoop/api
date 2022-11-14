const { Resonate: Sequelize, User, Track, UserGroup } = require('../../../../db/models')
const ms = require('ms')
const { authenticate } = require('../../authenticate')

module.exports = function (trackService) {
  const operations = {
    POST: [authenticate, POST],
    GET: [authenticate, GET]
  }

  async function GET (ctx, next) {
    if (ctx.request.query.order !== 'random' && await ctx.cashed?.(ms('30s'))) return

    const { limit = 50, page = 1, order } = ctx.request.query

    const query = {
      limit,
      offset: page > 1 ? page * limit : 0,
      attributes: [
        'id',
        'creatorId',
        'title',
        'url',
        'cover_art',
        'album',
        'duration',
        'year',
        'status',
        'createdAt'
      ],
      include: [
        {
          model: UserGroup,
          as: 'creator',
          required: true,
          include: [{
            model: User,
            as: 'owner',
            required: true,
            where: {
              id: ctx.profile.id
            }
          }]
        }
      ],
      order: [
        ['createdAt', 'DESC']
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
      const { rows, count } = await Track.scope('details').findAndCountAll(query)
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
      const userGroups = await UserGroup.findAll({
        attributes: ['id'],
        where: {
          ownerId: ctx.profile.id
        }
      })

      const ids = userGroups.map(ug => ug.id)
      if (!ids.includes(body.creatorId)) {
        ctx.status = 401
        ctx.throw(401, 'You can\'t make a track for this user')
      }
      const result = await Track.create(body)
      ctx.status = 201
      ctx.body = {
        data: result.get({
          plain: true
        }),
        status: 201
      }
    } catch (err) {
      console.error('err', err)
      ctx.throw(ctx.status, err.message)
    }

    await next()
  }

  POST.apiDoc = {
    operationId: 'createUserTrack',
    description: 'Create a user track',
    summary: 'Create a user track',
    tags: ['tracks'],
    produces: [
      'application/json'
    ],
    parameters: [
      {
        in: 'body',
        required: true,
        name: 'track',
        description: 'The track to create.',
        schema: {
          $ref: '#/definitions/TrackCreate'
        }
      }
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
    }

  }

  return operations
}
