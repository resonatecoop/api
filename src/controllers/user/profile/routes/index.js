const { UserGroup, User, Role, OauthUser, Credit /* Resonate: sequelize */ } = require('../../../../db/models')
const profileImage = require('../../../../util/profile-image')
const gravatar = require('gravatar')
const authenticate = require('../../authenticate')

module.exports = function () {
  const operations = {
    GET: [authenticate, GET],
    PUT: [authenticate, PUT]
  }
  async function GET (ctx, next) {
    try {
      const result = await User.findOne({
        attributes: [
          'id',
          'displayName',
          'email',
          'country',
          'newsletterNotification'
          // 'role'
          // 'registered'
        ],
        where: {
          id: ctx.profile.id
        },
        include: [
          {
            model: Role,
            as: 'role'
          },
          {
            model: Credit,
            as: 'credit'
          },
          {
            model: UserGroup,
            as: 'user_groups'
          }
        ]
      })

      if (!result) {
        ctx.status = 404
        ctx.throw(ctx.status, 'Not found')
      }

      const { id, login, newsletterNotification, displayName, country, registered, email, role, credit, user_groups: userGroups } = result

      // FIXME: Just return the Sequelize response here
      const data = {
        nickname: displayName ?? email,
        token: ctx.accessToken, // for upload endpoint, may replace with upload specific token
        id,
        login,
        country,
        newsletterNotification,
        registered,
        email,
        role,
        credit: credit ?? { total: 0 },
        userGroups,
        gravatar: gravatar.url(email, { protocol: 'https' }),
        profiles: []
      }

      data.avatar = await profileImage(ctx.profile.id)

      ctx.body = {
        data,
        status: 'ok'
      }
    } catch (err) {
      console.error('err', err)
      ctx.status = err.status
      ctx.throw(ctx.status, err.message)
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
      if (body.email && body.email !== ctx.profile.email) {
        const oauthuser = await OauthUser.findOne({
          where: {
            username: body.email
          }
        })

        const user = await User.findOne({
          where: {
            email: body.email
          }
        })

        if (oauthuser || user) {
          ctx.status = 400
          ctx.throw(400, 'Email is already taken')
        }

        await OauthUser.update({
          username: body.email
        }, {
          where: {
            username: ctx.profile.email
          }
        })

        await User.update({
          email: body.email
        }, {
          where: {
            id: ctx.profile.id
          }
        })
      }

      ctx.body = {
        data: null,
        message: 'Profile data updated',
        status: 'ok'
      }
    } catch (err) {
      ctx.status = err.status
      ctx.throw(ctx.status, err.message)
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
        $ref: '#definitions/Profile'
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
