const { Resonate: sequelize, Track } = require('../../../../../db/models')
const ms = require('ms')

module.exports = function (trackService) {
  const operations = {
    GET,
    parameters: [
      {
        name: 'id',
        in: 'path',
        type: 'integer',
        required: true,
        description: 'Artist id.'
      }
    ]
  }

  async function GET (ctx, next) {
    if (await ctx.cashed(ms('30s'))) return

    const { limit = 3 } = ctx.request.query

    try {
      const result = await sequelize.query(`
        SELECT track.tid as id, track.uid as creator_id, track.status, track.track_name, track.track_url, track.track_cover_art as cover_art, trackgroup.cover as cover, file.id as file, track.track_album, track.track_duration, meta.meta_value as artist, count(play.pid)
        FROM track_groups as trackgroup
        INNER JOIN track_group_items as item ON(item.track_group_id = trackgroup.id)
        INNER JOIN tracks as track ON(item.track_id = track.tid AND track.status IN(0, 2, 3))
        INNER JOIN plays AS play ON (play.tid = track.tid)
        INNER JOIN rsntr_usermeta as meta ON(meta.user_id = track.uid AND meta.meta_key = 'nickname')
        LEFT JOIN files as file ON(file.id = track.track_url)
        WHERE (trackgroup.type IS NULL OR trackgroup.type NOT IN ('playlist', 'compilation'))
        AND track.tid IN (
          SELECT play.tid
          FROM plays as play
          GROUP BY play.tid
          HAVING COUNT(DISTINCT play.pid) > 1
        )
        AND trackgroup.creator_id = :creatorId
        AND trackgroup.private = false
        AND trackgroup.enabled = true
        AND (trackgroup.release_date <= NOW() OR trackgroup.release_date IS NULL)
        GROUP BY track.tid, trackgroup.cover, meta.meta_value
        ORDER by count(play.pid) desc
        LIMIT :limit
      `, {
        type: sequelize.QueryTypes.SELECT,
        replacements: {
          creatorId: ctx.params.id,
          limit
        },
        mapToModel: true,
        model: Track
      })

      if (!result.length) {
        ctx.status = 404
        ctx.throw(ctx.status, 'No results')
      }

      ctx.body = {
        data: trackService(ctx).list(result)
      }
    } catch (err) {
      ctx.throw(ctx.status, err.message)
    }

    await next()
  }

  GET.apiDoc = {
    operationId: 'getArtistTopTracks',
    description: 'Returns artist top tracks',
    summary: 'Find artist top tracks',
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
        maximum: 10
      }
    ]
  }

  return operations
}
