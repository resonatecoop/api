const AJV = require('ajv')
const ajvKeywords = require('ajv-keywords')
const ajvFormats = require('ajv-formats')

const Koa = require('koa')
const Roles = require('koa-roles')
const Router = require('@koa/router')
const koaBody = require('koa-body')
const { User, UserMeta, Resonate: sequelize } = require('../db/models')
const { Op } = require('sequelize')
const gravatar = require('gravatar')

const query = (query, values) => {
  return sequelize.query(query, {
    type: sequelize.QueryTypes.SELECT,
    replacements: values
  })
}

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
      enum: ['member']
    },
    order: {
      type: 'string',
      enum: ['registered', 'display_name']
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

const validateParams = new AJV({
  coerceTypes: true,
  allErrors: true,
  removeAdditional: true
}).compile({
  type: 'object',
  additionalProperties: false,
  properties: {
    id: {
      type: 'number',
      minimum: 1
    }
  }
})

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

user.use(async (ctx, action) => {
  return ctx.profile || action === 'access users'
})

user.use(async (ctx, action) => {
  const allowed = ['artist', 'label']

  if (action === 'access users' && allowed.includes(ctx.profile.role)) {
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
 * Only displays users which are referenced in user metas
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
      role,
      userId: ctx.profile.id
    }

    if (q) {
      parameters.q = '%' + q + '%'
    }

    const subQuery = sequelize.dialect.QueryGenerator.selectQuery('rsntr_usermeta', {
      attributes: [[sequelize.fn('DISTINCT', sequelize.col('user_id')), 'user_id']],
      where: {
        [Op.or]: [
          {
            [Op.and]: [
              {
                user_id: ctx.profile.id
              }
            ]
          },
          {
            [Op.and]: [
              {
                meta_value: ctx.profile.id
              },
              {
                meta_key: {
                  [Op.in]: ['mylabel']
                }
              }
            ]
          }
        ]
      }
    }).slice(0, -1)

    const count = (await query(`
      SELECT count(*) as count
      FROM rsntr_users AS u
      INNER JOIN rsntr_usermeta AS um ON (um.user_id = u.ID AND um.meta_key = 'nickname')
      INNER JOIN rsntr_usermeta AS um2 ON (um2.user_id = u.ID AND um2.meta_key = 'role' AND um2.meta_value IN('member', 'bands'))
      ${q ? 'WHERE u.id IN(SELECT ID from rsntr_users WHERE user_email LIKE :q OR user_login LIKE :q OR user_nicename LIKE :q OR display_name LIKE :q OR um.meta_value LIKE :q)' : ''}
      ${q ? 'AND' : 'WHERE'} u.ID IN (${subQuery})
      LIMIT 1
    `, parameters))[0].count

    const result = await query(`
      SELECT distinct u.ID as id, u.user_email as email, u.display_name, u.user_nicename, um.meta_value as nickname, um2.meta_value as role
      FROM rsntr_users AS u
      INNER JOIN rsntr_usermeta AS um ON (um.user_id = u.ID AND um.meta_key = 'nickname')
      INNER JOIN rsntr_usermeta AS um2 ON (um2.user_id = u.ID AND um2.meta_key = 'role' AND um2.meta_value IN('member', 'bands', 'label-owner'))
      ${q ? 'WHERE u.id IN(SELECT ID from rsntr_users WHERE user_email LIKE :q OR user_login LIKE :q OR user_nicename LIKE :q OR display_name LIKE :q OR um.meta_value LIKE :q)' : ''}
      ${q ? 'AND' : 'WHERE'} u.ID IN(${subQuery})
      LIMIT :limit
      OFFSET :offset
    `, parameters)

    ctx.body = {
      count: count,
      numberOfPages: Math.ceil(count / limit),
      data: result.map((item) => {
        const o = Object.assign(item, {
          gravatar: gravatar.url(item.email, { protocol: 'https' })
        })
        return o
      }),
      status: 'ok'
    }
  } catch (err) {
    ctx.throw(ctx.status, err.message)
  }

  await next()
})

router.get('/:id', user.can('access users'), async (ctx, next) => {
  const isValid = validateParams(ctx.params)

  if (!isValid) {
    const { message, dataPath } = validateParams.errors[0]
    ctx.status = 400
    ctx.throw(400, `${dataPath}: ${message}`)
  }

  try {
    const subQuery = sequelize.dialect.QueryGenerator.selectQuery('rsntr_usermeta', {
      attributes: [[sequelize.fn('DISTINCT', sequelize.col('user_id')), 'user_id']],
      where: {
        [Op.or]: [
          {
            [Op.and]: [
              {
                user_id: ctx.profile.id
              }
            ]
          },
          {
            [Op.and]: [
              {
                meta_value: ctx.profile.id
              },
              {
                meta_key: {
                  [Op.in]: ['mylabel']
                }
              }
            ]
          }
        ]
      }
    }).slice(0, -1)

    const result = await User.findOne({
      attributes: ['id', 'login', 'nicename', 'email', 'registered', 'display_name'],
      where: {
        id: ctx.params.id,
        [Op.and]: [
          {
            id: { [Op.in]: sequelize.literal('(' + subQuery + ')') }
          }
        ]
      },
      include: [
        {
          model: UserMeta,
          required: true,
          attributes: ['meta_key', 'meta_value'],
          as: 'meta',
          where: {
            meta_key: {
              [Op.in]: ['role', 'nickname', 'country', 'account_status']
            }
          }
        }
      ]
    })

    if (!result) {
      ctx.status = 404
      ctx.throw(ctx.status, 'User does not exist or is not associated to your account')
    }

    const { id, login, registered, email, meta } = result

    const metaData = Object.fromEntries(Object.entries(meta)
      .map(([key, value]) => {
        const metaKey = value.meta_key
        let metaValue = value.meta_value

        if (!isNaN(Number(metaValue))) {
          metaValue = Number(metaValue)
        }

        return [metaKey, metaValue]
      }))

    ctx.body = {
      data: Object.assign({}, metaData, { id, login, registered, email, gravatar: gravatar.url(email, { protocol: 'https' }) }),
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
