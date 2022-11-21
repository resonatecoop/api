const { Track } = require('../../../db/models')
const trackService = require('../services/trackService')
const { loadProfileIntoContext } = require('../../user/authenticate')

module.exports = function () {
  const operations = {
    GET: [loadProfileIntoContext, GET],
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

  async function GET (ctx, next) {
    if (await ctx.cashed?.()) return
    try {
      const result = await Track.scope('details', 'public', 'publicTrackgroup', { method: ['loggedIn', ctx.profile?.id] }).findOne({
        where: {
          id: ctx.params.id
        },
        attributes: [
          'id',
          'creatorId',
          'title',
          'url',
          'cover_art',
          'album',
          'status',
          'duration',
          'year'
        ]

      })

      if (!result) {
        ctx.status = 404
        ctx.throw(ctx.status, 'No track found')
      }

      ctx.body = {
        data: trackService(ctx).single(result)
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
