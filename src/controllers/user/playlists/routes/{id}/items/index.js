const { Playlist, PlaylistItem, Track } = require('../../../../../../db/models')
const authenticate = require('../../../../authenticate')

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
    try {
      const body = ctx.request.body
      let result = await Playlist.findOne({
        attributes: ['creator_id'],
        where: {
          creator_id: ctx.profile.id,
          id: ctx.params.id
        },
        include: [{
          model: PlaylistItem,
          attributes: ['id', 'index'],
          as: 'items',
          include: [{
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

      await PlaylistItem.destroy({
        where: {
          trackgroupId: ctx.params.id
        }
      })

      // assign trackgroup id ref to each track group item
      const playlistItems = body.tracks.map((item, index) => {
        const o = Object.assign(item, {
          trackgroupId: ctx.params.id
        })
        if (!item.index) {
          o.index = count + 1
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
    operationId: 'updatePlaylistItems',
    description: 'Replace existing playlist items if any',
    tags: ['playlists'],
    parameters: [
      {
        name: 'id',
        in: 'path',
        type: 'string',
        required: true,
        description: 'Playlist uuid',
        format: 'uuid'
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
