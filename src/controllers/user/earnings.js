const Koa = require('koa')
const AJV = require('ajv')
const ajvKeywords = require('ajv-keywords')
const ajvFormats = require('ajv-formats')

const Roles = require('koa-roles')
const Router = require('@koa/router')
const koaBody = require('koa-body')
const Queue = require('bull')
const { findOneArtistEarnings, findOneArtistEarningsByDate } = require('../scripts/reports/earnings')
const createReportJob = require('../jobs/create-report')
const winston = require('winston')
const decodeUriComponent = require('decode-uri-component')
const numbro = require('numbro')
const { REDIS_CONFIG } = require('../../config/redis')

const sum = (a, b) => numbro(a).add(b).value()
const divide = (a, b) => numbro(a).divide(b).value()

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
      const isLabel = ctx.profile.role === 'label-owner'
      const report = format
        ? await findOneArtistEarningsByDate(periodStart, periodEnd, ctx.profile.id, format, isLabel)
        : await findOneArtistEarnings(periodStart, periodEnd, ctx.profile.id, isLabel)

      const data = report.flat(1)

      const result = []

      let sums = {
        artist_total: 0,
        artist_total_eur: 0,
        resonate_total: 0,
        resonate_total_eur: 0
      }

      if (data.length) {
        data.reduce((res, value, index, array) => {
          let ref

          if (value.d) {
            ref = value.d
          } else {
            ref = value.track_id
          }

          if (value.d && !res[value.d]) {
            res[value.d] = {
              avg: 0,
              plays: 0,
              date: value.d,
              resonate_total: 0,
              resonate_total_eur: 0,
              artist_total: 0,
              artist_total_eur: 0,
              earned: 0
            }

            result.push(res[value.d])
          }

          if (!value.d && !res[value.track_id]) {
            res[value.track_id] = {
              track_id: value.track_id,
              avg: 0,
              plays: 0,
              resonate_total: 0,
              resonate_total_eur: 0,
              artist_total: 0,
              artist_total_eur: 0,
              earned: 0
            }

            if (value.artist_id) {
              res[value.track_id].artist_id = value.artist_id
            }

            if (value.label) {
              res[value.track_id].label = value.label
            }

            if (value.artist) {
              res[value.track_id].artist = value.artist
            }

            if (value.track_album) {
              res[value.track_id].track_album = decodeUriComponent(value.track_album)
            }

            if (value.track_title) {
              res[value.track_id].track_title = decodeUriComponent(value.track_title)
            }

            result.push(res[value.track_id])
          }

          // sum plays
          res[ref].plays = sum(res[ref].plays, value.plays)

          // sum resonate share
          res[ref].resonate_total = sum(res[ref].resonate_total, value.resonate_total)
          res[ref].resonate_total_eur = sum(res[ref].resonate_total_eur, value.resonate_total_eur)

          // sum artist share
          res[ref].artist_total = sum(res[ref].artist_total, value.artist_total)
          res[ref].artist_total_eur = sum(res[ref].artist_total_eur, value.artist_total_eur)

          // sum total value earned
          res[ref].earned = sum(res[ref].earned, value.earned)

          // set avg earned per play
          res[ref].avg = divide(res[ref].earned, res[ref].plays)

          return res
        }, {})

        result.sort((a, b) => b.plays - a.plays) // sort by plays descending

        sums = result.reduce((a, b) => ({
          artist_total: sum(a.artist_total, b.artist_total),
          artist_total_eur: sum(a.artist_total_eur, b.artist_total_eur),
          resonate_total: sum(a.resonate_total, b.resonate_total),
          resonate_total_eur: sum(a.resonate_total_eur, b.resonate_total_eur)
        }))
      }

      logger.info(`got a total of ${result.length} tracks`)

      ctx.body = {
        status: 'ok',
        data: result,
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
