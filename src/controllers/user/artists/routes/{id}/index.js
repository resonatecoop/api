const { User, UserGroup } = require('../../../../../db/models')
const { authenticate } = require('../../../authenticate')

module.exports = function () {
  const operations = {
    GET: [authenticate, GET],
    PUT: [authenticate, PUT],
    DELETE: [authenticate, DELETE],
    parameters: [
      {
        name: 'id',
        in: 'path',
        type: 'string',
        required: true,
        description: 'Artist id.',
        format: 'uuid'
      }
    ]
  }

  async function DELETE (ctx, next) {
    try {
      const result = await UserGroup.findOne({

        where: {
          userId: ctx.profile.id,
          id: ctx.params.id
        }
      })

      if (!result) {
        ctx.status = 404
        ctx.throw(ctx.status, 'Artist does not exist')
      }

      await UserGroup.destroy({
        where: {
          creator_id: ctx.profile.id,
          id: ctx.params.id
        }
      })

      ctx.body = {
        data: null,
        message: 'Artist was removed'
      }
    } catch (err) {
      ctx.throw(ctx.status, err.message)
    }

    await next()
  }

  DELETE.apiDoc = {
    operationId: 'deleteArtist',
    description: 'Delete artist',
    tags: ['user'],
    responses: {
      200: {
        description: 'Artist deleted response.',
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

  async function PUT (ctx, next) {
    const body = ctx.request.body

    try {
      let result = await UserGroup.findOne({

        where: {
          userId: ctx.profile.id,
          id: ctx.params.id
        }
      })

      if (!result) {
        ctx.status = 404
        ctx.throw(ctx.status, 'Artist does not exist or does not belong to your user account')
      }

      result = await UserGroup.update(body, {
        where: {
          ownerId: ctx.profile.id,
          id: ctx.params.id
        },
        returning: true
      })

      if (!result) {
        ctx.status = 404
        ctx.throw(ctx.status, 'Could not update')
      }

      result = await UserGroup.findOne({
        where: {
          ownerId: ctx.profile.id,
          id: ctx.params.id
        }
      })

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
    operationId: 'updateArtist',
    description: 'Update artist',
    tags: ['user'],
    parameters: [
      {
        in: 'body',
        name: 'artist',
        description: 'The artist to update.',
        schema: {
          $ref: '#/definitions/Artist'
        }
      }
    ],
    responses: {
      200: {
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

  async function GET (ctx, next) {
    const where = {
      ownerId: ctx.profile.id,
      id: ctx.params.id
    }

    try {
      const result = await UserGroup.findOne({
        where,
        include: [
          {
            model: User,
            required: false,
            attributes: ['id', 'displayName'],
            as: 'owner'
          }
        ]
      })

      if (!result) {
        ctx.status = 404
        ctx.throw(ctx.status, 'Artist does not exist')
      }

      const data = result.get({
        plain: true
      })

      ctx.body = {
        data,
        status: 'ok'
      }
    } catch (err) {
      ctx.throw(ctx.status, err.message)
    }

    await next()
  }

  GET.apiDoc = {
    operationId: 'getArtist',
    description: 'Returns a single artist',
    tags: ['user'],
    parameters: [
      {
        name: 'id',
        in: 'path',
        type: 'string',
        required: true,
        description: 'Artist id',
        format: 'uuid'
      }
    ],
    responses: {
      200: {
        description: 'The requested artist.',
        schema: {
          type: 'object'
        }
      },
      404: {
        description: 'No artist found.'
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
