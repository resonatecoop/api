const { TrackGroup, TrackGroupItem, Track } = require('../../../../../db/models')
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

    const ids = body.tracks.map((item) => item.track_id)

    try {
      let result = await TrackGroup.findOne({
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

      await TrackGroupItem.destroy({
        where: {
          track_group_id: ctx.params.id,
          track_id: {
            [Op.in]: ids
          }
        }
      })

      result = await TrackGroupItem.findAll({
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
          return TrackGroupItem.update(data, {
            where: {
              id: item.id
            }
          })
        })

        await Promise.all(promises)
      }

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
    operationId: 'removeTrackgroupItems',
    description: 'Remove trackgroup items',
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
        name: 'trackgroupItemsRemove',
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
