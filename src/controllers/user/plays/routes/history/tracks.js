const { Track, Resonate: sequelize } = require('../../../../../db/models')
const authenticate = require('../../../authenticate')

module.exports = function (trackService) {
  const operations = {
    GET: [authenticate, GET]
  }

  async function GET (ctx, next) {
    const {
      limit = 10,
      page = 1
    } = ctx.request.query

    const offset = page > 1 ? (page - 1) * limit : 0

    try {
      const [countResult] = await sequelize.query(`
        SELECT count(distinct play.tid) AS count
        FROM plays as play
        INNER JOIN tracks AS track ON (play.tid = track.tid)
        INNER JOIN rsntr_usermeta AS um ON (track.uid = um.user_id AND um.meta_key = 'nickname')
        WHERE track.status IN(0, 2, 3)
        AND track.track_cover_art != ''
        AND play.uid = :listenerId
      `, {
        type: sequelize.QueryTypes.SELECT,
        replacements: {
          listenerId: ctx.profile.id
        }
      })

      const { count } = countResult

      const result = await sequelize.query(`
        SELECT track.tid as id, track.uid as creator_id, track.status, track.track_name, track.track_url, track.track_cover_art as cover_art, trackgroup.cover as cover, file.id as file, track.track_album, track.track_duration, meta.meta_value as artist
        FROM track_groups as trackgroup
        INNER JOIN track_group_items as item ON(item.track_group_id = trackgroup.id)
        INNER JOIN tracks as track ON(item.track_id = track.tid AND track.status IN(0, 2, 3))
        INNER JOIN plays AS play ON (play.tid = track.tid AND play.uid = :listenerId)
        INNER JOIN rsntr_usermeta as meta ON(meta.user_id = track.uid AND meta.meta_key = 'nickname')
        LEFT JOIN files as file ON(file.id = track.track_url)
        WHERE (trackgroup.type IS NULL OR trackgroup.type NOT IN ('playlist', 'compilation'))
        AND trackgroup.private = false
        AND trackgroup.enabled = true
        AND (trackgroup.release_date <= NOW() OR trackgroup.release_date IS NULL)
        GROUP BY track.tid, trackgroup.cover, meta.meta_value
        ORDER BY MAX(play.date) DESC
        LIMIT :limit
        OFFSET :offset
      `, {
        type: sequelize.QueryTypes.SELECT,
        replacements: {
          listenerId: ctx.profile.id,
          limit: limit,
          offset: offset
        },
        mapToModel: true,
        model: Track
      })

      ctx.body = {
        data: trackService(ctx).list(result),
        count,
        pages: Math.ceil(count / limit)
      }
    } catch (err) {
      ctx.status = err.status
      ctx.throw(ctx.status, err.message)
    }

    await next()
  }

  GET.apiDoc = {
    operationId: 'getPlayHistory',
    description: 'Returns user play history',
    tags: ['plays'],
    parameters: [
      {
        description: 'The maximum number of results to return',
        in: 'query',
        name: 'limit',
        type: 'integer'
      },
      {
        description: 'The current page',
        in: 'query',
        name: 'page',
        type: 'integer'
      }
    ],
    responses: {
      200: {
        description: 'The requested search results.',
        schema: {
          type: 'object'
        }
      },
      404: {
        description: 'No results were found.'
      }
    }
  }

  return operations
}
