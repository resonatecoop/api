const { User, Artist } = require('../../../../../db/models')

module.exports = function () {
  const operations = {
    GET,
    PUT,
    DELETE,
    parameters: [
      {
        name: 'id',
        in: 'path',
        type: 'string',
        required: true,
        description: 'Artist id.',
        format: 'number'
      }
    ]
  }

  async function DELETE (ctx, next) {
    try {
      const result = await Artist.findOne({

        where: {
          userId: ctx.profile.id,
          id: ctx.params.id
        }
      })

      if (!result) {
        ctx.status = 404
        ctx.throw(ctx.status, 'Artist does not exist')
      }

      await Artist.destroy({
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
    tags: ['artists'],
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
      let result = await Artist.findOne({

        where: {
          userId: ctx.profile.id,
          id: ctx.params.id
        }
      })

      if (!result) {
        ctx.status = 404
        ctx.throw(ctx.status, 'Artist does not exist or does not belong to your user account')
      }

      result = await Artist.update(body, {
        where: {
          Artist: ctx.profile.id,
          id: ctx.params.id
        },
        returning: true
      })

      if (!result) {
        ctx.status = 404
        ctx.throw(ctx.status, 'Could not update')
      }

      result = await Artist.findOne({
        where: {
          creator_id: ctx.profile.id,
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
    tags: ['artists'],
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
      creator_id: ctx.profile.id,
      id: ctx.params.id
    }

    try {
      const result = await Artist.findOne({
        where,
        include: [
          {
            model: User,
            required: false,
            attributes: ['id', 'display_name'],
            as: 'user'
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
    tags: ['artists'],
    parameters: [
      {
        name: 'id',
        in: 'path',
        type: 'string',
        required: true,
        description: 'Artist id',
        format: 'number'
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
