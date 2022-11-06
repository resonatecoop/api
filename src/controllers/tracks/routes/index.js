const { Resonate: Sequelize, UserGroup, Track, File, Play, TrackGroup, TrackGroupItem } = require('../../../db/models')
const { Op } = require('sequelize')
const ms = require('ms')

module.exports = function (trackService) {
  const operations = {
    GET
  }

  async function GET (ctx, next) {
    if (ctx.request.query.order !== 'random' && await ctx.cashed?.(ms('30s'))) return

    const { limit = 50, page = 1, order } = ctx.request.query

    const query = {
      limit,
      offset: page > 1 ? page * limit : 0,
      where: {
        status: {
          [Op.in]: [0, 2, 3]
        }
      },
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
          model: File,
          attributes: ['id'],
          as: 'cover'
        },
        {
          model: TrackGroupItem,
          attributes: ['index'],
          as: 'trackOn',
          include: [{
            model: TrackGroup,
            as: 'trackGroup',
            attributes: ['title']
          }]
        },
        {
          model: File,
          attributes: ['id'],
          as: 'audiofile'
        },
        {
          model: UserGroup,
          attributes: ['displayName', 'id'],
          as: 'creator'
        }
      ],
      subQuery: false,
      order: [
        ['created_at', 'DESC']
      ]
    }

    if (order === 'random') {
      query.order = Sequelize.literal('random()')
    } else if (order === 'oldest') {
      query.order = [
        ['createdAt', 'ASC']
      ]
    } else if (order === 'latest') {
      query.order = [['createdAt', 'DESC']]
    } else if (order === 'plays') {
      query.include.push({
        model: Play,
        required: true,
        where: {
          createdAt: {
            [Op.not]: null
          }
        },
        attributes: ['createdAt'],
        as: 'plays'
      })
      query.order = [[{ model: Play, as: 'plays' }, 'createdAt', 'DESC']]
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
      console.error('err', err)
      ctx.throw(500, err.message)
    }

    await next()
  }

  GET.apiDoc = {
    operationId: 'getTracks',
    description: 'Returns tracks',
    summary: 'Find tracks',
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
        enum: ['random', 'latest', 'plays', 'newest']
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
