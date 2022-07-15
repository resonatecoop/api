const { UserMeta, Track, File } = require('../../../db/models')
const { Op } = require('sequelize')
const coverSrc = require('../../../util/cover-src')
const { validate } = require('../../../schemas/tracks')

module.exports = function () {
  const operations = {
    GET,
    DELETE,
    PUT,
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

  async function PUT (ctx, next) {
    const body = ctx.request.body
    const isValid = validate(body)

    if (!isValid) {
      const { message, dataPath } = validate.errors[0]
      ctx.status = 400
      ctx.throw(400, `${dataPath}: ${message}`)
    }

    try {
      const result = await Track.update(body, {
        where: {
          id: ctx.params.id,
          creator_id: ctx.profile.id
        },
        returning: true,
        plain: true
      })

      ctx.status = 201
      ctx.body = {
        data: result,
        status: 'ok'
      }
    } catch (err) {
      ctx.throw(ctx.status, err.message)
    }

    await next()
  }

  PUT.apiDoc = {
    operationId: 'updateTrack',
    description: 'Update track',
    tags: ['tracks'],
    parameters: [
      {
        in: 'body',
        name: 'track',
        description: 'The track to update.',
        schema: {
          $ref: '#/definitions/Track'
        }
      }
    ],
    responses: {
      201: {
        description: 'Trackgroup updated response.',
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

  async function DELETE (ctx, next) {
    try {
      await Track.destroy({
        where: {
          id: ctx.params.id,
          creator_id: ctx.profile.id
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

  // TODO: Add Swagger Docs

  async function GET (ctx, next) {
    try {
      const result = await Track.findOne({
        where: {
          id: ctx.params.id,
          creator_id: ctx.profile.id
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
            attributes: ['id', 'size', 'owner_id'],
            as: 'cover'
          },
          {
            model: File,
            attributes: ['id', 'size', 'owner_id'],
            as: 'audiofile'
          },
          {
            model: UserMeta,
            attributes: ['meta_key', 'meta_value'],
            required: false,
            where: { meta_key: { [Op.in]: ['nickname'] } },
            as: 'meta'
          }
        ]
      })

      if (!result) {
        ctx.status = 404
        ctx.throw(ctx.status, 'No track found')
      }

      const { nickname } = Object.fromEntries(Object.entries(result.meta)
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

      const variants = [120, 600, 1500]

      ctx.body = {
        data: {
          id: result.id,
          creator_id: result.creator_id,
          title: result.title,
          duration: result.duration,
          album: result.album,
          year: result.year,
          artist: nickname,
          cover: coverSrc(result.cover_art, '600', ext, !result.dataValues.cover),
          cover_metadata: {
            id: result.cover_art
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
