const { User, Playlist, PlaylistItem, File } = require('../../../../../db/models')
const { Op } = require('sequelize')
const { authenticate } = require('../../../authenticate')
const playlistService = require('../../../../playlists/services/playlistService')

module.exports = function () {
  const operations = {
    GET: [authenticate, GET],
    PUT: [authenticate, PUT],
    DELETE: [authenticate, DELETE],
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

  async function DELETE (ctx, next) {
    const result = await Playlist.findOne({
      where: {
        creatorId: ctx.profile.id,
        id: ctx.params.id
      }
    })

    if (!result) {
      ctx.throw(404, 'Playlist does not exist')
    }

    try {
      await Playlist.destroy({
        where: {
          creatorId: ctx.profile.id,
          id: ctx.params.id
        }
      })

      // FIXME: This should cascade
      await PlaylistItem.destroy({
        where: {
          playlistId: ctx.params.id
        }
      })

      ctx.body = {
        data: null,
        message: 'Playlist was removed'
      }
    } catch (err) {
      ctx.throw(500, err.message)
    }

    await next()
  }

  DELETE.apiDoc = {
    operationId: 'deletePlaylist',
    description: 'Delete Playlist',
    tags: ['playlists'],
    responses: {
      200: {
        description: 'Playlist deleted response.',
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

  async function PUT (ctx, next) {
    const body = ctx.request.body

    try {
      let result = await Playlist.findOne({
        attributes: [
          'id'
        ],
        where: {
          creatorId: ctx.profile.id,
          id: ctx.params.id
        }
      })

      if (!result) {
        ctx.status = 404
        ctx.throw(ctx.status, 'Playlist does not exist or does not belong to your user account')
      }

      result = await Playlist.update(body, {
        where: {
          creatorId: ctx.profile.id,
          id: ctx.params.id
        },
        returning: true
      })

      if (!result) {
        ctx.status = 404
        ctx.throw(ctx.status, 'Could not update')
      }

      result = await Playlist.findOne({
        attributes: [
          'about',
          'creatorId',
          'id',
          'private',
          'tags',
          'cover',
          'title'
        ],
        where: {
          creatorId: ctx.profile.id,
          id: ctx.params.id
        }
      })

      ctx.body = {
        data: playlistService(ctx).single(result),
        status: 'ok'
      }
    } catch (err) {
      ctx.throw(ctx.status, err.message)
    }

    await next()
  }

  PUT.apiDoc = {
    operationId: 'updatePlaylist',
    description: 'Update playlist',
    tags: ['playlist'],
    parameters: [
      {
        in: 'body',
        name: 'playlist',
        description: 'The playlist to update.',
        schema: {
          $ref: '#/definitions/Playlist'
        }
      }
    ],
    responses: {
      200: {
        description: 'Playlist updated response.',
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
      const { type } = ctx.request.query

      const where = {
        creatorId: ctx.profile.id,
        id: ctx.params.id
      }

      if (type) {
        where.type = type
      }

      const result = await Playlist.scope('items').findOne({
        attributes: [
          'about',
          'id',
          'private',
          'creatorId',
          'tags',
          'cover',
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
            attributes: ['id', 'ownerId'],
            as: 'cover_metadata',
            where: {
              mime: {
                [Op.in]: ['image/jpeg', 'image/png']
              }
            }
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

      ctx.body = {
        data: playlistService(ctx).single(data),
        status: 'ok'
      }
    } catch (err) {
      console.error(err)
      ctx.throw(ctx.status, err.message)
    }

    await next()
  }

  GET.apiDoc = {
    operationId: 'getPlaylist',
    description: 'Returns a single playlist',
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
