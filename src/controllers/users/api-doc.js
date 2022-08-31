const { SwaggerError } = require('../util/swagger')

const apiDoc = {
  swagger: '2.0',
  info: {
    title: 'Resonate Users API.',
    version: '2.0.0-1'
  },
  definitions: {
    Error: SwaggerError
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
  tags: [{ name: 'users' }]
}

module.exports = apiDoc
