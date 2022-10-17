const { TrackGroup, Track, TrackGroupItem } = require('../../../../db/models')
const slug = require('slug')
const coverSrc = require('../../../../util/cover-src')
const { Op } = require('sequelize')

module.exports = function (trackService) {
  const operations = {
    GET,
    parameters: [
      {
        name: 'id',
        in: 'path',
        type: 'string',
        required: true,
        description: 'Label id.',
        format: 'uuid'
      }
    ]
  }

  async function GET (ctx, next) {
    if (await ctx.cashed?.()) return

    const { limit = 5, page = 1 } = ctx.request.query
    const offset = page > 1 ? (page - 1) * limit : 0

    try {
      const { count, rows: result } = TrackGroup.findAndCountAll({
        limit,
        offset,
        attributes: [
          'about',
          'cover',
          'creatorId',
          'displayName',
          'id',
          'slug',
          'tags',
          'title',
          'type'
        ],
        where: {
          private: false,
          enabled: true,
          release_date: {
            [Op.or]: {
              [Op.lte]: new Date(),
              [Op.eq]: null
            }
          }
        },
        include: [{
          model: TrackGroupItem,
          attributes: ['id', 'index'],
          as: 'items',
          include: [{
            model: Track,
            attributes: ['id', 'creatorId', 'cover_art', 'title', 'album', 'artist', 'duration', 'status'],
            as: 'track',
            where: {
              status: {
                [Op.in]: [0, 2, 3]
              }
            }

          }
          ]
        }
        ]
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
