const { Track, Resonate: sequelize } = require('../../../../db/models')
const { authenticate } = require('../../authenticate')

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
        SELECT count(*) as count FROM(
          SELECT track.id
          FROM tracks as track
          INNER JOIN rsntr_usermeta AS um ON (track.creator_id = um.user_id AND um.meta_key = 'nickname')
          INNER JOIN plays AS play ON (play.track_id = track.id AND play.event = 1 AND play.user_id = '71175a23-9256-41c9-b8c1-cd2170aa6591')
          WHERE track.status IN (0, 2, 3)
          AND track.track_cover_art IS NOT NULL
          GROUP BY track.id, um.meta_value
          HAVING COUNT(DISTINCT play.id) >= 9
        ) as count
      `, {
        type: sequelize.QueryTypes.SELECT,
        replacements: {
          listenerId: ctx.profile.id
        }
      })

      const { count } = countResult

      const result = await sequelize.query(`
        SELECT track.id, track.creator_id, track.status, track.track_name, track.track_url, track.track_cover_art as cover_art, trackgroup.cover as cover, file.id as file, 
          track.track_album, track.track_duration, meta.meta_value as artist, count(play.id) as count
        FROM track_groups as trackgroup
        INNER JOIN track_group_items as item ON(item.track_group_id = trackgroup.id)
        INNER JOIN tracks as track ON(item.track_id = track.id AND track.status IN(0, 2, 3))
        INNER JOIN plays AS play ON (play.track_id = track.id AND play.event = 1 AND play.user_id = :listenerId)
        INNER JOIN rsntr_usermeta as meta ON(meta.user_id = track.creator_id AND meta.meta_key = 'nickname')
        LEFT JOIN files as file ON(file.id = track.track_url)
          WHERE (trackgroup.type IS NULL OR trackgroup.type NOT IN ('playlist', 'compilation'))
          AND trackgroup.private = false
          AND trackgroup.enabled = true
          AND (trackgroup.release_date <= NOW() OR trackgroup.release_date IS NULL)
        GROUP BY track.id, file.id, trackgroup.cover, meta.meta_value
        HAVING COUNT(DISTINCT play.id) >= 9
        ORDER BY MAX(play.id) DESC
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
    operationId: 'getCollection',
    description: 'Returns user collection',
    tags: ['collection'],
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
