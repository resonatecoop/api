const apiDoc = {
  swagger: '2.0',
  info: {
    title: 'Resonate Resolve API.',
    version: '2.0.0-1'
  },
  definitions: {
    Error: {
      type: 'object',
      properties: {
        code: {
          type: 'string'
        },
        message: {
          type: 'string'
        }
      },
      required: [
        'code',
        'message'
      ]
    },
    Resolve: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          minimum: 1
        }
      }
    }
  },
  responses: {
    BadRequest: {
      description: 'Bad request',
      schema: {
        $ref: '#/definitions/Error'
      }
    },
    NotFound: {
      description: 'No result found.',
      schema: {
        $ref: '#/definitions/Error'
      }
    }
  },
  paths: {},
  tags: [{ name: 'resolve' }]
}

module.exports = apiDoc
