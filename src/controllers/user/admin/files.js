const Koa = require('koa')
const AJV = require('ajv')
const ajvKeywords = require('ajv-keywords')
const ajvFormats = require('ajv-formats')

const Roles = require('koa-roles')
const Router = require('@koa/router')
const koaBody = require('koa-body')
const { File } = require('../../../db/models')

const ajv = new AJV({
  allErrors: true,
  removeAdditional: true
})

ajvKeywords(ajv)
ajvFormats(ajv)

const validate = ajv.compile({
  type: 'object',
  additionalProperties: false,
  properties: {
    filename: {
      type: 'string'
    },
    owner_id: {
      type: 'number',
      minimum: 1
    }
  }
})

const validateQuery = ajv.compile({
  type: 'object',
  additionalProperties: false,
  properties: {
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

const files = new Koa()
const user = new Roles({
  async failureHandler (ctx, action) {
    ctx.status = 403

    ctx.body = {
      message: 'Access Denied - You don\'t have permission to: ' + action
    }
  }
})
const router = new Router()

files.use(user.middleware())

user.use((ctx, action) => {
  return ctx.profile || action === 'access files'
})

user.use((ctx, action) => {
  const allowed = ['admin', 'superadmin']

  if (allowed.includes(ctx.profile.role)) {
    return true
  }
})

router.get('/', user.can('access files'), async (ctx, next) => {
  const isValid = validateQuery(ctx.request.query)

  if (!isValid) {
    const { message, dataPath } = validateQuery.errors[0]
    ctx.status = 400
    ctx.throw(400, `${dataPath}: ${message}`)
  }

  const { limit = 100, page = 1 } = ctx.request.query

  try {
    const { rows: result, count } = await File.findAndCountAll({
      limit,
      offset: page > 1 ? page * limit : 0
    })

    ctx.body = {
      data: result,
      count: count,
      numberOfPages: Math.ceil(count / limit),
      status: 'ok'
    }
  } catch (err) {
    ctx.throw(ctx.status, err.message)
  }

  await next()
})

router.put('/:id', user.can('access files'), async (ctx, next) => {
  const body = ctx.request.body
  const isValid = validate(body)

  if (!isValid) {
    const { message, dataPath } = validate.errors[0]
    ctx.status = 400
    ctx.throw(400, `${dataPath}: ${message}`)
  }

  try {
    const result = await File.update(body, {
      where: {
        id: ctx.params.id
      },
      returning: true,
      plain: true
    })

    ctx.status = 201
    ctx.body = {
      data: result,
      status: 'ok'
    }
  } catch (err) {
    ctx.throw(ctx.status, err.message)
  }

  await next()
})

files
  .use(koaBody())
  .use(router.routes())
  .use(router.allowedMethods({
    throw: true
  }))

module.exports = files
