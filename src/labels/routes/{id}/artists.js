const { Resonate: sequelize, User } = require('../../../db/models')
const resolveProfileImage = require('../../../util/profile-image')
const map = require('awaity/map')
const he = require('he')

module.exports = function () {
  const operations = {
    GET,
    parameters: [
      {
        name: 'id',
        in: 'path',
        type: 'integer',
        required: true,
        description: 'Label id.'
      }
    ]
  }

  async function GET (ctx, next) {
    if (await ctx.cashed()) return

    const { limit = 50, page = 1 } = ctx.request.query
    const offset = page > 1 ? (page - 1) * limit : 0

    try {
      const [countResult] = await sequelize.query(`
        SELECT count(distinct u.ID) as count
        FROM rsntr_users as u
        INNER JOIN rsntr_usermeta AS um ON (u.ID = um.user_id AND um.meta_key = 'nickname')
        INNER JOIN tracks AS track ON (track.uid = u.ID)
        WHERE u.ID IN (SELECT user_id FROM rsntr_usermeta WHERE meta_key = 'mylabel' AND meta_value = :labelId)
        AND track.status IN (0, 2, 3)
        LIMIT 1
      `, {
        type: sequelize.QueryTypes.SELECT,
        replacements: {
          labelId: ctx.params.id
        }
      })

      const { count } = countResult

      const result = await sequelize.query(`
        SELECT distinct u.ID, um.meta_value as artist
        FROM rsntr_users as u
        INNER JOIN rsntr_usermeta AS um ON (u.ID = um.user_id AND um.meta_key = 'nickname')
        INNER JOIN tracks AS track ON (track.uid = u.ID)
        WHERE u.ID IN (SELECT user_id FROM rsntr_usermeta WHERE meta_key = 'mylabel' AND meta_value = :labelId)
        AND track.status IN (0, 2, 3)
        LIMIT :limit
        OFFSET :offset
    `, {
        type: sequelize.QueryTypes.SELECT,
        replacements: {
          labelId: ctx.params.id,
          limit,
          offset
        },
        mapToModel: true,
        model: User
      })

      if (!result) {
        ctx.status = 404
        ctx.throw(ctx.status, 'No artists')
      }

      ctx.body = {
        data: await map(result, async (item) => {
          return {
            name: he.decode(item.dataValues.artist),
            id: item.id,
            images: await resolveProfileImage(item.id)
          }
        }),
        count,
        pages: Math.ceil(count / limit)
      }
    } catch (err) {
      ctx.throw(ctx.status, err.message)
    }
  }

  GET.apiDoc = {
    operationId: 'getLabelArtists',
    description: 'Returns label artists',
    summary: 'Find label artists',
    tags: ['labels'],
    produces: [
      'application/json'
    ],
    responses: {
      400: {
        description: 'Bad request',
        schema: {
          $ref: '#/responses/BadRequest'
        }
      },
      404: {
        description: 'Not found',
        schema: {
          $ref: '#/responses/NotFound'
        }
      },
      default: {
        description: 'error payload',
        schema: {
          $ref: '#/definitions/Error'
        }
      }
    },
    parameters: [
      {
        description: 'The maximum number of results to return',
        in: 'query',
        name: 'limit',
        type: 'integer',
        maximum: 100
      },
      {
        type: 'integer',
        description: 'The current page',
        in: 'query',
        name: 'page',
        minimum: 1
      }
    ]
  }

  return operations
}
