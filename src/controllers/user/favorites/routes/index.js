const { Track, Favorite, Resonate: sequelize } = require('../../../../db/models')
const trackService = require('../../../tracks/services/trackService')
const { authenticate } = require('../../authenticate')

module.exports = function () {
  const operations = {
    GET: [authenticate, GET],
    POST: [authenticate, POST]
  }

  async function POST (ctx, next) {
    const { track_id: tid } = ctx.request.body

    try {
      let result = await Favorite.findOne({
        where: {
          track_id: tid,
          user_id: ctx.profile.legacyId
        }
      })

      if (result) {
        result.type = !result.type // fav|unfav
        await result.save()
      } else {
        result = await Favorite.create({
          track_id: tid,
          user_id: ctx.profile.legacyId,
          type: 1
        })
      }

      ctx.body = {
        data: result
      }
    } catch (err) {
      ctx.status = err.status || 500
      ctx.throw(ctx.status, err.message)
    }

    await next()
  }

  POST.apiDoc = {
    operationId: 'createOrUpdateFavorite',
    description: 'Create or toggle favorite type',
    tags: ['favorites'],
    parameters: [
      {
        in: 'body',
        name: 'favorite',
        schema: {
          type: 'object',
          additionalProperties: false,
          required: ['track_id'],
          properties: {
            track_id: {
              type: 'number',
              minimum: 1
            }
          }
        }
      }
    ],
    responses: {
      200: {
        description: 'The favorite data',
        schema: {
          type: 'object'
        }
      },
      404: {
        description: 'No favorite found.'
      },
      default: {
        description: 'Unexpected error',
        schema: {
          $ref: '#/definitions/Error'
        }
      }
    }
  }

  async function GET (ctx, next) {
    const {
      limit = 10,
      page = 1
    } = ctx.request.query

    const offset = page > 1 ? (page - 1) * limit : 0

    try {
      const [countResult] = await sequelize.query(`
        SELECT count(favorite.fid) as count
        FROM favorites as favorite
        INNER JOIN tracks as track ON (track.tid = favorite.tid)
        WHERE favorite.uid = :listenerId
        AND favorite.type = 1
        AND track.status IN(0, 2, 3)
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
        INNER JOIN favorites AS favorite ON (favorite.tid = track.tid AND favorite.uid = :listenerId AND favorite.type = 1)
        INNER JOIN rsntr_usermeta as meta ON(meta.user_id = track.uid AND meta.meta_key = 'nickname')
        LEFT JOIN files as file ON(file.id = track.track_url)
        WHERE (trackgroup.type IS NULL OR trackgroup.type NOT IN ('playlist', 'compilation'))
        AND trackgroup.private = false
        AND trackgroup.enabled = true
        AND (trackgroup.release_date <= NOW() OR trackgroup.release_date IS NULL)
        GROUP BY track.tid, trackgroup.cover, meta.meta_value, favorite.fid
        ORDER BY favorite.fid DESC
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
    operationId: 'getFavorites',
    description: 'Returns user favorites tracks',
    tags: ['favorites'],
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
