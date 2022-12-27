
const { Track } = require('../../../../../db/models')
const { processFile } = require('../../../../../util/process-file')
const { authenticate } = require('../../../authenticate')

module.exports = function () {
  const operations = {
    PUT: [authenticate, PUT]
  }

  async function PUT (ctx, next) {
    try {
      const files = ctx.request.files.files

      const data = Array.isArray(files)
        ? await Promise.all(files.map(processFile(ctx)))
        : await processFile(ctx)(files)

      const track = await Track.findOne({ where: { id: ctx.request.params.id } })
      track.set('url', data.filename)
      track.set('hls', true)
      await track.save()
      await track.reload()
      ctx.body = {
        data: track,
        status: 'ok'
      }
      await next()
    } catch (e) {
      ctx.status = 500
      ctx.throw(ctx.status, 'Problem creating file')
    }
  }

  PUT.apiDoc = {
    operationId: 'updateTrackFile',
    description: 'Add a file to a track',
    summary: '',
    tags: ['tracks'],
    // FIXME: re-enable this
    // parameters: [
    //   {
    //     name: 'id',
    //     in: 'path',
    //     type: 'string',
    //     required: true,
    //     description: 'Track uuid',
    //     format: 'uuid'
    //   }
    // ],
    responses: {
      200: {
        description: 'The updated trackgroup',
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
