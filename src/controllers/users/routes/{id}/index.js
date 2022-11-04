const { User } = require('../../../../db/models')

module.exports = function () {
  const operations = {
    GET,
    parameters: [
      {
        name: 'id',
        in: 'path',
        type: 'string',
        required: true,
        description: 'User id.',
        format: 'uuid'
      }
    ]
  }
  async function GET (ctx, next) {
    if (await ctx.cashed?.()) return

    try {
      const user = await User.findOne({
        where: {
          id: ctx.params.id
        },
        attributes: ['displayName']
      })

      ctx.body = {
        data: user.get()
      }
    } catch (err) {
      ctx.throw(ctx.status, err.message)
    }

    await next()
  }

  GET.apiDoc = {
    operationId: 'getUser',
    description: 'Returns a single user',
    tags: ['users'],
    parameters: [
      {
        name: 'id',
        in: 'path',
        type: 'string',
        required: true,
        description: 'User id',
        format: 'uuid'
      }
    ],
    responses: {
      200: {
        description: 'The requested user profile.',
        schema: {
          type: 'object'
        }
      },
      404: {
        description: 'No user found.'
      },
      default: {
        description: 'Unexpected error',
        schema: {
          $ref: '#/definitions/Error'
        }
      }
    }
  }

  return operations
}
