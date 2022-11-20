
const { User, Track, File, UserGroup, Resonate: sequelize, TrackGroupItem } = require('../../../../../db/models')
const coverSrc = require('../../../../../util/cover-src')
const { validate } = require('../../../../../schemas/tracks')
const { authenticate } = require('../../../authenticate')
const { apiRoot } = require('../../../../../constants')

module.exports = function () {
  const operations = {
    DELETE: [authenticate, DELETE],
    GET: [authenticate, GET],
    PUT: [authenticate, PUT],
    parameters: [
      {
        name: 'id',
        in: 'path',
        type: 'string',
        required: true,
        description: 'Track id.',
        format: 'uuid'
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
      const foundTrack = Track.findOne({
        where: {
          id: ctx.params.id,
          creatorId: ctx.profile.id
        }
      })

      if (!foundTrack) {
        ctx.status = 404
        ctx.throw(ctx.status, 'Track not found')
      }

      const t = await sequelize.transaction()

      await TrackGroupItem.destroy({
        where: {
          trackId: ctx.params.id
        },
        transaction: t
      })

      await Track.destroy({
        where: {
          id: ctx.params.id,
          creatorId: ctx.profile.id
        },
        transaction: t
      })

      t.commit()

      ctx.body = {
        data: null,
        message: 'ok'
      }
    } catch (err) {
      ctx.throw(ctx.status, err.message)
    }

    await next()
  }

  DELETE.apiDoc = {
    operationId: 'getTrack',
    description: 'Deletes a single track owned by the user',
    tags: ['tracks'],
    parameters: [
      {
        name: 'id',
        in: 'path',
        type: 'string',
        required: true,
        description: 'Track id',
        format: 'uuid'
      }
    ],
    responses: {
      200: {
        description: 'Track deleted.',
        schema: {
          type: 'object'
        }
      },
      404: {
        description: 'No track found.'
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
      const result = await Track.findOne({
        where: {
          id: ctx.params.id
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
            model: UserGroup,
            as: 'creator',
            required: true,
            attributes: ['id', 'ownerId', 'typeId', 'displayName'],
            include: [{
              model: User,
              as: 'owner',
              attributes: ['id'],
              required: true,
              where: {
                id: ctx.profile.id
              }
            }]
          },
          {
            model: File,
            attributes: ['id', 'size', 'ownerId'],
            as: 'audiofile'
          }
        ]
      })

      if (!result) {
        ctx.status = 404
        ctx.throw(ctx.status, 'No track found')
      }

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
          cover: coverSrc(result.cover_art, '600', ext, !result.dataValues.cover),
          cover_metadata: {
            id: result.cover_art
            // width, height ?
          },
          status: result.status === 2 ? 'Free' : 'Paid',
          url: `${process.env.APP_HOST}${apiRoot}/stream/${result.id}`,
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
        type: 'string',
        required: true,
        description: 'Track id',
        format: 'uuid'
      }
    ],
    responses: {
      200: {
        description: 'The requested track.',
        schema: {
          type: 'object'
        }
      },
      404: {
        description: 'No track found.'
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
