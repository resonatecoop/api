const { User } = require('../../../../db/models')
const profileImage = require('../../../../util/profile-image')
const gravatar = require('gravatar')
const { authenticate } = require('../../authenticate')
const { omit } = require('lodash')
const { v4: uuidv4 } = require('uuid')
const sendMail = require('../../../../jobs/send-mail')

const profileService = ctx => {
  return {
    single: async (user) => {
      const aYearAgo = new Date()
      aYearAgo.setFullYear(aYearAgo.getFullYear() - 1)

      const data = {
        ...user,
        credit: user.credit ?? { total: 0 },
        isListenerMember: !!user.memberships?.find(
          (m) => m.class.name === 'Listener' &&
            new Date(m.updatedAt).getTime() > aYearAgo.getTime()
        ),
        gravatar: gravatar.url(user.email, { protocol: 'https' })
      }

      data.isMusicMember = !!user.userGroups?.find(ug => ug.trackgroups?.length)

      data.avatar = await profileImage(ctx.profile.id)
      return data
    }
  }
}

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

      ctx.body = {
        data: await profileService(ctx).single(result.get({ plain: true })),
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
        },
        attributes: ['password']
      })

      if (!user) {
        ctx.status = 404
        ctx.throw(404, 'User not found')
      }

      await user.update(omit(body, 'email', 'password'))

      if (body.email !== user.email) {
        if (!body.password) {
          ctx.status = 400
          ctx.throw(ctx.status, 'Changing the e-mail requires the password')
        }
        const passwordOkay = await User.checkPassword({
          hash: user.password,
          password: body.password
        })
        if (!passwordOkay) {
          ctx.status = 401
          ctx.throw(ctx.status, 'Permission denied')
        }

        const date = new Date()
        date.setMinutes(date.getMinutes() + 20)

        user.email = body.email
        user.emailConfirmed = false
        user.emailConfirmationToken = uuidv4()
        user.emailConfirmationExpiration = date.toISOString()

        await user.save()

        try {
          await sendMail({
            data: {
              template: 'email-confirmation',
              message: {
                to: user.email
              },
              locals: {
                user: user,
                host: process.env.APP_HOST
              }
            }
          })
        } catch (e) {
          console.error(e)
        }
      }

      const scopedUser = await User.scope('defaultScope', 'profile').findOne({
        where: {
          id: user.id
        }
      })

      ctx.body = {
        data: await profileService(ctx).single(scopedUser.get({ plain: true })),
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
