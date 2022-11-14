const { UserGroup, UserGroupMember } = require('../../../../db/models')
const artistService = require('../../../artists/artistService')

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
    if (await ctx.cashed?.()) return

    const { limit = 50, page = 1 } = ctx.request.query
    const offset = page > 1 ? (page - 1) * limit : 0

    try {
      const { count, rows } = await UserGroup.findAndCountAll({
        limit,
        offset,
        include: [{
          model: UserGroupMember,
          required: true,
          as: 'memberOf',
          where: {
            belongsToId: ctx.params.id
          }
        }]
      })

      ctx.body = {
        data: await artistService(ctx).list(rows),
        count,
        pages: Math.ceil(count / limit)
      }
    } catch (err) {
      console.error(err)
      ctx.throw(ctx.status, err.message)
    }
  }

  GET.apiDoc = {
    operationId: 'getLabelArtists',
    description: 'Returns label artists',
    summary: 'Find label artists',
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
