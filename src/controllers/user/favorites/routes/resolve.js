const { Favorite, Resonate: sequelize } = require('../../../../db/models')
const { Op } = require('sequelize')
const { authenticate } = require('../../authenticate')

module.exports = function () {
  const operations = {
    GET: [authenticate, GET]
  }

  async function GET (ctx, next) {
    const query = ctx.request.query

    try {
      const result = await Favorite.findAll({
        attributes: ['trackId'],
        where: {
          type: true,
          userId: ctx.profile.id,
          trackId: {
            [Op.in]: query.ids
          }
        },
        group: [
          sequelize.col('trackId')
        ],
        raw: true
      })

      ctx.body = {
        data: result
      }
    } catch (err) {
      console.error('err', err)
      ctx.status = err.status || 500
      ctx.throw(ctx.status, err.message)
    }
  }

  GET.apiDoc = {
    operationId: 'resolveFavorites',
    description: 'Determine which tracks are favorited from supplied track IDs',
    tags: ['favorites'],
    parameters: [
      {
        in: 'query',
        name: 'ids',
        required: true,
        description: 'IDs to check for whether they\'re favorites',
        type: 'array',
        items: {
          type: 'string',
          format: 'uuid'
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
