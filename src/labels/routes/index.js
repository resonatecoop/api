const { User, Resonate: sequelize } = require('../../db/models')
const resolveProfileImage = require('../../util/profile-image')
const map = require('awaity/map')
const he = require('he')

module.exports = function () {
  const operations = {
    GET
  }

  async function GET (ctx, next) {
    if (await ctx.cashed()) return

    try {
      const {
        limit = 100,
        page = 1
      } = ctx.request.query

      const offset = page > 1 ? (page - 1) * limit : 0

      const [countResult] = await sequelize.query(`
        SELECT count(distinct label.ID) as count
        FROM rsntr_users AS label
        INNER JOIN rsntr_usermeta AS um ON (label.ID = um.user_id AND um.meta_key = 'nickname')
        INNER JOIN rsntr_usermeta AS um2 ON (
          um2.user_id = label.ID AND um2.meta_key = 'role' AND um2.meta_value in ('label-owner')
        )
        INNER JOIN (SELECT meta_value, user_id
          FROM rsntr_usermeta
          WHERE meta_key = 'mylabel'
          AND EXISTS(
            SELECT * from tracks as track
            WHERE track.uid = user_id
            AND track.status IN(0, 2, 3)
            AND track.track_album != ''
            AND track.track_cover_art != ''
          )
        ) as a
        ON a.meta_value = label.ID
        LIMIT 1
      `, {
        type: sequelize.QueryTypes.SELECT
      })

      const { count } = countResult

      const result = await sequelize.query(`
        SELECT distinct label.ID, um.meta_value AS name
        FROM rsntr_users AS label
        INNER JOIN rsntr_usermeta AS um ON (label.ID = um.user_id AND um.meta_key = 'nickname')
        INNER JOIN rsntr_usermeta AS um2 ON (
          um2.user_id = label.ID AND um2.meta_key = 'role' AND um2.meta_value in ('label-owner')
        )
        INNER JOIN (SELECT meta_value, user_id
          FROM rsntr_usermeta
          WHERE meta_key = 'mylabel'
          AND EXISTS(
            SELECT * from tracks as track
            WHERE track.uid = user_id
            AND track.status IN(0, 2, 3)
            AND track.track_album != ''
            AND track.track_cover_art != ''
          )
        ) as a
        ON a.meta_value = label.ID
        ORDER BY ID DESC
        LIMIT :limit
        OFFSET :offset
      `, {
        type: sequelize.QueryTypes.SELECT,
        replacements: {
          limit,
          offset
        },
        mapToModel: true,
        model: User
      })

      ctx.body = {
        data: await map(result, async (item) => {
          return {
            name: he.decode(item.dataValues.name),
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

    await next()
  }

  GET.apiDoc = {
    operationId: 'getLabels',
    description: 'Returns label profiles',
    summary: 'Find labels',
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
