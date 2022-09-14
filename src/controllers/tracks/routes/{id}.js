const { Artist, TrackGroup, TrackGroupItem, Track, File } = require('../../../db/models')
const { Op } = require('sequelize')
const coverSrc = require('../../../util/cover-src')

module.exports = function () {
  const operations = {
    GET,
    parameters: [
      {
        name: 'id',
        in: 'path',
        type: 'integer',
        required: true,
        description: 'Track id.'
      }
    ]
  }

  async function GET (ctx, next) {
    if (await ctx.cashed()) return
    try {
      const result = await Track.findOne({
        where: {
          id: ctx.params.id,
          status: {
            [Op.in]: [0, 2, 3]
          }
        },
        attributes: [
          'id',
          'creator_id',
          'title',
          'url',
          'cover_art',
          'album',
          'duration',
          'year'
        ],
        include: [
          {
            model: File,
            attributes: ['id'],
            as: 'cover'
          },
          {
            model: File,
            attributes: ['id'],
            as: 'audiofile'
          }
          // {
          //   model: UserMeta,
          //   attributes: ['meta_key', 'meta_value'],
          //   required: false,
          //   where: { meta_key: { [Op.in]: ['nickname'] } },
          //   as: 'meta'
          // }
        ]
      })

      if (!result) {
        ctx.status = 404
        ctx.throw(ctx.status, 'No track found')
      }

      // find associated trackgroup for cover fallback
      const trackgroup = await TrackGroup.findOne({
        attributes: [
          'cover'
        ],
        where: {
          creator_id: result.creator_id,
          type: {
            [Op.in]: ['single', 'lp', 'ep']
          },
          private: false,
          enabled: true
        },
        include: [
          {
            model: TrackGroupItem,
            required: true,
            attributes: ['id', 'index'],
            as: 'items',
            where: {
              track_id: ctx.params.id
            }
          }
        ]
      })

      let cover

      if (trackgroup) {
        cover = trackgroup.cover
      }

      // FIXME: This should refer an artist, not the original uploader
      const artist = await Artist.findOne({ where: { id: result.creator_id } })

      let ext = '.jpg'

      if (ctx.accepts('image/webp')) {
        ext = '.webp'
      }

      const variants = [120, 600, 1500]

      ctx.body = {
        data: {
          id: result.id,
          creator_id: result.creator_id,
          title: result.title,
          duration: result.duration,
          album: result.album,
          year: result.year,
          artist: artist.display_name,
          cover: !result.cover_art
            ? coverSrc(cover, '600', ext, false)
            : coverSrc(result.cover_art, '600', ext, !result.dataValues.cover),
          cover_metadata: {
            id: result.cover_art ? result.cover_art : cover
            // width, height ?
          },
          status: result.status === 2 ? 'Free' : 'Paid',
          url: `https://api.resonate.is/v1/stream/${result.id}`,
          images: variants.reduce((o, key) => {
            const variant = ['small', 'medium', 'large'][variants.indexOf(key)]

            return Object.assign(o,
              {
                [variant]: {
                  width: key,
                  height: key,
                  url: coverSrc(result.cover_art, key, ext, !result.dataValues.cover)
                }
              }
            )
          }, {})
        }
      }
    } catch (err) {
      ctx.throw(ctx.status, err.message)
    }

    await next()
  }

  GET.apiDoc = {
    operationId: 'getTrack',
    description: 'Returns a single track',
    tags: ['tracks'],
    parameters: [
      {
        name: 'id',
        in: 'path',
        type: 'integer',
        required: true,
        description: 'Track id'
      }
    ],
    responses: {
      200: {
        description: 'The requested trackgroup.',
        schema: {
          type: 'object'
        }
      },
      404: {
        description: 'No trackgroup found.'
      },
      default: {
        description: 'Unexpected error',
        schema: {
          $ref: '#/definitions/Error'
        }
      }
    }
  }

  return operations
}
