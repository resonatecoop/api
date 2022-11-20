const { TrackGroup, TrackGroupItem, Track, UserGroup } = require('../../../../../../db/models')
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
      const creators = await UserGroup.findAll({
        where: {
          ownerId: ctx.profile.id
        }
      })

      let result = await TrackGroup.findOne({
        attributes: ['id'],
        where: {
          creatorId: creators.map(creator => creator.id),
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
          trackId: {
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
                required: ['trackId'],
                properties: {
                  trackId: {
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
        description: 'The updated trackgroup items',
        schema: {
          $ref: '#definitions/ArrayOfTrackgroupItems'
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
