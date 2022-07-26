const { UserMeta, User, OauthUser, Resonate: sequelize } = require('../../../db/models')
const profileImage = require('../../../util/profile-image')
const { Op } = require('sequelize')
const gravatar = require('gravatar')
const queryBuilder = require('../../../util/query')

const query = queryBuilder(sequelize)

module.exports = function () {
  const operations = {
    GET: [
      findUserMeta,
      GET
    ],
    PUT
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
      const result = await User.findOne({
        attributes: [
          'id',
          'displayName',
          'email'
          // 'registered'
        ],
        where: {
          id: ctx.profile.id
        /*
        '$meta.meta_value$': {
          [Op.in]: ['member', 'listener', 'admin']
        }
        */
        },
        include: [
          {
            model: UserMeta,
            as: 'UserMeta',
            required: true,
            attributes: ['meta_key', 'meta_value'],
            where: {
              meta_key: {
                [Op.in]: ['role', 'nickname', 'mylabel', 'mybands']
              }
            }
          }
        ]
      })

      if (!result) {
        ctx.status = 404
        ctx.throw(ctx.status, 'Not found')
      }

      const { id, login, registered, email, meta } = result

      const { role: umRole, mylabel, mybands, nickname } = Object.fromEntries(Object.entries(meta)
        .map(([key, value]) => {
          const metaKey = value.meta_key
          let metaValue = value.meta_value

          if (!isNaN(Number(metaValue))) {
            metaValue = Number(metaValue)
          }

          return [metaKey, metaValue]
        }))

      const data = {
        role: umRole.replace('um_', ''),
        nickname,
        token: ctx.accessToken, // for upload endpoint, may replace with upload specific token
        id,
        login,
        registered,
        email,
        gravatar: gravatar.url(email, { protocol: 'https' }),
        profiles: []
      }

      data.avatar = await profileImage(ctx.profile.id)

      if (data.role === 'bands') {
      // fetch band members
        const result = await query(`
        SELECT distinct u.ID as id, um.meta_value as nickname, um2.meta_value as role
        FROM rsntr_users AS u
        INNER JOIN rsntr_usermeta AS um ON (um.user_id = u.ID AND um.meta_key = 'nickname')
        INNER JOIN rsntr_usermeta AS um2 ON (um2.user_id = u.ID AND um2.meta_key = 'role' AND um2.meta_value = :role)
        WHERE u.ID IN (SELECT user_id FROM rsntr_usermeta WHERE meta_key = 'mybands' AND meta_value = :bandId)
        LIMIT :limit
      `, { bandId: id, limit: 20, role: 'member' })

        data.profiles = data.profiles.concat(result)
      }

      if (data.role === 'label-owner') {
      // fetch first 20 artists and bands
        const result = await query(`
        SELECT distinct u.ID as id, um.meta_value as nickname, um2.meta_value as role
        FROM rsntr_users AS u
        INNER JOIN rsntr_usermeta AS um ON (um.user_id = u.ID AND um.meta_key = 'nickname')
        INNER JOIN rsntr_usermeta AS um2 ON (um2.user_id = u.ID AND um2.meta_key = 'role' AND um2.meta_value IN('member', 'bands'))
        WHERE u.ID IN (SELECT user_id FROM rsntr_usermeta WHERE meta_key = 'mylabel' AND meta_value = :labelId)
        LIMIT :limit
      `, { labelId: id, limit: 20 })

        data.profiles = data.profiles.concat(result)
      }

      if (mylabel) {
        const label = await User.findOne({
          attributes: [
            'id'
          ],
          where: {
            id: mylabel
          },
          include: [
            {
              model: UserMeta,
              as: 'meta',
              required: true,
              attributes: ['meta_key', 'meta_value'],
              where: {
                meta_key: {
                  [Op.in]: ['displayName', 'role']
                }
              }
            }
          ]
        })

        data.profiles.push(label)
      }

      if (mybands) {
        const band = await User.findOne({
          attributes: [
            'id'
          ],
          where: {
            id: mybands
          },
          include: [
            {
              model: UserMeta,
              as: 'meta',
              required: true,
              attributes: ['meta_key', 'meta_value'],
              where: {
                meta_key: {
                  [Op.in]: ['nickname', 'role']
                }
              }
            }
          ]
        })

        data.profiles.push(band)
      }

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

      if (body.nickname) {
        await UserMeta.update({
          meta_value: body.nickname
        }, {
          where: {
            meta_key: 'nickname',
            user_id: ctx.profile.id
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
