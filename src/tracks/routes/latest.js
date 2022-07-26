const { Resonate: sequelize, Track } = require('../../db/models')
const ms = require('ms')

module.exports = function (trackService) {
  const operations = {
    GET
  }

  async function GET (ctx, next) {
    if (await ctx.cashed(ms('30s'))) return

    const { limit = 50, page = 1, order } = ctx.request.query

    const offset = page > 1 ? (page - 1) * limit : 0

    try {
      const [countResult] = await sequelize.query(`
        SELECT count(*) as count
        FROM track_groups as trackgroup
        INNER JOIN track_group_items as item ON(item.track_group_id = trackgroup.id)
        INNER JOIN tracks as track ON(item.track_id = track.tid AND track.status IN (0, 2, 3))
        INNER JOIN rsntr_usermeta as meta ON(meta.user_id = track.uid AND meta.meta_key = 'nickname')
        ${order === 'plays' ? 'INNER JOIN (SELECT tid, count(distinct uid) as uids FROM plays WHERE plays.date > now() - INTERVAL \'4 YEAR\' GROUP BY tid) AS play ON (play.tid = track.tid)' : ''}
        WHERE (trackgroup.type IS NULL OR trackgroup.type NOT IN ('playlist', 'compilation'))
        AND trackgroup.private = false
        AND trackgroup.enabled = true
        AND (trackgroup.release_date <= NOW() OR trackgroup.release_date IS NULL)
        LIMIT 1
      `, {
        type: sequelize.QueryTypes.SELECT
      })

      const { count } = countResult

      const result = await sequelize.query(`
        SELECT track.tid as id, track.uid as creator_id, track.status, track.track_name, track.track_url, track.track_cover_art as cover_art, trackgroup.cover as cover, file.id as file, track.track_album, track.track_duration, meta.meta_value as artist
        FROM track_groups as trackgroup
        INNER JOIN track_group_items as item ON(item.track_group_id = trackgroup.id)
        INNER JOIN tracks as track ON(item.track_id = track.tid AND track.status IN(0, 2, 3))
        INNER JOIN rsntr_usermeta as meta ON(meta.user_id = track.uid AND meta.meta_key = 'nickname')
        LEFT JOIN files as file ON(file.id = track.track_url)
        ${order === 'plays' ? 'INNER JOIN (SELECT tid, count(distinct uid) as uids FROM plays WHERE plays.date > now() - INTERVAL \'4 HOUR\' GROUP BY tid) AS play ON (play.tid = track.tid)' : ''}
        WHERE (trackgroup.type IS NULL OR trackgroup.type NOT IN ('playlist', 'compilation'))
        AND trackgroup.private = false
        AND trackgroup.enabled = true
        AND (trackgroup.release_date <= NOW() OR trackgroup.release_date IS NULL)
        ORDER BY ${order === 'plays' ? 'play.uids DESC,' : ''}
        trackgroup.created_at ${order === 'oldest' ? 'ASC' : 'DESC'}, 
        trackgroup.creator_id ASC, trackgroup.title ASC, item.index ASC
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
        data: trackService(ctx).list(result),
        count,
        numberOfPages: Math.ceil(count / limit)
      }
    } catch (err) {
      ctx.throw(ctx.status, err.message)
    }
  }

  GET.apiDoc = {
    operationId: 'getLatestTracks',
    description: 'Returns latest tracks',
    summary: 'Find latest tracks',
    tags: ['tracks'],
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
        description: 'Order',
        in: 'query',
        name: 'order',
        type: 'string',
        enum: ['oldest', 'newest', 'plays']
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
