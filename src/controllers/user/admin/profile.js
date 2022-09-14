const Koa = require('koa')
const Router = require('@koa/router')
const Roles = require('koa-roles')
const { User, UserMeta } = require('../../../db/models')
const AJV = require('ajv')
const ajvKeywords = require('ajv-keywords')
const ajvFormats = require('ajv-formats')

const { Op } = require('sequelize')
const gravatar = require('gravatar')

const profile = new Koa()
const router = new Router()
const ajv = new AJV({
  allErrors: true,
  removeAdditional: true
})

ajvKeywords(ajv)
ajvFormats(ajv)

const user = new Roles({
  async failureHandler (ctx, action) {
    ctx.status = 403

    ctx.body = {
      message: 'Access Denied - You don\'t have permission to: ' + action
    }
  }
})

user.use((ctx, action) => {
  return ctx.profile || action === 'access profile'
})

user.use((ctx, action) => {
  const allowed = ['admin', 'superadmin']

  if (allowed.includes(ctx.profile.role)) {
    return true
  }
})

router.get('/', user.can('access profile'), async (ctx, next) => {
  try {
    const response = await User.findOne({
      attributes: [
        'id',
        'login',
        'email'
      ],
      where: {
        id: ctx.profile.id
      },
      include: [
        {
          model: UserMeta,
          as: 'meta',
          required: true,
          attributes: ['meta_key', 'meta_value'],
          where: {
            meta_key: {
              [Op.in]: ['role', 'nickname', 'first_name', 'last_name', 'mylabel', 'mybands']
            }
          }
        }
      ]
    })

    if (!response) {
      ctx.status = 404
      ctx.throw(ctx.status, 'Not found')
    }

    const { login, email, id, meta } = response

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
      data: Object.assign({
        id,
        login,
        email
      }, metaData, { gravatar: gravatar.url(email, { protocol: 'https' }) })
    }
  } catch (err) {
    ctx.throw(ctx.status, err.message)
  }

  await next()
})

router.put('/', user.can('access profile'), async (ctx, next) => {
  const body = ctx.request.body
  const validate = ajv.compile({
    type: 'object',
    additionalProperties: false,
    required: ['email'],
    properties: {
      email: {
        type: 'string',
        format: 'email'
      },
      nickname: {
        type: 'string' // user meta value
      }
    }
  })

  const isValid = validate(body)

  if (!isValid) {
    const { message, dataPath } = validate.errors[0]
    ctx.status = 400
    ctx.throw(400, `${dataPath}: ${message}`)
  }

  try {
    await User.update({
      email: body.email
    }, {
      where: {
        id: ctx.profile.id
      }
    })

    // TODO update email in oauth postgres db

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
      status: 'ok'
    }
  } catch (err) {
    ctx.throw(ctx.status, err.message)
  }

  await next()
})

profile
  .use(router.routes())
  .use(router.allowedMethods({
    throw: true
  }))

module.exports = profile
