const { Playlist } = require('../../../../../db/models')
const { authenticate } = require('../../../authenticate')

module.exports = function () {
  const operations = {
    PUT: [authenticate, PUT],
    parameters: [
      {
        name: 'id',
        in: 'path',
        type: 'string',
        required: true,
        description: 'Playlist uuid.',
        format: 'uuid'
      }
    ]
  }

  async function PUT (ctx, next) {
    const body = ctx.request.body

    try {
      await Playlist.update({
        private: body.private
      }, {
        where: {
          id: ctx.params.id,
          creatorId: ctx.profile.id
        }
      })

      ctx.body = {
        data: null,
        status: 'ok'
      }
    } catch (err) {
      ctx.throw(ctx.status, err.message)
    }

    await next()
  }

  PUT.apiDoc = {
    operationId: 'updatePlaylistPrivacy',
    description: 'Update playlist privacy setting',
    tags: ['playlists'],
    parameters: [
      {
        name: 'id',
        in: 'path',
        type: 'string',
        required: true,
        description: 'Playlist uuid',
        format: 'uuid'
      },
      {
        in: 'body',
        name: 'playlistPrivacy',
        schema: {
          type: 'object',
          additionalProperties: false,
          required: ['private'],
          properties: {
            private: {
              type: 'boolean',
              default: true
            }
          }
        }
      }
    ],
    responses: {
      200: {
        description: 'The updated playlist',
        schema: {
          type: 'object'
        }
      },
      404: {
        description: 'No playlist found.'
      },
      default: {
        description: 'Unexpected error',
        schema: {
          $ref: '#/definitions/Error'
        }
      }
    }
  }

  return operations
}
