
const { Playlist, PlaylistItem, Track } = require('../../../../../../db/models')
const { authenticate, hasAccess } = require('../../../../authenticate')
const { Op } = require('sequelize')

module.exports = function () {
  const operations = {
    PUT: [authenticate, hasAccess('admin'), PUT],
    parameters: [
      {
        name: 'id',
        in: 'path',
        type: 'string',
        required: true,
        description: 'User id.',
        format: 'uuid'
      }
    ]
  }

  // FIXME document
  async function PUT (ctx, next) {
    const body = ctx.request.body

    const ids = body.tracks.map((item) => item.trackId)

    try {
      let result = await Playlist.findOne({
        where: {
          id: ctx.params.id
        }
      })

      if (!result) {
        ctx.status = 404
        ctx.throw(ctx.status, 'Track group does not exist or does not belong to your user account')
      }

      await PlaylistItem.destroy({
        where: {
          track_group_id: ctx.params.id,
          trackId: {
            [Op.in]: ids
          }
        }
      })

      result = await PlaylistItem.findAll({
        raw: true,
        where: {
          track_group_id: ctx.params.id
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
          trackgroupId: ctx.params.id
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

  return operations
}
