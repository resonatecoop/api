const models = require('../../../db/models')
const { UserGroup, TrackGroup, TrackGroupItem, Track } = models
// const resolveProfileImage = require('../../../util/profile-image')
// const map = require('awaity/map')
// const he = require('he')

module.exports = function () {
  const operations = {
    GET
  }

  async function GET (ctx, next) {
    if (await ctx.cashed()) return

    try {
      const {
        limit = 20,
        page = 1
      } = ctx.request.query

      const { rows: result, count } = await UserGroup.findAndCountAll({
        limit,
        order: [['displayName', 'asc']],
        offset: page > 1 ? (page - 1) * limit : 0,
        include: [
          {
            model: TrackGroup,
            include: [{
              model: TrackGroupItem,
              attributes: ['id', 'index', 'track_id'],
              as: 'items',
              include: [{
                model: Track,
                as: 'track'
              }]
            }]
          }
        ]
      })
      // const orderByColumn = {
      //   id: 'id',
      //   name: 'umNickname.meta_value'
      // }[orderBy]

      // const [countResult] = await sequelize.query(`
      //   SELECT count(distinct users.ID) as count
      //   FROM rsntr_users as users
      //   INNER JOIN tracks AS tracks ON users.ID = tracks.uid
      //   INNER JOIN rsntr_usermeta AS umNickname ON ( umNickname.user_id = users.ID AND umNickname.meta_key = 'nickname')
      //   INNER JOIN rsntr_usermeta AS umRole ON (
      //     umRole.user_id = users.ID AND umRole.meta_key = 'role' AND umRole.meta_value in ('bands', 'member')
      //   )
      //   WHERE tracks.status IN (0, 2, 3)
      //   AND tracks.track_album != ''
      //   AND tracks.track_cover_art != ''
      //   LIMIT 1
      // `, {
      //   type: sequelize.QueryTypes.SELECT
      // })

      // const result = await sequelize.query(`
      //   SELECT distinct ID, umNickname.meta_value as artist
      //   FROM rsntr_users as users
      //   INNER JOIN tracks AS tracks ON users.ID = tracks.uid
      //   INNER JOIN rsntr_usermeta AS umNickname ON ( umNickname.user_id = users.ID AND umNickname.meta_key = 'nickname')
      //   INNER JOIN rsntr_usermeta AS umRole ON (
      //     umRole.user_id = users.ID AND umRole.meta_key = 'role' AND umRole.meta_value IN ('bands', 'member')
      //   )
      //   WHERE tracks.status IN (0, 2, 3)
      //   AND tracks.track_album != ''
      //   AND tracks.track_cover_art != ''
      //   ORDER BY ${orderByColumn} ${order}
      //   LIMIT :limit
      //   OFFSET :offset
      // `, {
      //   type: sequelize.QueryTypes.SELECT,
      //   replacements: {
      //     limit,
      //     offset
      //   },
      //   mapToModel: true,
      //   model: User
      // })

      ctx.lastModified = new Date()

      ctx.body = {
        data: result.map((item) => {
          const o = Object.assign({}, item.dataValues)

          return o
        }),
        count,
        pages: Math.ceil(count / limit),
        status: 'ok'
      }
    } catch (err) {
      ctx.throw(ctx.status, err.message)
    }

    await next()
  }

  GET.apiDoc = {
    operationId: 'getArtists',
    description: 'Returns artist profiles',
    summary: 'Find artists',
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
        description: 'Order by column',
        in: 'query',
        name: 'orderBy',
        type: 'string',
        enum: ['id', 'name']
      },
      {
        description: 'Order',
        in: 'query',
        name: 'order',
        type: 'string',
        enum: ['asc', 'desc']
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
