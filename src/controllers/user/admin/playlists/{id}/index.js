
const { Playlist, File, PlaylistItem, Track } = require('../../../../../db/models')
const { Op } = require('sequelize')
const { authenticate, hasAccess } = require('../../../authenticate')
const coverSrc = require('../../../../../util/cover-src')

module.exports = function () {
  const operations = {
    GET: [authenticate, hasAccess('admin'), GET],
    PUT: [authenticate, hasAccess('admin'), PUT],
    DELETE: [authenticate, hasAccess('admin'), DELETE],
    parameters: [
      {
        name: 'id',
        in: 'path',
        type: 'string',
        required: true,
        description: 'User id.',
        format: 'uuid'
      }
    ]
  }

  async function GET (ctx, next) {
    const { type } = ctx.request.query

    const where = {
      id: ctx.params.id
    }

    if (type) {
      where.type = type
    }

    try {
      const result = await Playlist.findOne({
        where,
        order: [
          [{ model: PlaylistItem, as: 'items' }, 'index', 'asc']
        ],
        include: [
          {
            model: File,
            required: false,
            attributes: ['id', 'ownerId', 'mime'],
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
              attributes: [
                'id',
                'title',
                'cover_art',
                'album',
                'artist',
                'duration',
                'status',
                'composer',
                'year'
              ],
              as: 'track',
              include: [
                {
                  model: File,
                  attributes: ['id', 'ownerId'],
                  as: 'audiofile'
                },
                {
                  model: File,
                  attributes: ['id', 'size', 'ownerId'],
                  as: 'cover'
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

      let ext = '.jpg'

      if (ctx.accepts('image/webp')) {
        ext = '.webp'
      }

      const variants = [120, 600]

      data.items = data.items.map((item) => {
        item.track.cover = item.track.cover === null
          ? coverSrc(item.track.cover_art, '120', '.jpg', true)
          : coverSrc(item.track.cover, '120', ext, false)

        return item
      })

      data.cover = coverSrc(data.cover, '600', ext, !data.cover_metadata)

      data.images = variants.reduce((o, key) => {
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
      }, {})

      if (!data.cover_metadata) {
        data.cover_metadata = { id: data.cover }
      }

      ctx.body = {
        data,
        status: 'ok'
      }
    } catch (err) {
      ctx.throw(ctx.status, err.message)
    }

    await next()
  }

  GET.apiDoc = {
    operationId: 'getTrackGroupsThroughAdminById',
    description: 'Returns a single trackgroup',
    tags: ['admin'],
    parameters: [
      {
        name: 'id',
        in: 'path',
        type: 'string',
        required: true,
        description: 'TrackGroup id',
        format: 'uuid'
      }
    ],
    responses: {
      200: {
        description: 'The requested user.',
        schema: {
          type: 'object'
        }
      },
      404: {
        description: 'No user found.'
      },
      default: {
        description: 'Unexpected error',
        schema: {
          $ref: '#/definitions/Error'
        }
      }
    }
  }

  // FIXME: document
  async function PUT (ctx, next) {
    const body = ctx.request.body
    try {
      let result = await Playlist.update(body, {
        where: {
          id: ctx.params.id
        }
      })

      if (!result) {
        ctx.status = 404
        ctx.throw(ctx.status, 'Could not update')
      }

      result = await Playlist.findOne({
        where: {
          id: ctx.params.id
        }
      })

      ctx.body = {
        data: result,
        status: 'ok'
      }
    } catch (err) {
      ctx.throw(ctx.status, err.message)
    }

    await next()
  }

  // FIXME: document
  async function DELETE (ctx, next) {
    try {
      await Playlist.destroy({
        where: {
          id: ctx.params.id
        }
      })

      await PlaylistItem.destroy({
        where: {
          trackgroupId: ctx.params.id
        }
      })

      ctx.body = {
        data: null,
        message: 'ok'
      }
    } catch (err) {
      ctx.throw(ctx.status, err.message)
    }

    await next()
  }

  return operations
}
