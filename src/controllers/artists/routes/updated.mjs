import models from '../../../db/models/index.js'
import artistService from '../artistService.js'

const { UserGroup, TrackGroup } = models

export default function () {
  const operations = {
    GET
  }

  async function GET (ctx, next) {
    if (await ctx.cashed?.()) return

    const { limit = 50, page = 1 } = ctx.request.query

    const offset = page > 1 ? (page - 1) * limit : 0

    try {
      const { rows: result, count } = await UserGroup.scope('public').findAndCountAll({
        include: [{
          model: TrackGroup,
          as: 'trackgroups',
          where: {
            private: false,
            enabled: true
          }
        }],
        order: [[{ model: TrackGroup, as: 'trackgroups' }, 'releaseDate', 'DESC']],
        limit,
        offset
      })

      ctx.body = {
        data: await artistService(ctx).list(result),
        count,
        numberOfPages: Math.ceil(count / limit)
      }
    } catch (err) {
      console.error('err', err)
      ctx.throw(ctx.status, err.message)
    }
  }

  GET.apiDoc = {
    operationId: 'getUpdatedArtists',
    description: 'Returns last updated artists',
    summary: 'Find last updated artists',
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
