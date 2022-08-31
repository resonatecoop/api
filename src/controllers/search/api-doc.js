const { SwaggerError } = require('../../util/swagger')

const apiDoc = {
  swagger: '2.0',
  info: {
    title: 'Resonate Search API.',
    version: '2.0.0-1'
  },
  definitions: SwaggerError,
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
  paths: {},
  tags: [{ name: 'search' }]
}

module.exports = apiDoc
