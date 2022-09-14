const { SwaggerError } = require('../../../util/swagger')

const apiDoc = {
  swagger: '2.0',
  info: {
    title: 'Resonate User Trackgroup API.',
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
        display_artist: {
          type: 'string'
        },
        artistId: {
          type: 'number'
        },
        release_date: {
          type: 'string',
          format: 'date'
        },
        private: {
          type: 'boolean'
        },
        type: {
          type: 'string',
          enum: ['lp', 'ep', 'single', 'playlist']
        },
        about: {
          type: 'string'
        },
        cover: {
          type: 'string',
          format: 'uuid'
        },
        composers: {
          type: 'array',
          items: {
            type: 'string'
          }
        },
        performers: {
          type: 'array',
          items: {
            type: 'string'
          }
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
  tags: [{ name: 'trackgroups' }]
}

module.exports = apiDoc
