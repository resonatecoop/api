module.exports = function () {
  const operations = {
    GET
  }

  function GET (ctx, next) {
    if (ctx.query.type === 'apiDoc') {
      ctx.state.apiDoc.basePath = ctx.query.basePath || '/'
      return (ctx.body = ctx.state.apiDoc)
    }
    return (ctx.body = ctx.state.operationDoc)
  }

  GET.apiDoc = {
    operationId: 'getApiDoc',
    description: 'Returns the requested apiDoc',
    parameters: [
      {
        description: 'The type of apiDoc to return.',
        in: 'query',
        name: 'type',
        type: 'string',
        enum: ['apiDoc', 'operationDoc']
      },
      {
        description: 'A custom basePath.',
        in: 'query',
        name: 'basePath',
        type: 'string',
        enum: ['/v3/user/tracks', '/api/v3/user/tracks', '/']
      }
    ],
    responses: {
      200: {
        description: 'The requested apiDoc.',
        schema: {
          type: 'object'
        }
      },
      default: {
        description: 'The requested apiDoc.'
      }
    }
  }

  return operations
}
