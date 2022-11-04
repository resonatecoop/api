const Koa = require('koa')
const AJV = require('ajv')
const ajvKeywords = require('ajv-keywords')
const ajvFormats = require('ajv-formats')

const Roles = require('koa-roles')
const Router = require('@koa/router')
const koaBody = require('koa-body')
const Queue = require('bull')
const { findOneArtistEarnings } = require('../scripts/reports/earnings')
const createReportJob = require('../jobs/create-report')
const winston = require('winston')
const { REDIS_CONFIG } = require('../../config/redis')

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'reporter' },
  transports: [
    new winston.transports.Console({
      level: 'debug',
      format: winston.format.simple()
    }),
    new winston.transports.File({
      filename: 'error.log',
      level: 'error'
    })
  ]
})

const queueOptions = {
  redis: REDIS_CONFIG
}
const createReport = new Queue('create-report', queueOptions)

createReport.process(createReportJob)

const earnings = new Koa()
const user = new Roles()
const router = new Router()

const ajv = new AJV({
  allErrors: true,
  removeAdditional: true
})

ajvKeywords(ajv)
ajvFormats(ajv)

const DateRange = {
  type: 'object',
  properties: {
    from: {
      type: 'string',
      format: 'date'
    },
    to: {
      type: 'string',
      format: 'date'
    }
  }
}

const validate = ajv.compile({
  type: 'object',
  additionalProperties: false,
  properties: {
    date: DateRange,
    email: {
      type: 'string',
      format: 'email'
    },
    period: {
      type: 'string',
      enum: ['yearly', 'daily', 'monthly']
    }
  }
})

user.use((ctx, action) => {
  return ctx.profile || action === 'access earnings'
})

user.use('access earnings', (ctx, action) => {
  const allowed = ['artist', 'label']

  if (allowed.includes(ctx.profile.role)) {
    return true
  }
})

user.use((ctx, action) => {
  const allowed = ['admin', 'superadmin']

  if (allowed.includes(ctx.profile.role)) {
    return true
  }
})

router.post('/', user.can('access earnings'), async (ctx, next) => {
  const body = ctx.request.body
  const isValid = validate(body)

  if (!isValid) {
    const { message, dataPath } = validate.errors[0]
    ctx.status = 400
    ctx.throw(400, `${dataPath}: ${message}`)
  }

  try {
    const { from: periodStart, to: periodEnd } = body.date
    const { period, email } = body
    const format = {
      yearly: '%Y',
      monthly: '%Y-%m',
      daily: '%Y-%m-%d'
    }[period]

    if (email) {
      createReport.add({
        profile: ctx.profile,
        id: ctx.profile.id,
        email,
        format,
        from: periodStart,
        to: periodEnd
      })

      ctx.status = 202
      ctx.body = {
        data: {},
        message: 'You should receive an email with the reports shortly'
      }
    } else {
      const { report, sums } = await findOneArtistEarnings(periodStart, periodEnd, ctx.profile.id)

      logger.info(`got a total of ${report.length} tracks`)

      ctx.body = {
        status: 'ok',
        data: report,
        stats: {
          sums: sums
        }
      }
    }
  } catch (err) {
    ctx.throw(ctx.status, err.message)
  }

  await next()
})

earnings
  .use(koaBody())
  .use(router.routes())
  .use(router.allowedMethods({
    throw: true
  }))

module.exports = earnings
