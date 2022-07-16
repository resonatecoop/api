const apiDoc = {
  swagger: '2.0',
  info: {
    title: 'Resonate Tag API.',
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
      description: 'No results found for this tag.',
      schema: {
        $ref: '#/definitions/Error'
      }
    }
  },
  paths: {},
  tags: [{ name: 'tag' }]
}

module.exports = apiDoc
