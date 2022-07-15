const { TrackGroup, TrackGroupItem, Track } = require('../../../../../db/models')

const {
  validateTrackgroupItems,
  validateParams
} = require('../../../../../schemas/trackgroup')

module.exports = function () {
  const operations = {
    PUT,
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
    let isValid = validateParams(ctx.params)

    if (!isValid) {
      const { message, dataPath } = validateParams.errors[0]
      ctx.status = 400
      ctx.throw(400, `${dataPath}: ${message}`)
    }

    const body = ctx.request.body

    isValid = validateTrackgroupItems(body)

    if (!isValid) {
      const { message, dataPath } = validateTrackgroupItems.errors[0]
      ctx.status = 400
      ctx.throw(400, `${dataPath}: ${message}`)
    }

    try {
      let result = await TrackGroup.findOne({
        attributes: ['creator_id'],
        where: {
          creator_id: ctx.profile.id,
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

      await TrackGroupItem.destroy({
        where: {
          trackgroupId: ctx.params.id
        }
      })

      // assign trackgroup id ref to each track group item
      const trackGroupItems = body.tracks.map((item, index) => {
        const o = Object.assign(item, {
          trackgroupId: ctx.params.id
        })
        if (!item.index) {
          o.index = count + 1
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

  PUT.apiDoc = {
    operationId: 'updateTrackgroupItems',
    description: 'Replace existing trackgroup items if any',
    tags: ['trackgroups'],
    parameters: [
      {
        name: 'id',
        in: 'path',
        type: 'string',
        required: true,
        description: 'Trackgroup uuid',
        format: 'uuid'
      }
    ],
    responses: {
      200: {
        description: 'The updated trackgroup items',
        schema: {
          type: 'object'
        }
      },
      404: {
        description: 'No trackgroup found.'
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
