const { User, Playlist, File } = require('../../../db/models')
const { Op } = require('sequelize')
const ms = require('ms')
const { loadProfileIntoContext } = require('../../user/authenticate')
const playlistService = require('../services/playlistService')

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
      const result = await Playlist.scope({ method: ['items', ctx.profile?.id] }).findOne({
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
