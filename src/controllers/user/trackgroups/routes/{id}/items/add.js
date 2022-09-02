const { TrackGroup, TrackGroupItem, Track, Artist } = require('../../../../../../db/models')
const { Op } = require('sequelize')

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
    const body = ctx.request.body
    try {
      const artists = Artist.findAll({
        where: {
          userId: ctx.profile.id
        }
      })
      let result = await TrackGroup.findOne({
        attributes: ['id'],
        where: {
          creator_id: artists.map(a => a.id),
          id: ctx.params.id
        },
        include: [{
          model: TrackGroupItem,
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

  PUT.apiDoc = {
    operationId: 'addTrackgroupItems',
    description: 'Add trackgroup items',
    tags: ['trackgroups'],
    parameters: [
      {
        name: 'id',
        in: 'path',
        type: 'string',
        required: true,
        description: 'Trackgroup uuid',
        format: 'uuid'
      },
      {
        in: 'body',
        name: 'trackgroupItemsAdd',
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
                    type: 'number',
                    minimum: 1
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
