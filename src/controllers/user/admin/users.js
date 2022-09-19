const AJV = require('ajv')
const ajvKeywords = require('ajv-keywords')
const ajvFormats = require('ajv-formats')

const Koa = require('koa')
const Roles = require('koa-roles')
const Router = require('@koa/router')
const koaBody = require('koa-body')
const { User, Role } = require('../../../db/models')
// const { Op } = require('sequelize')
const profileImage = require('../../../util/profile-image')
const gravatar = require('gravatar')

// const query = (query, values) => {
//   return sequelize.query(query, {
//     type: sequelize.QueryTypes.SELECT,
//     replacements: values
//   })
// }

const ajv = new AJV({
  coerceTypes: true,
  allErrors: true,
  removeAdditional: true
})

ajvKeywords(ajv)
ajvFormats(ajv)

const validateQuery = ajv.compile({
  type: 'object',
  additionalProperties: false,
  properties: {
    sort: {
      type: 'string',
      enum: ['desc', 'asc']
    },
    role: {
      type: 'string',
      enum: ['admin', 'resonate-coop', 'bands', 'member', 'label-owner', 'listener', 'fans']
    },
    order: {
      type: 'string',
      enum: ['registered', 'displayName']
    },
    q: {
      type: 'string',
      minLength: 3
    },
    limit: {
      type: 'number',
      maximum: 100,
      minimum: 1
    },
    page: {
      type: 'number',
      minimum: 1
    }
  }
})

// const validateParams = new AJV({
//   coerceTypes: true,
//   allErrors: true,
//   removeAdditional: true
// }).compile({
//   type: 'object',
//   additionalProperties: false,
//   properties: {
//     id: {
//       type: 'number',
//       minimum: 1
//     }
//   }
// })

const users = new Koa()
const user = new Roles({
  async failureHandler (ctx, action) {
    ctx.status = 403

    ctx.body = {
      message: 'Access Denied - You don\'t have permission to: ' + action
    }
  }
})
const router = new Router()

users.use(user.middleware())

user.use((ctx, action) => {
  return ctx.profile || action === 'access users'
})

user.use('access users', async (ctx, action) => {
  const allowed = ['admin', 'superadmin']
  const role = await Role.findOne({
    where: {
      id: ctx.profile.roleId
    }
  })
  if (allowed.includes(role.name)) {
    return true
  }
})

user.use((ctx, action) => {
  const allowed = ['admin', 'superadmin']

  if (allowed.includes(ctx.profile.role)) {
    return true
  }
})

/**
 * Get users
 */

router.get('/', user.can('access users'), async (ctx, next) => {
  const isValid = validateQuery(ctx.request.query)

  if (!isValid) {
    const { message, dataPath } = validateQuery.errors[0]
    ctx.status = 400
    ctx.throw(400, `${dataPath}: ${message}`)
  }

  const { limit = 20, page = 1, q, role } = ctx.request.query

  try {
    const parameters = {
      limit,
      offset: page > 1 ? (page - 1) * limit : 0,
      role
    }

    if (q) {
      parameters.q = '%' + q + '%'
    }

    const { rows: result, count } = await User.findAndCountAll({
      limit,
      attributes: ['id', 'displayName', 'email', 'emailConfirmed', 'country', 'fullName', 'member'],
      order: [['displayName', 'asc']],
      offset: page > 1 ? (page - 1) * limit : 0,
      include: [
        {
          model: Role,
          as: 'role'
        }
      ]
    })

    // const count = (await query(`
    //   SELECT count(*) as count
    //   FROM rsntr_users AS u
    //   INNER JOIN rsntr_usermeta AS um ON (um.user_id = u.ID AND um.meta_key = 'nickname')
    //   INNER JOIN rsntr_usermeta AS um2 ON (um2.user_id = u.ID AND um2.meta_key = 'role' ${role ? 'AND um2.meta_value = :role' : ''})
    //   ${q ? 'WHERE user_email LIKE :q OR user_login LIKE :q OR user_nicename LIKE :q OR display_name LIKE :q' : ''}
    //   LIMIT 1
    // `, parameters))[0].count

    // const result = await query(`
    //   SELECT distinct u.ID as id, u.user_registered as date, u.user_email as email, u.display_name, u.user_nicename, um.meta_value as nickname, um2.meta_value as role
    //   FROM rsntr_users AS u
    //   INNER JOIN rsntr_usermeta AS um ON (um.user_id = u.ID AND um.meta_key = 'nickname')
    //   INNER JOIN rsntr_usermeta AS um2 ON (um2.user_id = u.ID AND um2.meta_key = 'role' ${role ? 'AND um2.meta_value = :role' : ''})
    //   ${q ? 'WHERE user_email LIKE :q OR user_login LIKE :q OR user_nicename LIKE :q OR display_name LIKE :q OR um.meta_value LIKE :q' : ''}
    //   ORDER BY u.user_registered DESC
    //   LIMIT :limit
    //   OFFSET :offset
    // `, parameters)

    ctx.body = {
      count: count,
      numberOfPages: Math.ceil(count / limit),
      data: result,
      status: 'ok'
    }
  } catch (err) {
    ctx.throw(ctx.status, err.message)
  }

  await next()
})

router.get('/:id', user.can('access users'), async (ctx, next) => {
  // const isValid = validateParams(ctx.params)

  // if (!isValid) {
  //   const { message, dataPath } = validateParams.errors[0]
  //   ctx.status = 400
  //   ctx.throw(400, `${dataPath}: ${message}`)
  // }

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
        // {
        //   model: UserMeta,
        //   required: true,
        //   attributes: ['meta_key', 'meta_value'],
        //   as: 'meta',
        //   where: {
        //     meta_key: {
        //       [Op.in]: ['role', 'nickname', 'country', 'account_status']
        //     }
        //   }
        // }
      ]
    })

    // const { id, login, registered, email, meta } = result

    // const metaData = Object.fromEntries(Object.entries(meta)
    //   .map(([key, value]) => {
    //     const metaKey = value.meta_key
    //     let metaValue = value.meta_value

    //     if (!isNaN(Number(metaValue))) {
    //       metaValue = Number(metaValue)
    //     }

    //     return [metaKey, metaValue]
    //   }))

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
})

users
  .use(koaBody())
  .use(router.routes())
  .use(router.allowedMethods({
    throw: true
  }))

module.exports = users
