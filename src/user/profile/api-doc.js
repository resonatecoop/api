const apiDoc = {
  swagger: '2.0',
  info: {
    title: 'Resonate User Profile API.',
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
    Profile: {
      type: 'object',
      properties: {
        email: {
          type: 'string'
        },
        nickname: {
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
      description: 'No profile found.',
      schema: {
        $ref: '#/definitions/Error'
      }
    }
  },
  paths: {},
  security: [
    { Bearer: [] }
  ],
  tags: [{ name: 'profile' }]
}

module.exports = apiDoc
