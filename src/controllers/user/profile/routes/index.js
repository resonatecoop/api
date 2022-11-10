const { User } = require('../../../../db/models')
const profileImage = require('../../../../util/profile-image')
const gravatar = require('gravatar')
const { authenticate } = require('../../authenticate')

module.exports = function () {
  const operations = {
    GET: [authenticate, GET],
    PUT: [authenticate, PUT]
  }
  async function GET (ctx, next) {
    try {
      const result = await User.scope('defaultScope', 'profile').findOne({
        where: {
          id: ctx.profile.id
        }
      })

      if (!result) {
        ctx.status = 404
        ctx.throw(ctx.status, 'Not found')
      }

      // FIXME: use a profileService
      const data = {
        ...result.get(),
        nickname: result.displayName ?? result.email,
        credit: result.credit ?? { total: 0 },
        gravatar: gravatar.url(result.email, { protocol: 'https' })
      }

      data.avatar = await profileImage(ctx.profile.id)

      ctx.body = {
        data,
        status: 'ok'
      }
    } catch (err) {
      console.error('err', err)
      ctx.throw(500, err.message)
    }

    await next()
  }

  GET.apiDoc = {
    operationId: 'getUserProfile',
    description: 'Returns user profile',
    summary: 'Find user profile',
    tags: ['profile'],
    produces: [
      'application/json'
    ],
    responses: {
      400: {
        description: 'Bad request',
        schema: {
          $ref: '#/responses/BadRequest'
        }
      },
      404: {
        description: 'Not found',
        schema: {
          $ref: '#/responses/NotFound'
        }
      },
      default: {
        description: 'error payload',
        schema: {
          $ref: '#/definitions/Error'
        }
      }
    }
  }

  async function PUT (ctx, next) {
    const body = ctx.request.body

    try {
      const user = await User.scope('defaultScope', 'profile').findOne({
        where: {
          id: ctx.profile.id
        }
      })

      if (!user) {
        ctx.status = 404
        ctx.throw(404, 'Something weird happened')
      }

      await user.update(body)

      const scopedUser = await User.scope('defaultScope', 'profile').findOne({
        where: {
          id: user.id
        }
      })

      // FIXME: use a profileService
      ctx.body = {
        data: scopedUser.get(),
        message: 'Profile data updated',
        status: 'ok'
      }
    } catch (err) {
      console.error(err)
      ctx.throw(500, err.message)
    }

    await next()
  }

  PUT.apiDoc = {
    operationId: 'updateProfile',
    description: 'Update profile',
    summary: 'Update user profile',
    tags: ['profile'],
    parameters: [{
      in: 'body',
      name: 'profile',
      description: 'The user\'s profile',
      schema: {
        $ref: '#/definitions/ProfileUpdate'
      }
    }],
    responses: {
      200: {
        description: 'Profile updated response',
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

  return operations
}
