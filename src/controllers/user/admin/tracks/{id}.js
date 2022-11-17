
const { Track, File } = require('../../../../db/models')

const { authenticate, hasAccess } = require('../../authenticate')
const coverSrc = require('../../../../util/cover-src')

module.exports = function () {
  const operations = {
    GET: [authenticate, hasAccess('admin'), GET],
    PUT: [authenticate, hasAccess('admin'), PUT],
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
    try {
      const result = await Track.findOne({
        where: {
          id: ctx.params.id
        },
        include: [
          {
            model: File,
            attributes: ['id', 'size', 'ownerId'],
            as: 'audiofile'
          }
        ]
      })

      const data = result.get({
        plain: true
      })

      let ext = '.jpg'

      if (ctx.accepts('image/webp')) {
        ext = '.webp'
      }

      const variants = [120, 600]

      data.cover = coverSrc(data.cover_art, '600', ext, !data.cover_metadata)

      data.images = variants.reduce((o, key) => {
        const variant = ['small', 'medium', 'large'][variants.indexOf(key)]

        return Object.assign(o,
          {
            [variant]: {
              width: key,
              height: key,
              url: coverSrc(data.cover_art, key, ext, !data.cover_metadata)
            }
          }
        )
      }, {})

      if (!data.cover_metadata) {
        data.cover_metadata = { id: data.cover }
      }

      ctx.body = {
        data,
        message: 'ok'
      }
    } catch (err) {
      ctx.throw(ctx.status, err.message)
    }

    await next()
  }

  GET.apiDoc = {
    operationId: 'getTracksThroughAdminById',
    description: 'Returns a single track',
    tags: ['admin'],
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
    // const isValid = validateBody(body)

    // if (!isValid) {
    //   const { message, dataPath } = validateBody.errors[0]
    //   ctx.status = 400
    //   ctx.throw(400, `${dataPath}: ${message}`)
    // }

    try {
      const result = await Track.update(body, {
        where: {
          id: ctx.params.id
        },
        returning: true,
        plain: true
      })

      ctx.status = 201
      ctx.body = {
        data: result[1],
        status: 'ok'
      }
    } catch (err) {
      ctx.throw(ctx.status, err.message)
    }

    await next()
  }

  return operations
}
