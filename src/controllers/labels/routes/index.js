
const { UserGroup, UserGroupType } = require('../../../db/models')
const artistService = require('../../artists/artistService')

module.exports = function () {
  const operations = {
    GET
  }

  async function GET (ctx, next) {
    if (await ctx.cashed?.()) return

    try {
      const {
        limit = 100,
        page = 1
      } = ctx.request.query

      const offset = page > 1 ? (page - 1) * limit : 0

      const { rows: result, count } = await UserGroup.findAndCountAll({
        offset,
        limit,
        include: [{
          model: UserGroupType,
          as: 'type',
          required: true,
          where: {
            name: 'label'
          }
        }]
      })

      ctx.body = {
        data: await artistService(ctx).list(result),
        count,
        pages: Math.ceil(count / limit)
      }
    } catch (err) {
      console.error(err)
      ctx.throw(500, err.message)
    }

    await next()
  }

  GET.apiDoc = {
    operationId: 'getLabels',
    description: 'Returns label profiles',
    summary: 'Find labels',
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
