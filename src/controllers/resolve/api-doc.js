const { SwaggerError } = require('../util/swagger')

const apiDoc = {
  swagger: '2.0',
  info: {
    title: 'Resonate Resolve API.',
    version: '2.0.0-1'
  },
  definitions: {
    Error: SwaggerError,
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
