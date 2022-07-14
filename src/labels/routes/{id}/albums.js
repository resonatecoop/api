const { Resonate: sequelize, Track } = require('../../../db/models')
const slug = require('slug')
const coverSrc = require('../../../util/cover-src')

module.exports = function (trackService) {
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

    const { limit = 5, page = 1, various = false } = ctx.request.query
    const offset = page > 1 ? (page - 1) * limit : 0

    try {
      const [countResult] = await sequelize.query(`
        SELECT count(*) as count FROM(
          SELECT distinct (track.track_album)
          FROM tracks as track
          WHERE track.uid IN (
            SELECT user_id
            FROM rsntr_usermeta
            WHERE meta_key = 'mylabel'
            AND meta_value = :labelId
          )
          AND track.status IN (0, 2, 3)
          AND track.track_album != ''
          AND track.track_cover_art != ''
          GROUP BY track.track_album
          ${various ? 'HAVING count(distinct track.uid) > 1' : ''}
        ) as count
      `, {
        type: sequelize.QueryTypes.SELECT,
        replacements: {
          labelId: ctx.params.id
        }
      })

      const { count } = countResult

      const result = await sequelize.query(`
        SELECT distinct(track.track_name), track.uid as creator_id, track.tid, track.track_album, track.track_duration, track.track_cover_art as cover_art, track.status, track.uid, um.meta_value as artist, track.track_number, cover.id as cover
        FROM tracks as track
        INNER JOIN rsntr_usermeta AS um ON (track.uid = um.user_id AND um.meta_key = 'nickname')
        LEFT OUTER JOIN files AS cover ON (track.track_cover_art = cover.id)
        INNER JOIN (
          SELECT distinct (t2.track_album)
          FROM tracks as t2
          WHERE t2.uid IN (
            SELECT user_id
            FROM rsntr_usermeta
            WHERE meta_key = 'mylabel'
            AND meta_value = :labelId
          )
          AND t2.status IN (0, 2, 3)
          AND t2.track_album != ''
          AND t2.track_cover_art != ''
          GROUP BY t2.track_album
          ${various ? 'HAVING count(distinct t2.uid) > 1' : ''}
          ORDER BY t2.track_album
          LIMIT :limit
          OFFSET 0
        ) as track2 ON track2.track_album = track.track_album
        WHERE track.uid IN (
          SELECT user_id
          FROM rsntr_usermeta
          WHERE meta_key = 'mylabel'
          AND meta_value = :labelId
        )
        AND track.status IN (0, 2, 3)
        AND track.track_album != ''
        AND track.track_cover_art != ''
        ORDER BY track.track_album, track.track_number, track.tid
        LIMIT 50
      `, {
        type: sequelize.QueryTypes.SELECT,
        replacements: {
          labelId: ctx.params.id,
          limit,
          offset
        },
        mapToModel: true,
        model: Track
      })

      if (!result.length) {
        ctx.status = 404
        ctx.throw(ctx.status, 'No albums')
      }

      let ext = '.jpg'

      if (ctx.accepts('image/webp')) {
        ext = '.webp'
      }

      const trackgroups = []

      result.reduce((res, value, index, array) => {
        const album = value.dataValues.album
        const albumKey = slug(album)

        if (album && !res[albumKey]) {
          // assume the trackgroup type based on the number of tracks
          // may not be always accurate
          const tracks = result.filter(item => {
            return slug(item.album) === albumKey
          })

          const duration = tracks.reduce((acc, value) => {
            return acc + value.duration
          }, 0)

          const isVarious = [...new Set(tracks.map(({ uid }) => uid))].length > 1

          res[albumKey] = {
            title: album,
            cover: coverSrc(value.cover_art, '600', ext, !value.dataValues.cover),
            duration,
            display_artist: isVarious ? 'V/A' : value.artist,
            creator_id: value.creator_id,
            various: isVarious,
            items: trackService(ctx).list(tracks)
          }

          trackgroups.push(res[albumKey])
        }

        return res
      }, {})

      const data = trackgroups.flat(1)

      ctx.body = {
        data: data,
        count,
        pages: Math.ceil(count / limit)
      }
    } catch (err) {
      ctx.throw(ctx.status, err.message)
    }
  }

  GET.apiDoc = {
    operationId: 'getLabelAlbums',
    description: 'Returns labels albums',
    summary: 'Find label albums',
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
        description: 'Filter various artist albums',
        in: 'query',
        name: 'various',
        type: 'boolean'
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
