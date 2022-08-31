const { SwaggerError } = require('../../util/swagger')

const apiDoc = {
  swagger: '2.0',
  info: {
    title: 'Resonate Tag API.',
    version: '2.0.0-1'
  },
  definitions: {
    Error: SwaggerError,
    Tag: {
      type: 'object',
      properties: {
        limit: {
          description: 'The maximum number of results to fetch.',
          type: 'number',
          maximum: 100,
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
