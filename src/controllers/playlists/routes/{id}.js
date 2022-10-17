const { User, Playlist, PlaylistItem, Track, File } = require('../../../db/models')
const { Op } = require('sequelize')
const coverSrc = require('../../../util/cover-src')
const ms = require('ms')
const { loadProfileIntoContext } = require('../../user/authenticate')

module.exports = function () {
  const operations = {
    GET: [loadProfileIntoContext, GET],
    parameters: [
      {
        name: 'id',
        in: 'path',
        type: 'string',
        required: true,
        description: 'Playlist uuid.',
        format: 'uuid'
      }
    ]
  }

  async function GET (ctx, next) {
    if (await ctx.cashed?.(ms('30s'))) return

    const where = {
      id: ctx.params.id
    }

    if (ctx.profile?.id) {
      where[Op.or] = [{
        private: false
      }, {
        creatorId: ctx.profile.id
      }]
    } else {
      where.private = false
    }

    try {
      const result = await Playlist.findOne({
        attributes: [
          'about',
          'cover',
          'creatorId',
          'id',
          'private',
          'tags',
          'title'
        ],
        where,
        include: [
          {
            model: User,
            required: false,
            attributes: ['id', 'displayName'],
            as: 'creator'
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
            model: PlaylistItem,
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
              },
              include: [
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
        ctx.throw(ctx.status, 'Playlist does not exist')
      }

      const data = result.get({
        plain: true
      })

      let ext = '.jpg'

      if (ctx.accepts('image/webp')) {
        ext = '.webp'
      }

      const variants = [120, 600]

      ctx.body = {
        data: {
          ...data,
          cover: coverSrc(data.cover, !data.cover_metadata ? '600' : '1500', ext, !data.cover_metadata),
          cover_metadata: {
            id: data.cover
          },
          items: data.items.map((item) => {
            const fallback = !item.track.cover_art ? false : !item.track.cover_metadata

            return {
              index: item.index,
              track: {
                ...item.track,
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
          private: data.private,
          tags: data.tags,
          title: data.title
        },
        status: 'ok'
      }
    } catch (err) {
      ctx.throw(ctx.status, err.message)
    }

    await next()
  }

  GET.apiDoc = {
    operationId: 'getPlaylist',
    description: 'Returns a single playlist (lp, ep, single)',
    tags: ['playlists'],
    parameters: [
      {
        name: 'id',
        in: 'path',
        type: 'string',
        required: true,
        description: 'Playlist uuid',
        format: 'uuid'
      }
    ],
    responses: {
      200: {
        description: 'The requested playlist.',
        schema: {
          type: 'object'
        }
      },
      404: {
        description: 'No playlist found.'
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
