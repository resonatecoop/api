const { User, Playlist, File } = require('../../../../db/models')
const { Op } = require('sequelize')
const coverSrc = require('../../../../util/cover-src')
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
        description: 'User id.',
        format: 'uuid'
      }
    ]
  }

  async function GET (ctx, next) {
    if (await ctx.cashed?.(ms('30s'))) return

    try {
      const { limit = 100, page = 1 } = ctx.request.query

      const { rows: result, count } = await Playlist.findAndCountAll({
        limit,
        offset: page > 1 ? (page - 1) * limit : 0,
        where: {
          private: false,
          creatorId: ctx.params.id
        },
        attributes: [
          'id',
          'creatorId',
          'cover',
          'title',
          'about'
        ],
        include: [
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
          },
          {
            model: User,
            required: false,
            attributes: ['id', 'displayName'],
            as: 'creator'
          }
        ],
        order: [
          ['createdAt', 'DESC']
        ]
      })

      let ext = '.jpg'

      if (ctx.accepts('image/webp')) {
        ext = '.webp'
      }

      const variants = [120, 600, 1500]

      ctx.body = {
        data: result.map((item) => {
          const o = Object.assign({}, item.dataValues)

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
    operationId: 'getUserPlaylists',
    description: 'Returns playlists for a given user',
    tags: ['users'],
    parameters: [
      {
        name: 'id',
        in: 'path',
        type: 'string',
        required: true,
        description: 'User id',
        format: 'uuid'
      },
      {
        description: 'The maximum number of results to return',
        in: 'query',
        name: 'limit',
        type: 'integer',
        maximum: 100
      },
      {
        type: 'integer',
        description: 'The current page',
        in: 'query',
        name: 'page',
        minimum: 1
      }
    ],
    responses: {
      200: {
        description: 'The requested user playlists.',
        schema: {
          type: 'object'
        }
      },
      404: {
        description: 'No playlists found for this user.'
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
