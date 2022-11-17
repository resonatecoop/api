import { authenticate } from '../authenticate.js'
import db from '../../../db/models/index.js'
const { File } = db

export default () => {
  const operations = {
    PUT: [authenticate, PUT]
  }

  async function PUT (ctx, next) {
    const body = ctx.request.body

    try {
      const [, file] = await File.update(body, {
        where: {
          id: ctx.params.id,
          ownerId: ctx.profile.id
        },
        returning: true,
        plain: true
      })

      ctx.status = 201
      ctx.body = {
        data: file,
        status: 'ok'
      }
    } catch (err) {
      ctx.throw(ctx.status, err.message)
    }

    await next()
  }

  PUT.apiDoc = {
    operationId: 'updateFile',
    description: 'Update a file',
    tags: ['admin'],
    parameters: [
      {
        name: 'id',
        in: 'path',
        type: 'string',
        required: true,
        description: 'file uuid',
        format: 'uuid'
      },
      {
        in: 'body',
        name: 'file',
        schema: {
          type: 'object',
          additionalProperties: false,
          // required: [],
          properties: {
            filename: {
              type: 'string'
            }
          }
        }
      }
    ],
    responses: {
      200: {
        description: 'The updated playlist',
        schema: {
          type: 'object'
        }
      },
      404: {
        description: 'No playlist found.'
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
