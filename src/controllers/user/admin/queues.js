const Koa = require('koa')
const Roles = require('koa-roles')
const Router = require('@koa/router')
const koaBody = require('koa-body')
const Queue = require('bull')
const AJV = require('ajv')
const ajvKeywords = require('ajv-keywords')
const ajvFormats = require('ajv-formats')

const ms = require('ms')
const { REDIS_CONFIG } = require('../../../config/redis')

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
  required: ['name'],
  properties: {
    name: {
      type: 'string',
      enum: ['upload', 'cleanup']
    }
  }
})

const queueOptions = {
  redis: REDIS_CONFIG
}

const queues = new Koa()
const user = new Roles({
  async failureHandler (ctx, action) {
    ctx.status = 403

    ctx.body = {
      message: 'Access Denied - You don\'t have permission to: ' + action
    }
  }
})
const router = new Router()

queues.use(user.middleware())

user.use((ctx, action) => {
  return ctx.profile || action === 'access queues'
})

user.use((ctx, action) => {
  const allowed = ['superadmin']

  if (allowed.includes(ctx.profile.role)) {
    return true
  }
})

/**
 * WIP
 * Get queues data
 */

router.get('/', user.can('access queues'), async (ctx, next) => {
  const isValid = validateQuery(ctx.request.query)

  if (!isValid) {
    const { message, dataPath } = validateQuery.errors[0]
    ctx.status = 400
    ctx.throw(400, `${dataPath}: ${message}`)
  }

  try {
    const queue = Queue(ctx.query.name, queueOptions)
    ctx.body = await queue.getJobs()
  } catch (err) {
    ctx.throw(ctx.status, err.message)
  }

  await next()
})

router.post('/clean', user.can('access queues'), async (ctx, next) => {
  try {
    const queue = Queue(ctx.query.name, queueOptions)
    await queue.clean(ms('1d'))

    ctx.body = {
      status: 'ok'
    }
  } catch (err) {
    ctx.throw(ctx.status, err.message)
  }

  await next()
})

queues
  .use(koaBody())
  .use(router.routes())
  .use(router.allowedMethods({
    throw: true
  }))

module.exports = queues
