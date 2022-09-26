const { Play, Resonate: sequelize } = require('../../../../db/models')
const { Op } = require('sequelize')
const authenticate = require('../../authenticate')

module.exports = function () {
  const operations = {
    POST: [authenticate, POST]
  }

  async function POST (ctx, next) {
    const body = ctx.request.body

    try {
      const result = await Play.findAll({
        attributes: [
          [sequelize.fn('count', sequelize.col('pid')), 'count'],
          ['tid', 'track_id']
        ],
        where: {
          event: 1,
          uid: ctx.profile.id,
          tid: {
            [Op.in]: body.ids
          }
        },
        group: [
          sequelize.col('tid')
        ],
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

  POST.apiDoc = {
    operationId: 'resolvePlays',
    description: 'Resolve plays',
    tags: ['plays'],
    consumes: [
      'application/json'
    ],
    produces: [
      'application/json'
    ],
    parameters: [
      {
        in: 'body',
        name: 'plays',
        schema: {
          $ref: '#/definitions/Plays'
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
