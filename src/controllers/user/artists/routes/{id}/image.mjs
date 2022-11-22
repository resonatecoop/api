
import db from '../../../../../db/models/index.js'
import { processFile } from '../../../../../util/process-file.js'
import artistService from '../../../../artists/artistService.js'
import { authenticate } from '../../../authenticate.js'

const { UserGroup, File } = db

export default function () {
  const operations = { PUT: [authenticate, PUT] }

  async function PUT (ctx, next) {
    try {
      const file = ctx.request.files.file
      // TODO: Remove prior files
      const { imageType, id } = ctx.request.params
      if (!['avatar', 'banner'].includes(imageType)) {
        ctx.status = 400
        ctx.throw(ctx.status, 'Invalid image type')
      }
      ctx.request.body.config = imageType
      const data = Array.isArray(file)
        ? await Promise.all(file.map(processFile(ctx)))
        : await processFile(ctx)(file)

      const artist = await UserGroup.findOne({
        where: { id }
      })

      await File.destroy({ where: { id: artist.banner } })

      artist.set(imageType, data.filename)
      await artist.save()
      await artist.reload()
      ctx.body = {
        data: await artistService(ctx).single(artist),
        status: 'ok'
      }
      await next()
    } catch (err) {
      ctx.status = 500
      ctx.throw(ctx.status, err.message)
    }
  }

  PUT.apiDoc = {
    operationId: 'updateArtistImage',
    description: 'Update an avatar or a banner for on artist',
    summary: '',
    tags: ['artist'],
    parameters: [
      {
        name: 'id',
        in: 'path',
        type: 'string',
        required: true,
        description: 'Artist uuid',
        format: 'uuid'
      }, {
        name: 'imageType',
        in: 'path',
        type: 'string',
        required: true,
        description: 'avatar or banner'
      }
    ],
    responses: {
      200: {
        description: 'The updated artist',
        schema: {
          $ref: '#/definitions/Artist'
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
