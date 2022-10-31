
// const koaBody = require('koa-body')
const { User, Role } = require('../../../../db/models')
// const { Op } = require('sequelize')
const profileImage = require('../../../../util/profile-image')
const gravatar = require('gravatar')
const { authenticate, hasAccess } = require('../../authenticate')

module.exports = function () {
  const operations = {
    GET: [authenticate, hasAccess('admin'), GET],
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

  async function GET (ctx, next) {
    try {
      const result = await User.findOne({
        attributes: ['id', 'displayName', 'email', 'emailConfirmed', 'country', 'fullName', 'member'],
        where: {
          id: ctx.params.id
        },
        include: [
          {
            model: Role,
            as: 'role'
          }
        ]
      })

      const user = result.get({ plain: true })

      const avatar = await profileImage(user.id)

      const data = Object.assign(user, {

        avatar,
        gravatar: gravatar.url(user.email, { protocol: 'https' })
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
    operationId: 'getUsersThroughAdminById',
    description: 'Returns a single user',
    tags: ['admin'],
    parameters: [
      {
        name: 'id',
        in: 'path',
        type: 'string',
        required: true,
        description: 'User id',
        format: 'uuid'
      }
    ],
    responses: {
      200: {
        description: 'The requested user.',
        schema: {
          type: 'object'
        }
      },
      404: {
        description: 'No user found.'
      },
      default: {
        description: 'Unexpected error',
        schema: {
          $ref: '#/definitions/Error'
        }
      }
    }
  }

  // TODO: PUT operation to update users

  return operations
}
