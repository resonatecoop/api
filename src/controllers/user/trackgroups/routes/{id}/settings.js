// TODO this can be consolidated with ./privacy.js
const { TrackGroup } = require('../../../../db/models')
const authenticate = require('../../../authenticate')

module.exports = function () {
  const operations = {
    PUT: [authenticate, PUT],
    parameters: [
      {
        name: 'id',
        in: 'path',
        type: 'string',
        required: true,
        description: 'Trackgroup uuid.',
        format: 'uuid'
      }
    ]
  }

  async function PUT (ctx, next) {
    const body = ctx.request.body

    const where = {
      id: ctx.params.id
    }

    if (!body.creator_id) {
      where.creator_id = ctx.profile.id
    }

    try {
      await TrackGroup.update(body, {
        where
      })

      ctx.body = {
        data: null,
        status: 'ok'
      }
    } catch (err) {
      ctx.throw(ctx.status, err.message)
    }

    await next()
  }

  PUT.apiDoc = {
    operationId: 'updateTrackgroupSettings',
    description: 'Update download and privacy of trackgroup',
    summary: '',
    tags: ['trackgroups'],
    parameters: [
      {
        name: 'id',
        in: 'path',
        type: 'string',
        required: true,
        description: 'Trackgroup uuid',
        format: 'uuid'
      },
      {
        in: 'body',
        name: 'trackgroupPrivacy',
        schema: {
          type: 'object',
          additionalProperties: false,
          required: ['private'],
          properties: {
            private: {
              type: 'boolean',
              default: true
            }
          }
        }
      },
      {
        in: 'body',
        name: 'trackgroupDownload',
        schema: {
          type: 'object',
          additionalProperties: false,
          required: ['download'],
          properties: {
            download: {
              type: 'boolean',
              default: true
            }
          }
        }
      }
    ],
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
