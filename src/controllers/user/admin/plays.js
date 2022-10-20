const AJV = require('ajv')
const ajvKeywords = require('ajv-keywords')
const ajvFormats = require('ajv-formats')

const Koa = require('koa')
const Roles = require('koa-roles')
const Router = require('@koa/router')

const { findAllPlayCounts } = require('../../../scripts/reports/plays')

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

  try {
    const res = await findAllPlayCounts(creatorId, periodStart, periodEnd, format, type)

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
