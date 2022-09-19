const { SwaggerError } = require('../../../util/swagger')

const apiDoc = {
  swagger: '2.0',
  info: {
    title: 'Resonate User Artist API.',
    version: '2.0.0-1'
  },
  securityDefinitions: {
    Bearer: { type: 'apiKey', name: 'Authorization', in: 'header' }
  },
  definitions: {
    Error: SwaggerError,
    Artist: {
      type: 'object',
      required: ['displayName'],
      additionalProperties: false,
      properties: {
        id: {
          type: 'number'
        },
        displayName: {
          type: 'string'
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
  security: [
    { Bearer: [] }
  ],
  tags: [{ name: 'trackgroups' }]
}

module.exports = apiDoc
