const apiDoc = {
  swagger: '2.0',
  info: {
    title: 'Resonate User Tracks API.',
    version: '2.0.0-1'
  },
  securityDefinitions: {
    Bearer: { type: 'apiKey', name: 'Authorization', in: 'header' }
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
    Track: {
      type: 'object',
      additionalProperties: false,
      properties: {
        title: {
          type: 'string'
        },
        artist: {
          type: 'string'
        },
        album_artist: {
          type: 'string'
        },
        album: {
          type: 'string'
        },
        composer: {
          type: 'string'
        },
        status: {
          type: 'string',
          enum: ['paid', 'free', 'hidden'],
          default: 'paid'
        },
        year: {
          type: 'number',
          minimum: 1900,
          maximum: new Date().getFullYear() + 1
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
      description: 'No tracks were found.',
      schema: {
        $ref: '#/definitions/Error'
      }
    }
  },
  paths: {},
  security: [
    { Bearer: [] }
  ],
  tags: [{ name: 'tracks' }]
}

module.exports = apiDoc
