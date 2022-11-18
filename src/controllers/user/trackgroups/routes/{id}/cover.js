
const { TrackGroup } = require('../../../../../db/models')
const { processFile } = require('../../../../../util/process-file')
const { authenticate } = require('../../../authenticate')

module.exports = function () {
  const operations = {
    PUT: [authenticate, PUT]
  }

  async function PUT (ctx, next) {
    try {
      const file = ctx.request.files.file
      // TODO: Remove prior files
      const data = Array.isArray(file)
        ? await Promise.all(file.map(processFile(ctx)))
        : await processFile(ctx)(file)

      const trackgroup = await TrackGroup.findOne({ where: { id: ctx.request.params.id } })
      trackgroup.set('cover', data.filename)
      await trackgroup.save()
      await trackgroup.reload()
      ctx.body = {
        data: trackgroup,
        status: 'ok'
      }
      await next()
    } catch (err) {
      console.error(err)
      ctx.throw(ctx.status, err.message)
    }
  }

  PUT.apiDoc = {
    operationId: 'updateTrackGroupCover',
    description: 'Add cover to trackgroup',
    summary: '',
    tags: ['trackgroups'],
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
