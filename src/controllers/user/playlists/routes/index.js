const { Playlist, UserGroup, PlaylistItem, Track, File } = require('../../../../db/models')
const { Op } = require('sequelize')
const coverSrc = require('../../../../util/cover-src')
const { authenticate } = require('../../authenticate')

module.exports = function () {
  const operations = {
    POST: [authenticate, POST],
    GET: [authenticate, GET]
  }

  async function POST (ctx, next) {
    const body = ctx.request.body

    try {
      // FIXME: We should allow the user to select an artist to add the album to
      const artist = await UserGroup.findOne({
        where: {
          userId: ctx.profile.id
        }
      })
      const result = await Playlist.create(Object.assign(body, {
        creatorId: artist.id
      }))

      ctx.status = 201
      ctx.body = {
        data: result.get({
          plain: true
        }),
        status: 201
      }
    } catch (err) {
      console.error(err)
      ctx.status = err.status || 500
      ctx.throw(ctx.status, err.message)
    }

    await next()
  }

  POST.apiDoc = {
    operationId: 'createPlaylist',
    description: 'Create new playlist',
    tags: ['playlists'],
    parameters: [
      {
        in: 'body',
        name: 'playlist',
        description: 'The playlist to create.',
        schema: {
          $ref: '#/definitions/Playlist'
        }
      }
    ],
    responses: {
      201: {
        description: 'Playlist created response.',
        schema: {
          type: 'object'
        }
      },
      400: {
        description: 'Bad request'
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
    try {
      const { type, limit = 100, page = 1, featured, private: _private, includes } = ctx.request.query

      const where = {
        creatorId: ctx.profile.id
      }

      if (type) {
        where.type = type
      }

      if (_private) {
        where.private = true
      }

      if (featured) {
        where.featured = true
      }

      const whereTrackGroupItem = {}

      if (includes) {
        whereTrackGroupItem.track_id = includes // trackgroup where trackgroup item has a given track
      }

      const { rows: result, count } = await Playlist.findAndCountAll({
        limit,
        offset: page > 1 ? (page - 1) * limit : 0,
        attributes: [
          'id',
          'cover',
          'title',
          'creatorId',
          'about',
          'private'
        ],
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
            model: PlaylistItem,
            attributes: ['id', 'index'],
            required: !!whereTrackGroupItem.track_id,
            as: 'items',
            where: whereTrackGroupItem,
            include: [{
              model: Track,
              required: false,
              attributes: [
                'id',
                'title',
                'duration'
              ],
              as: 'track'
            }]
          }
        ],
        where
      })

      let ext = '.jpg'

      if (ctx.accepts('image/webp')) {
        ext = '.webp'
      }

      const variants = [120, 600]

      ctx.body = {
        data: result.map((item) => {
          const o = Object.assign({}, item.dataValues)

          o.creatorId = item.get('creatorId')

          o.tags = item.get('tags')

          o.cover = coverSrc(item.cover, '600', ext, !item.dataValues.cover_metadata)

          o.images = variants.reduce((o, key) => {
            const variant = ['small', 'medium', 'large'][variants.indexOf(key)]

            return Object.assign(o,
              {
                [variant]: {
                  width: key,
                  height: key,
                  url: coverSrc(item.cover, key, ext, !item.dataValues.cover_metadata)
                }
              }
            )
          }, {})

          return o
        }),
        count: count,
        numberOfPages: Math.ceil(count / limit),
        status: 'ok'
      }
    } catch (err) {
      ctx.throw(ctx.status, err.message)
    }

    await next()
  }

  GET.apiDoc = {
    operationId: 'getPlaylists',
    description: 'Returns playlists',
    summary: 'Find playlists',
    tags: ['playlists'],
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
        minimum: 1,
        maximum: 100
      },
      {
        type: 'integer',
        description: 'The current page',
        in: 'query',
        name: 'page',
        minimum: 1
      },
      {
        type: 'boolean',
        description: 'Filter featured releases',
        in: 'query',
        name: 'featured'
      },
      {
        type: 'integer',
        description: 'Find trackgroup containing a specific track',
        in: 'query',
        minimum: 1,
        name: 'includes'
      }
    ]
  }

  return operations
}
