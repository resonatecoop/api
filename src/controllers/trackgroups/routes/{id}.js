const { User, UserMeta, TrackGroup, TrackGroupItem, Track, File } = require('../../../db/models')
const { Op } = require('sequelize')
const coverSrc = require('../../../util/cover-src')
const ms = require('ms')

module.exports = function () {
  const operations = {
    GET,
    parameters: [
      {
        name: 'id',
        in: 'path',
        type: 'string',
        required: true,
        description: 'Trackgroup uuid.',
        format: 'uuid'
      }
    ]
  }

  async function GET (ctx, next) {
    if (await ctx.cashed(ms('30s'))) return

    const { type } = ctx.request.query

    const where = {
      id: ctx.params.id,
      enabled: true,
      private: false,
      release_date: {
        [Op.or]: {
          [Op.lte]: new Date(),
          [Op.eq]: null
        }
      }
    }

    const url = new URL(ctx.originalUrl, 'http://localhost')

    if (url.pathname.split('/')[1] === 'playlists') {
      where.type = 'playlist'
    } else if (type) {
      where.type = type
    }

    try {
      const result = await TrackGroup.findOne({
        attributes: [
          'about',
          'cover',
          'creator_id',
          'display_artist',
          'download',
          'id',
          'private',
          'release_date',
          'slug',
          'tags',
          'title',
          'type'
        ],
        where,
        order: [
          [{ model: TrackGroupItem, as: 'items' }, 'index', 'asc']
        ],
        include: [
          {
            model: User,
            required: false,
            attributes: ['id', 'display_name'],
            as: 'user'
          },
          {
            model: UserMeta,
            attributes: ['meta_key', 'meta_value'],
            where: {
              meta_key: {
                [Op.in]: ['nickname', 'role']
              }
            },
            as: 'usermeta'
          },
          {
            model: File,
            required: false,
            attributes: ['id', 'owner_id'],
            as: 'cover_metadata',
            where: {
              mime: {
                [Op.in]: ['image/jpeg', 'image/png']
              }
            }
          },
          {
            model: TrackGroupItem,
            attributes: ['id', 'index'],
            as: 'items',
            include: [{
              model: Track,
              attributes: ['id', 'creator_id', 'cover_art', 'title', 'album', 'artist', 'duration', 'status'],
              as: 'track',
              where: {
                status: {
                  [Op.in]: [0, 2, 3]
                }
              },
              include: [
                {
                  model: UserMeta,
                  attributes: ['meta_key', 'meta_value'],
                  where: {
                    meta_key: 'nickname'
                  },
                  as: 'meta'
                },
                {
                  model: File,
                  required: false,
                  attributes: ['id', 'owner_id'],
                  as: 'cover_metadata',
                  where: {
                    mime: {
                      [Op.in]: ['image/jpeg', 'image/png']
                    }
                  }
                },
                {
                  model: File,
                  attributes: ['id', 'size', 'owner_id'],
                  as: 'audiofile'
                }
              ]
            }
            ]
          }
        ]
      })

      if (!result) {
        ctx.status = 404
        ctx.throw(ctx.status, 'Track group does not exist')
      }

      const data = result.get({
        plain: true
      })

      const { usermeta } = data

      const { nickname, role } = Object.fromEntries(Object.entries(usermeta)
        .map(([key, value]) => {
          const metaKey = value.meta_key
          let metaValue = value.meta_value

          if (!isNaN(Number(metaValue))) {
            metaValue = Number(metaValue)
          }

          return [metaKey, metaValue]
        }))

      let ext = '.jpg'

      if (ctx.accepts('image/webp')) {
        ext = '.webp'
      }

      const variants = [120, 600]

      ctx.body = {
        data: {
          about: data.about,
          cover: coverSrc(data.cover, !data.cover_metadata ? '600' : '1500', ext, !data.cover_metadata),
          cover_metadata: {
            id: data.cover
          },
          creator_id: data.creator_id,
          display_artist: data.display_artist,
          user: {
            name: nickname,
            role: role,
            id: data.user.id
          },
          download: data.download,
          id: data.id,
          items: data.items.map((item) => {
            const { nickname } = Object.fromEntries(Object.entries(item.track.meta)
              .map(([key, value]) => {
                const metaKey = value.meta_key
                let metaValue = value.meta_value

                if (!isNaN(Number(metaValue))) {
                  metaValue = Number(metaValue)
                }

                return [metaKey, metaValue]
              }))

            const fallback = !item.track.cover_art ? false : !item.track.cover_metadata

            return {
              index: item.index,
              track: {
                id: item.track.id,
                title: item.track.title,
                status: item.track.status,
                album: item.track.album,
                duration: item.track.duration,
                creator_id: item.track.creator_id,
                artist: item.track.artist || nickname,
                cover: coverSrc(item.track.cover_art || data.cover, '600', ext, fallback),
                images: variants.reduce((o, key) => {
                  const variant = ['small', 'medium', 'large'][variants.indexOf(key)]

                  return Object.assign(o,
                    {
                      [variant]: {
                        width: key,
                        height: key,
                        url: coverSrc(item.track.cover_art || data.cover, key, ext, fallback)
                      }
                    }
                  )
                }, {}),
                url: `${process.env.STREAM_APP_HOST}/api/v3/user/stream/${item.track.id}`
              }
            }
          }),
          images: variants.reduce((o, key) => {
            const variant = ['small', 'medium', 'large'][variants.indexOf(key)]

            return Object.assign(o,
              {
                [variant]: {
                  width: key,
                  height: key,
                  url: coverSrc(data.cover, key, ext, !data.cover_metadata)
                }
              }
            )
          }, {}),
          peformers: data.peformers,
          private: data.private,
          release_date: data.release_date,
          slug: data.slug,
          tags: data.tags,
          title: data.title,
          type: data.type
        },
        status: 'ok'
      }
    } catch (err) {
      ctx.throw(ctx.status, err.message)
    }

    await next()
  }

  GET.apiDoc = {
    operationId: 'getTrackgroup',
    description: 'Returns a single trackgroup (lp, ep, single)',
    tags: ['trackgroups'],
    parameters: [
      {
        name: 'id',
        in: 'path',
        type: 'string',
        required: true,
        description: 'Trackgroup uuid',
        format: 'uuid'
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
