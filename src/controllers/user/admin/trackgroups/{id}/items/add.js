
const { TrackGroup, TrackGroupItem, Track } = require('../../../../../../db/models')
const { authenticate, hasAccess } = require('../../../../authenticate')

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

  // FIXME documnet
  async function PUT (ctx, next) {
    const body = ctx.request.body

    try {
      let result = await TrackGroup.findOne({
        where: {
          id: ctx.params.id
        },
        include: [{
          model: TrackGroupItem,
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
        ctx.throw(ctx.status, 'Track group does not exist or does not belong to your user account')
      }

      const count = result.items.length

      // assign trackgroup id ref to each track group item
      const trackGroupItems = body.tracks.map((item, index) => {
        const o = Object.assign(item, {
          trackgroupId: ctx.params.id
        })
        if (!item.index) {
          o.index = count + 1 + index
        }
        return o
      })

      await TrackGroupItem.bulkCreate(trackGroupItems)

      result = await TrackGroupItem.findAll({
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
