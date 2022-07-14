const { UserMeta } = require('../../../db/models')
const profileImage = require('../../../util/profile-image')
const numbro = require('numbro')
const { Op } = require('sequelize')

/**
 * Swagger client for user-api
 */
const SwaggerClient = require('swagger-client')

module.exports = function () {
  const operations = {
    GET: [
      findUserMeta,
      GET
    ]
  }

  // get old nickname
  async function findUserMeta (ctx, next) {
    try {
      const result = await UserMeta.findAll({
        attributes: ['meta_key', 'meta_value'],
        where: {
          user_id: ctx.profile.id,
          meta_key: {
            [Op.in]: ['nickname', 'description', 'country']
          }
        }
      })

      if (result) {
        const meta = result.reduce((obj, item) => {
          return {
            ...obj,
            [item.meta_key]: item.meta_value
          }
        }, {})

        ctx.profile.nickname = meta.nickname

        ctx.profile.meta = meta
      } else {
        ctx.profile.meta = {}
      }
    } catch (err) {}
  }

  async function GET (ctx, next) {
    try {
      // find persona usergroup
      const specUrl = new URL('/user/user.swaggeron', process.env.USER_API_HOST) // user-api swagger docs
      const client = await new SwaggerClient({
        url: specUrl.href,
        authorizations: {
          bearer: 'Bearer ' + ctx.accessToken
        }
      })

      let response = await client.apis.Usergroups.ResonateUser_ListUsersUserGroups({
        id: ctx.profile.userId
      })

      const { usergroup: usergroups } = response.body

      response = await client.apis.Users.ResonateUser_GetUserCredits({
        id: ctx.profile.userId
      })

      const avatar = await profileImage(ctx.profile.id)

      const data = Object.assign({}, ctx.profile, {
        token: ctx.accessToken,
        avatar: avatar,
        usergroups: usergroups,
        ownedGroups: usergroups, // compat
        credits: numbro(response.body.total).divide(1000).format({ mantissa: 4 })
      })

      ctx.body = {
        data,
        status: 'ok'
      }
    } catch (err) {
      ctx.status = err.status || 500
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

  return operations
}
