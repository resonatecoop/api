
const { Playlist } = require('../../../../../db/models')
const { processFile } = require('../../../../../util/process-file')
const authenticate = require('../../../authenticate')

module.exports = function () {
  const operations = { PUT: [authenticate, PUT] }

  async function PUT (ctx, next) {
    try {
      const file = ctx.request.files.file
      // TODO: Remove prior files
      const data = Array.isArray(file)
        ? await Promise.all(file.map(processFile(ctx)))
        : await processFile(ctx)(file)

      const trackgroup = await Playlist.findOne({ where: { id: ctx.request.params.id } })
      trackgroup.set('cover', data.filename)
      await trackgroup.save()
      await trackgroup.reload()
      ctx.body = {
        data: trackgroup,
        status: 'ok'
      }
      await next()
    } catch (err) {
      ctx.throw(ctx.status, err.message)
    }
  }

  PUT.apiDoc = {
    operationId: 'updatePlaylistCover',
    description: 'Add cover to playlist',
    summary: '',
    tags: ['playlists'],
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
        description: 'The updated playlist',
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
