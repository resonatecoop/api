const { Play, Resonate: sequelize } = require('../../../../db/models')
const { Op } = require('sequelize')
const { authenticate } = require('../../authenticate')

module.exports = function () {
  const operations = {
    GET: [authenticate, GET]
  }

  async function GET (ctx, next) {
    const query = ctx.request.query

    try {
      const result = await Play.findAll({
        attributes: [
          [sequelize.fn('count', sequelize.col('track_id')), 'count'],
          'trackId'
        ],
        where: {
          event: 1,
          userId: ctx.profile.id,
          trackId: {
            [Op.in]: query.ids
          }
        },
        group: [
          sequelize.col('trackId')
        ],
        logging: console.log,
        raw: true
      })

      ctx.body = {
        data: result
      }
    } catch (err) {
      console.log('err', err)
      ctx.status = err.status || 500
      ctx.throw(ctx.status, err.message)
    }
  }

  GET.apiDoc = {
    operationId: 'resolvePlays',
    description: 'Determine how many times a track has been played from supplied track IDs',
    tags: ['plays'],
    consumes: [
      'application/json'
    ],
    produces: [
      'application/json'
    ],
    parameters: [
      {
        in: 'query',
        name: 'ids',
        required: true,
        description: 'IDs to check how much they\'ve been played',
        type: 'array',
        items: {
          type: 'string',
          format: 'uuid'
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
