const apiDoc = {
  swagger: '2.0',
  info: {
    title: 'Resonate API',
    version: '4.0.0'
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
      required: ['code', 'message']
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
      description: 'No trackgroups were found.',
      schema: {
        $ref: '#/definitions/Error'
      }
    }
  },
  paths: {}
}

module.exports = apiDoc
