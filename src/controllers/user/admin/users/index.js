
const { User, Role } = require('../../../../db/models')
const { authenticate, hasAccess } = require('../../authenticate')

module.exports = function () {
  const operations = {
    GET: [authenticate, hasAccess('admin'), GET]
  }

  async function GET (ctx, next) {
    const { limit = 20, page = 1, q, role } = ctx.request.query

    try {
      const parameters = {
        limit,
        offset: page > 1 ? (page - 1) * limit : 0,
        role
      }

      if (q) {
        parameters.q = '%' + q + '%'
      }

      const { rows: result, count } = await User.findAndCountAll({
        limit,
        attributes: ['id', 'displayName', 'email', 'emailConfirmed', 'country', 'fullName', 'member'],
        order: [['displayName', 'asc']],
        offset: page > 1 ? (page - 1) * limit : 0,
        include: [
          {
            model: Role,
            as: 'role'
          }
        ]
      })

      ctx.body = {
        count: count,
        numberOfPages: Math.ceil(count / limit),
        data: result,
        status: 'ok'
      }
    } catch (err) {
      ctx.throw(ctx.status, err.message)
    }

    await next()
  }

  GET.apiDoc = {
    operationId: 'getUsersThroughAdmin',
    description: 'Returns all users',
    summary: 'Find users',
    tags: ['admin'],
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

  return operations
}
