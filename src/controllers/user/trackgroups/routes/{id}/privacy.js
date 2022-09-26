// TODO this can be consolidated with ./settings.js

const { TrackGroup } = require('../../../../../db/models')
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

    try {
      await TrackGroup.update({
        private: body.private
      }, {
        where: {
          id: ctx.params.id,
          creator_id: ctx.profile.id,
          type: 'playlist'
        }
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
    operationId: 'updateTrackgroupPrivacy',
    description: 'Update trackgroup privacy setting',
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
