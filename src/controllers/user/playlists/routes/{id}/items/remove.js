const { Playlist, PlaylistItem, Track } = require('../../../../../../db/models')
const { Op } = require('sequelize')
const { authenticate } = require('../../../../authenticate')

module.exports = function () {
  const operations = {
    PUT: [authenticate, PUT],
    parameters: [
      {
        name: 'id',
        in: 'path',
        type: 'string',
        required: true,
        description: 'Trackgroup uuid.',
        format: 'uuid'
      }
    ]
  }

  async function PUT (ctx, next) {
    const body = ctx.request.body

    const ids = body.tracks.map((item) => item.trackId)

    try {
      let result = await Playlist.findOne({
        attributes: ['id'],
        where: {
          creator_id: ctx.profile.id,
          id: ctx.params.id
        }
      })

      if (!result) {
        ctx.status = 404
        ctx.throw(ctx.status, 'Track group does not exist or does not belong to your user account')
      }

      await PlaylistItem.destroy({
        where: {
          playlistId: ctx.params.id,
          trackId: {
            [Op.in]: ids
          }
        }
      })

      result = await PlaylistItem.findAll({
        raw: true,
        where: {
          playlistId: ctx.params.id
        },
        order: [
          ['index', 'ASC']
        ]
      })

      /*
       * Reset indexes
       */

      if (result) {
        const promises = result.map((item, index) => {
          const data = { index: index + 1 }
          return PlaylistItem.update(data, {
            where: {
              id: item.id
            }
          })
        })

        await Promise.all(promises)
      }

      result = await PlaylistItem.findAll({
        where: {
          playlistId: ctx.params.id
        },
        include: [{
          model: Track,
          as: 'track'
        }],
        order: [
          ['index', 'ASC']
        ]
      })

      ctx.body = {
        data: result,
        status: 'ok'
      }
    } catch (err) {
      ctx.throw(ctx.status, err.message)
    }

    await next()
  }

  PUT.apiDoc = {
    operationId: 'removePlaylistItems',
    description: 'Remove playlist items',
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
        name: 'playlistItemsRemove',
        schema: {
          type: 'object',
          additionalProperties: false,
          required: ['tracks'],
          properties: {
            tracks: {
              type: 'array',
              items: {
                type: 'object',
                required: ['trackId'],
                properties: {
                  trackId: {
                    type: 'string',
                    format: 'uuid'
                  },
                  index: {
                    type: 'number',
                    minimum: 1
                  }
                }
              }
            }
          }
        }
      }
    ],
    responses: {
      200: {
        description: 'The updated playlists items',
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
