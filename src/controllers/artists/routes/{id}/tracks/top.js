const { Resonate: sequelize, Track } = require('../../../../../db/models')
const ms = require('ms')

module.exports = function (trackService) {
  const operations = {
    GET,
    parameters: [
      {
        name: 'id',
        in: 'path',
        type: 'string',
        required: true,
        description: 'Artist id.',
        format: 'uuid'
      }
    ]
  }

  async function GET (ctx, next) {
    if (await ctx.cashed?.(ms('30s'))) return
    const { limit = 3 } = ctx.request.query

    try {
      // FIXME: Sequelize this
      const result = await sequelize.query(`
      SELECT track.id as id, track.creator_id as "creatorId", track.status, track.track_name , track.track_url, trackgroup.title as "trackgroup.title", trackgroup.cover as "trackgroup.cover", trackgroup.type as type, track.track_cover_art as cover_art, trackgroup.cover as cover, file.id as file, track.track_duration, "userGroup".display_name as artist, count(play.id)
        FROM track_groups as trackgroup
        INNER JOIN track_group_items as item ON(item.track_group_id = trackgroup.id)
        INNER JOIN tracks as track ON(item.track_id = track.id AND track.status IN(0, 2, 3))
        INNER JOIN plays AS play ON (play.track_id = track.id)
        INNER JOIN user_groups as "userGroup" ON("userGroup".id = track.creator_id)
        LEFT JOIN files as file ON(file.id = track.track_url)
        WHERE (trackgroup.type IS NULL OR trackgroup.type NOT IN ('playlist', 'compilation'))
        AND track.id IN (
          SELECT play.track_id
          FROM plays as play
          GROUP BY play.track_id
          HAVING COUNT(DISTINCT play.id) > 1
        )
        AND trackgroup.creator_id = :artistId
        AND trackgroup.private = false
        AND trackgroup.enabled = true
        AND (trackgroup.release_date <= NOW() OR trackgroup.release_date IS NULL)
        GROUP BY track.id, trackgroup.cover, "userGroup".id, file.id, trackgroup.type, trackgroup.title
        ORDER by count(play.id) desc
        LIMIT :limit
      `, {
        type: sequelize.QueryTypes.SELECT,
        replacements: {
          artistId: ctx.params.id,
          limit
        },
        mapToModel: true,
        model: Track
      })

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
