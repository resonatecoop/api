import { authenticate, hasAccess } from '../../authenticate.js'
import db from '../../../../db/models/index.js'
const { File } = db

export default () => {
  const operations = {
    GET: [authenticate, hasAccess('admin'), GET]
  }

  // FIXME: documentation
  async function GET (ctx, next) {
    const { limit = 100, page = 1 } = ctx.request.query

    try {
      const { rows: result, count } = await File.findAndCountAll({
        limit,
        offset: page > 1 ? page * limit : 0
      })

      ctx.body = {
        data: result,
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
    operationId: 'getFiles',
    description: 'Returns files',
    summary: 'Find files',
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
