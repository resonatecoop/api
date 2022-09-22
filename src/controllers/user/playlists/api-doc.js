const { SwaggerError } = require('../../../util/swagger')

const apiDoc = {
  swagger: '2.0',
  info: {
    title: 'Resonate User Playlist API.',
    version: '2.0.0-1'
  },
  securityDefinitions: {
    Bearer: { type: 'apiKey', name: 'Authorization', in: 'header' }
  },
  definitions: {
    Error: SwaggerError,
    Trackgroup: {
      type: 'object',
      required: ['title', 'cover'],
      additionalProperties: false,
      properties: {
        title: {
          type: 'string'
        },
        private: {
          type: 'boolean'
        },
        about: {
          type: 'string'
        },
        cover: {
          type: 'string',
          format: 'uuid'
        },
        tags: {
          type: 'array',
          items: {
            type: 'string'
          }
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
  tags: [{ name: 'playlists' }]
}

module.exports = apiDoc
