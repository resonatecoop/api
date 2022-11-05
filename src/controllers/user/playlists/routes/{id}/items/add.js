const { Playlist, PlaylistItem, Track, User } = require('../../../../../../db/models')
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
        description: 'Playlist uuid.',
        format: 'uuid'
      }
    ]
  }

  async function PUT (ctx, next) {
    const body = ctx.request.body
    try {
      const user = User.findOne({
        where: {
          id: ctx.profile.id
        }
      })
      let result = await Playlist.findOne({
        attributes: ['id'],
        where: {
          creatorId: user.id,
          id: ctx.params.id
        },
        include: [{
          model: PlaylistItem,
          attributes: ['id', 'index'],
          where: {
            track_id: {
              [Op.notIn]: body.tracks.map((item) => item.track_id)
            }
          },
          required: false,
          as: 'items',
          include: [{
            required: false,
            model: Track,
            as: 'track'
          }]
        }]
      })

      if (!result) {
        ctx.status = 404
        ctx.throw(ctx.status, 'Playlist does not exist or does not belong to your user account')
      }

      const count = result.items.length
      // assign trackgroup id ref to each track group item
      const playlistItems = body.tracks.map((item, index) => {
        const o = Object.assign(item, {
          playlistId: ctx.params.id
        })
        if (!item.index) {
          o.index = count + 1 + index
        }
        return o
      })

      await PlaylistItem.bulkCreate(playlistItems)
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
    operationId: 'addPlaylistItems',
    description: 'Add playlist items',
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
        name: 'playlistItemsAdd',
        schema: {
          type: 'object',
          additionalProperties: false,
          required: ['tracks'],
          properties: {
            tracks: {
              type: 'array',
              items: {
                type: 'object',
                required: ['track_id'],
                properties: {
                  track_id: {
                    type: 'string',
                    format: 'uuid'
                  },
                  title: {
                    type: 'string'
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
        description: 'The updated playlist items',
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
