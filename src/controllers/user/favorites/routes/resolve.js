const { Favorite, Resonate: sequelize } = require('../../../../db/models')
const { Op } = require('sequelize')

module.exports = function () {
  const operations = {
    POST
  }

  async function POST (ctx, next) {
    const body = ctx.request.body

    try {
      const result = await Favorite.findAll({
        attributes: ['track_id'],
        where: {
          type: 1,
          user_id: ctx.profile.id,
          track_id: {
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
      ctx.status = err.status || 500
      ctx.throw(ctx.status, err.message)
    }
  }

  POST.apiDoc = {
    operationId: 'resolveFavorites',
    description: 'Resolve favorites',
    tags: ['favorites'],
    parameters: [
      {
        in: 'body',
        name: 'favorites',
        schema: {
          type: 'object',
          required: ['ids'],
          properties: {
            ids: {
              type: 'array',
              items: {
                type: 'number'
              }
            }
          }
        }
      }
    ],
    responses: {
      200: {
        description: 'The favorites status',
        schema: {
          type: 'object'
        }
      },
      404: {
        description: 'No favorites found.'
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
