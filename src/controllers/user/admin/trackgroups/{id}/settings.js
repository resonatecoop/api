
const { TrackGroup } = require('../../../../../db/models')
const { authenticate, hasAccess } = require('../../../authenticate')

// TODO: is this unnecesary on top of the normal PUT?
module.exports = function () {
  const operations = {
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

  // FIXME: document
  async function PUT (ctx, next) {
    const body = ctx.request.body

    try {
      await TrackGroup.update(body, {
        where: {
          id: ctx.params.id
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

  return operations
}
