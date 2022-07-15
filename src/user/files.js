const AJV = require('ajv')
const ajvKeywords = require('ajv-keywords')
const ajvFormats = require('ajv-formats')

const Koa = require('koa')
const Roles = require('koa-roles')
const Router = require('@koa/router')
const { File } = require('../db/models')
const { Op } = require('sequelize')

const STATIC_BASE_PATH = 'https://' + process.env.STATIC_HOSTNAME + '/images/'

const user = new Roles()
const router = new Router()
const files = new Koa()
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
    limit: {
      type: 'number',
      maximum: 100,
      minimum: 1
    },
    type: {
      type: 'string',
      enum: ['audio', 'image', 'csv']
    },
    page: {
      type: 'number',
      minimum: 1
    }
  }
})

user.use((ctx, action) => {
  return ctx.profile || action === 'access files'
})

user.use('access files', (ctx, action) => {
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

router.get('/', user.can('access files'), async (ctx, next) => {
  await next()

  const isValid = validateQuery(ctx.request.query)

  if (!isValid) {
    const { message, dataPath } = validateQuery.errors[0]
    ctx.status = 400
    ctx.throw(400, `${dataPath}: ${message}`)
  }

  const { type, limit = 100, page = 1 } = ctx.request.query

  const where = {
    owner_id: ctx.profile.id
  }

  if (type) {
    where.mime = {
      audio: { [Op.in]: ['audio/aiff', 'audio/x-flac', 'audio/wav'] },
      csv: 'text/csv',
      image: { [Op.in]: ['image/jpeg', 'image/png'] }
    }[type]
  }

  try {
    const { rows: result, count } = await File.findAndCountAll({
      limit,
      offset: page > 1 ? page * limit : 0,
      where,
      order: [
        ['createdAt', 'DESC']
      ]
    })

    const data = result.map((item) => {
      const value = item.dataValues

      value.metadata = item.get('metadata')

      if (value.mime.split('/')[0] === 'image') {
        let ext = 'jpg'

        if (ctx.accepts('image/webp')) {
          ext = 'webp'
        }

        const variants = [120, 600, 1500]

        value.images = variants.reduce((o, key) => {
          const variant = ['small', 'medium', 'large'][variants.indexOf(key)]
          const suffix = `-x${key}`

          return Object.assign(o,
            {
              [variant]: {
                width: key,
                height: key,
                url: STATIC_BASE_PATH + item.get('id') + suffix + '.' + ext
              }
            }
          )
        }, {})
      }

      return value
    })

    ctx.body = {
      data,
      count: count,
      numberOfPages: Math.ceil(count / limit),
      status: 'ok'
    }
  } catch (err) {
    ctx.throw(ctx.status, err.message)
  }
})

router.get('/:id', async (ctx, next) => {
  try {
    const result = await File.findOne({
      where: {
        owner_id: ctx.profile.id,
        id: ctx.params.id
      }
    })

    const data = Object.assign({}, result.dataValues)

    data.metadata = result.get('metadata')

    if (result.mime.split('/')[0] === 'image') {
      let ext = 'jpg'

      if (ctx.accepts('image/webp')) {
        ext = 'webp'
      }

      const variants = [120, 600, 1500]

      data.images = variants.reduce((o, key) => {
        const variant = ['small', 'medium', 'large'][variants.indexOf(key)]
        const suffix = `-x${key}`

        return Object.assign(o,
          {
            [variant]: {
              width: key,
              height: key,
              url: STATIC_BASE_PATH + result.get('id') + suffix + '.' + ext
            }
          }
        )
      }, {})
    }

    ctx.body = {
      data,
      status: 'ok'
    }
  } catch (err) {
    ctx.throw(ctx.status, err.message)
  }

  await next()
})

router.delete('/:id', user.can('access files'), async (ctx, next) => {
  await next()

  try {
    // TODO run remove job on the files
    // local save,
    // backblaze...
    // then
    // remove file reference from db when data removal is complete
    await File.destroy({
      where: {
        owner_id: ctx.profile.id,
        id: ctx.params.id
      }
    })

    ctx.body = {
      data: null,
      message: 'ok'
    }
  } catch (err) {
    ctx.throw(ctx.status, err.message)
  }
})

files
  .use(router.routes())
  .use(router.allowedMethods({
    throw: true
  }))

module.exports = files
