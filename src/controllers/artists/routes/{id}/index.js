const models = require('../../../../db/models')
const artistService = require('../../artistService')
const { UserGroup } = models

module.exports = function () {
  const operations = {
    GET,
    parameters: [
      {
        name: 'id',
        in: 'path',
        type: 'string',
        required: true,
        description: 'User Group uuid.',
        format: 'uuid'
      }
    ]
  }

  async function GET (ctx, next) {
    if (await ctx.cashed?.()) return

    try {
      const result = await UserGroup.findOne({
        where: {
          id: ctx.params.id
        }
      })

      if (!result) {
        ctx.throw(404, 'Artist not found')
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
    operationId: 'getArtist',
    description: 'Returns a single artist',
    tags: ['artists'],
    parameters: [
      {
        name: 'id',
        in: 'path',
        type: 'string',
        required: true,
        description: 'Artist uuid',
        format: 'uuid'
      }
    ],
    responses: {
      200: {
        description: 'The requested artist profile.',
        schema: {
          type: 'object'
        }
      },
      404: {
        description: 'No artist profile found.'
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
