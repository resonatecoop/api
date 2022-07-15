const AJV = require('ajv')
const ajvKeywords = require('ajv-keywords')
const ajvFormats = require('ajv-formats')

const Koa = require('koa')
const Roles = require('koa-roles')
const Router = require('@koa/router')
const { User, UserMeta } = require('../../db/models')
const { Op } = require('sequelize')
const { findAllPlayCounts } = require('../../scripts/reports/plays')

const ajv = new AJV({
  allErrors: true,
  coerceTypes: true,
  removeAdditional: true
})

ajvKeywords(ajv)
ajvFormats(ajv)

const validate = ajv.compile({
  type: 'object',
  additionalProperties: false,
  properties: {
    creator_id: {
      type: 'number',
      minimum: 1
    },
    type: {
      type: 'string',
      enum: ['free', 'paid']
    },
    period: {
      type: 'string',
      enum: ['yearly', 'daily', 'monthly']
    },
    from: {
      type: 'string',
      format: 'date'
    },
    to: {
      type: 'string',
      format: 'date'
    }
  }
})

const user = new Roles()
const router = new Router()
const plays = new Koa()

user.use((ctx, action) => {
  return ctx.profile || action === 'access plays'
})

user.use((ctx, action) => {
  const allowed = ['admin', 'superadmin']

  if (allowed.includes(ctx.profile.role)) {
    return true
  }
})

router.get('/', user.can('access plays'), async (ctx, next) => {
  const query = ctx.request.query
  const isValid = validate(query)

  if (!isValid) {
    const { message, dataPath } = validate.errors[0]
    ctx.status = 400
    ctx.throw(400, `${dataPath}: ${message}`)
  }

  const period = query.period || 'monthly'
  const format = {
    yearly: '%Y',
    monthly: '%Y-%m',
    daily: '%Y-%m-%d'
  }[period]

  const periodStart = query.from || '2019-01-01'
  const periodEnd = query.to || '2020-01-01'
  const type = query.type || 'paid'
  const creatorId = query.creator_id

  const user = await User.findOne({
    attributes: [
      'id',
      'login',
      'email',
      'registered'
    ],
    where: {
      id: creatorId
    },
    include: [
      {
        model: UserMeta,
        as: 'meta',
        required: true,
        attributes: ['meta_key', 'meta_value'],
        where: {
          meta_key: {
            [Op.in]: ['role']
          }
        }
      }
    ]
  })

  const { role: umRole } = Object.fromEntries(Object.entries(user.meta)
    .map(([key, value]) => {
      const metaKey = value.meta_key
      let metaValue = value.meta_value

      if (!isNaN(Number(metaValue))) {
        metaValue = Number(metaValue)
      }

      return [metaKey, metaValue]
    }))

  const isLabel = umRole.replace('um_', '') === 'label-owner'

  try {
    const res = await findAllPlayCounts(creatorId, periodStart, periodEnd, format, type, isLabel)

    ctx.body = {
      data: res
    }
  } catch (err) {
    ctx.throw(ctx.status, err.message)
  }

  await next()
})

plays
  .use(router.routes())
  .use(router.allowedMethods({
    throw: true
  }))

module.exports = plays
