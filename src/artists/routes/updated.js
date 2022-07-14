const models = require('../../db/models')
const { Resonate: sequelize, Track } = models
const resolveProfileImage = require('../../util/profile-image')
const map = require('awaity/map')
const he = require('he')

module.exports = function () {
  const operations = {
    GET
  }

  async function GET (ctx, next) {
    if (await ctx.cashed()) return

    const { limit = 50, page = 1 } = ctx.request.query

    const offset = page > 1 ? (page - 1) * limit : 0

    try {
      const [countResult] = await sequelize.query(`
        SELECT count(*) FROM (
          SELECT distinct trackgroup.creator_id, meta.meta_value
          FROM track_groups as trackgroup
          INNER JOIN rsntr_usermeta as meta ON(meta.user_id = trackgroup.creator_id AND meta.meta_key = 'nickname')
          WHERE (trackgroup.type IS NULL OR trackgroup.type NOT IN ('playlist', 'compilation'))
          AND trackgroup.private = false
          AND trackgroup.enabled = true
        ) as count
      `, {
        type: sequelize.QueryTypes.SELECT
      })

      const { count } = countResult

      const result = await sequelize.query(`
        SELECT distinct trackgroup.creator_id as id, meta.meta_value as artist
        FROM track_groups as trackgroup
        INNER JOIN rsntr_usermeta as meta ON(meta.user_id = trackgroup.creator_id AND meta.meta_key = 'nickname')
        INNER JOIN rsntr_usermeta AS umRole ON (
          umRole.user_id = trackgroup.creator_id AND umRole.meta_key = 'role' AND umRole.meta_value IN ('bands', 'member')
        )
        WHERE (trackgroup.type IS NULL OR trackgroup.type NOT IN ('playlist', 'compilation'))
        AND trackgroup.private = false
        AND trackgroup.enabled = true
        GROUP BY trackgroup.creator_id, meta.meta_value
        ORDER BY MAX(trackgroup.created_at) DESC
        LIMIT :limit
        OFFSET :offset
      `, {
        type: sequelize.QueryTypes.SELECT,
        replacements: {
          limit,
          offset
        },
        mapToModel: true,
        model: Track
      })

      ctx.body = {
        data: await map(result, async (item) => {
          return {
            name: he.decode(item.dataValues.artist),
            id: item.id,
            images: await resolveProfileImage(item.id)
          }
        }),
        count,
        numberOfPages: Math.ceil(count / limit)
      }
    } catch (err) {
      ctx.throw(ctx.status, err.message)
    }
  }

  GET.apiDoc = {
    operationId: 'getUpdatedArtists',
    description: 'Returns last updated artists',
    summary: 'Find last updated artists',
    tags: ['artists'],
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
