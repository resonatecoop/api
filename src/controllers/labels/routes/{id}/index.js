const { UserGroup, UserGroupLink } = require('../../../../db/models')

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

    try {
      const result = await UserGroup.scope('public').findOne({
        where: {
          id: ctx.params.id
        },
        include: [{
          model: UserGroupLink,
          as: 'links'
        }]
      })

      if (!result) {
        ctx.status = 404
        ctx.throw(ctx.status, 'Not found')
      }

      ctx.body = {
        data: await artistService(ctx).single(result)
      }
    } catch (err) {
      ctx.throw(ctx.status, err.message)
    }

    await next()
  }

  GET.apiDoc = {
    operationId: 'getLabel',
    description: 'Returns a single label',
    tags: ['labels'],
    parameters: [
      {
        name: 'id',
        in: 'path',
        type: 'string',
        required: true,
        description: 'Label id',
        format: 'uuid'
      }
    ],
    responses: {
      200: {
        description: 'The requested label profile.',
        schema: {
          type: 'object'
        }
      },
      404: {
        description: 'No label profile found.'
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
