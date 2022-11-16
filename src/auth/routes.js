/* eslint-disable no-console, max-len, camelcase, no-unused-vars */
const { strict: assert } = require('assert')
const querystring = require('querystring')
const { inspect } = require('util')
const { User, Role } = require('../db/models')
const RedisAdapter = require('./redis-adapter')
const send = require('koa-send')
const path = require('path')
const { v4: uuidv4 } = require('uuid')

const isEmpty = require('lodash/isEmpty')
const bodyParser = require('koa-body')
const Router = require('@koa/router')
const { renderError } = require('./utils')
const sendMail = require('../jobs/send-mail')
const role = require('../db/models/resonate/role')
const { Op } = require('sequelize')

const keys = new Set()
const debug = (obj) =>
  querystring.stringify(
    Object.entries(obj).reduce((acc, [key, value]) => {
      keys.add(key)
      if (isEmpty(value)) return acc
      acc[key] = inspect(value, { depth: null })
      return acc
    }, {}),
    '<br/>',
    ': ',
    {
      encodeURIComponent (value) {
        return keys.has(value) ? `<strong>${value}</strong>` : value
      }
    }
  )

const body = bodyParser({
  text: false,
  json: false,
  patchNode: true,
  patchKoa: true
})

const adapter = new RedisAdapter('Session')

// node-oidc-provider doesn't provide any views, so we have to handle
// registration, etc.
// https://github.com/panva/node-oidc-provider/blob/main/docs/README.md#user-flows
module.exports = (provider) => {
  const router = new Router()
  const {
    constructor: {
      errors: { SessionNotFound }
    }
  } = provider

  router.use(async (ctx, next) => {
    ctx.set('cache-control', 'no-store')
    try {
      await next()
    } catch (err) {
      if (err instanceof SessionNotFound) {
        ctx.status = err.status
        const { message: error, error_description } = err
        renderError(ctx, { error, error_description }, err)
      } else {
        throw err
      }
    }
  })

  router.get('/password-reset', async (ctx) => {
    try {
      return ctx.render('password-reset-request', {
        messages: {},
        params: {},
        title: 'Password reset',
        dbg: { params: debug({}), prompt: debug({}) }
      })
    } catch (e) {
      console.error(e)
    }
  })

  router.post('/password-reset', body, async (ctx, next) => {
    let email = ctx.request.body.email
    email = email.toLowerCase()
    const isExisting = await User.findOne({ where: { email } })

    if (!isExisting) {
      return ctx.render('password-reset-request', {
        messages: { error: ['No user with this email exists'] },
        params: {},
        title: 'Password reset',
        dbg: { params: debug({}), prompt: debug({}) }
      })
    }
    const date = new Date()
    date.setMinutes(date.getMinutes() + 20)

    isExisting.emailConfirmationToken = uuidv4()
    isExisting.emailConfirmationExpiration = date.toISOString()
    await isExisting.save()

    try {
      sendMail({
        data: {
          template: 'password-reset',
          message: {
            to: isExisting.email
          },
          locals: {
            user: isExisting,
            host: process.env.APP_HOST
          }
        }
      })
    } catch (e) {
      console.error(e)
    }

    return ctx.render('password-reset-email-sent', {
      params: {},
      title: 'Password reset email sent',
      session: {},
      dbg: { params: debug({}), prompt: debug({}) }
    })
  })

  router.get('/password-reset/confirmation/:token', async (ctx) => {
    const token = ctx.params.token
    const email = ctx.query.email

    return ctx.render('password-reset', {
      messages: {},
      params: {
        token,
        email
      },
      title: 'Password reset',
      dbg: { params: debug({}), prompt: debug({}) }
    })
  })

  router.post('/password-reset/confirmation', body, async (ctx) => {
    const user = await User.findOne({
      where: {
        emailConfirmationToken: ctx.request.body.token,
        email: ctx.request.body.email,
        emailConfirmationExpiration: { [Op.gte]: (new Date()).toISOString() }
      }
    })

    if (user) {
      user.emailConfirmationToken = null
      user.emailConfirmed = true
      user.password = await User.hashPassword({ password: ctx.request.body.password })
      await user.save()
      return ctx.render('password-reset-success', {
        messages: {},
        params: {},
        title: 'Password reset Success',
        dbg: { params: debug({}), prompt: debug({}) }
      })
    } else {
      const message = { error: ['Something went wrong'] }
      return ctx.render('registration', {
        params: {},
        messages: message,
        title: 'Registration',
        dbg: { params: debug({}), prompt: debug({}) }
      })
    }
  })

  router.get('/register/emailConfirmation/:token', async (ctx, next) => {
    const token = ctx.params.token
    let message = {}
    const user = await User.findOne({
      where: {
        emailConfirmationToken: token,
        email: ctx.query.email,
        emailConfirmationExpiration: { [Op.gte]: (new Date()).toISOString() }
      }
    })

    if (user) {
      user.emailConfirmationToken = null
      user.emailConfirmed = true

      await user.save()
      message = { success: ['Your email has been confirmed! You can now log in using your favorite Resonate app'] }
    } else {
      message = { error: ['We couldn\'t find that email or token'] }
    }

    return ctx.render('email-confirmed', {
      messages: message,
      params: {},
      title: 'Registration',
      session: {},
      dbg: { params: debug({}), prompt: debug({}) }
    })
  })

  router.get('/register', async (ctx) => {
    return ctx.render('registration', {
      params: {},
      title: 'Registration',
      dbg: { params: debug({}), prompt: debug({}) }
    })
  })

  router.post('/register', body, async (ctx, next) => {
    const user = ctx.request.body
    let message = {}

    if (user.password.length < 8) {
      message = { error: ['Password must be at least 8 characters long'] }
      return ctx.render('registration', {
        messages: message,
        params: {},
        title: 'Registration',
        dbg: { params: debug({}), prompt: debug({}) }
      })
    }

    const email = user.email.toLowerCase()
    const isExisting = await User.findOne({ where: { email } })

    if (isExisting) {
      this.flash = { error: ['User with this email already exists!'] }
      return ctx.render('registration', {
        messages: message,
        params: {},
        title: 'Registration',
        dbg: { params: debug({}), prompt: debug({}) }
      })
    }

    const role = await Role.findOne({ where: { name: 'user' } })
    const date = new Date()
    date.setMinutes(date.getMinutes() + 20)
    const newUser = await User.create({
      email,
      password: user.password,
      roleId: role.id,
      emailConfirmationExpiration: date.toISOString()
    })

    try {
      sendMail({
        data: {
          template: 'new-user',
          message: {
            to: newUser.email
          },
          locals: {
            user: newUser,
            host: process.env.APP_HOST
          }
        }
      })
    } catch (e) {
      console.error(e)
    }

    if (newUser) {
      return ctx.render('registration-success', {
        uid: undefined,
        client: undefined,
        params: {},
        title: 'Registration',
        session: {},
        dbg: { params: debug({}), prompt: debug({}) }
      })
    } else {
      message = { error: ['Something went wrong'] }
      return ctx.render('registration', {
        messages: message,
        params: {},
        title: 'Registration',
        dbg: { params: debug({}), prompt: debug({}) }
      })
    }
  })

  router.get('/interaction/:uid', async (ctx, next) => {
    const { uid, prompt, params, session } = await provider.interactionDetails(
      ctx.req,
      ctx.res
    )
    const client = await provider.Client.find(params.client_id)

    switch (prompt.name) {
      case 'login': {
        return ctx.render('interaction-login', {
          client,
          uid,
          details: prompt.details,
          params,
          messages: {},
          title: 'Sign-in',
          session: session ? debug(session) : undefined,
          dbg: {
            params: debug(params),
            prompt: debug(prompt)
          }
        })
      }
      case 'consent': {
        return ctx.render('interaction', {
          client,
          uid,
          details: prompt.details,
          params,
          title: 'Authorize',
          session: session ? debug(session) : undefined,
          dbg: {
            params: debug(params),
            prompt: debug(prompt)
          }
        })
      }
      default:
        return next()
    }
  })

  router.post('/interaction/:uid/login', body, async (ctx) => {
    const response = await provider.interactionDetails(ctx.req, ctx.res)
    const {
      prompt: { name }
    } = response
    assert.equal(name, 'login')

    const user = await User.findOne({
      where: {
        email: ctx.request.body.email,
        emailConfirmed: true
      },
      attributes: ['password']
    })

    const passwordOkay = await User.checkPassword({ hash: user.password, password: ctx.request.body.password })
    if (!user || !passwordOkay) {
      const { uid } = await provider.interactionDetails(
        ctx.req,
        ctx.res
      )
      const message = { error: ['User not found'] }

      return ctx.redirect(`/interaction/${uid}`, {
        uid,
        client: undefined,
        messages: message,
        params: { error: 'User not found' },
        title: 'User not found',
        session: {},
        dbg: { params: debug({}), prompt: debug({}) }
      })
    }

    const result = {
      login: {
        accountId: user.id
      }
    }

    return provider.interactionFinished(ctx.req, ctx.res, result, {
      mergeWithLastSubmission: false
    })
  })

  router.post('/interaction/:uid/confirm', body, async (ctx) => {
    const interactionDetails = await provider.interactionDetails(
      ctx.req,
      ctx.res
    )
    const {
      prompt: { name, details },
      params,
      session: { accountId }
    } = interactionDetails
    assert.equal(name, 'consent')

    let { grantId } = interactionDetails
    let grant

    if (grantId) {
      // we'll be modifying existing grant in existing session
      grant = await provider.Grant.find(grantId)
    } else {
      // we're establishing a new grant
      grant = new provider.Grant({
        accountId,
        clientId: params.client_id
      })
    }

    if (details.missingOIDCScope) {
      grant.addOIDCScope(details.missingOIDCScope.join(' '))
    }
    if (details.missingOIDCClaims) {
      grant.addOIDCClaims(details.missingOIDCClaims)
    }
    if (details.missingResourceScopes) {
      // eslint-disable-next-line no-restricted-syntax
      for (const [indicator, scope] of Object.entries(
        details.missingResourceScopes
      )) {
        grant.addResourceScope(indicator, scope.join(' '))
      }
    }

    grantId = await grant.save()

    const consent = {}
    if (!interactionDetails.grantId) {
      // we don't have to pass grantId to consent, we're just modifying existing one
      consent.grantId = grantId
    }

    const result = { consent }
    return provider.interactionFinished(ctx.req, ctx.res, result, {
      mergeWithLastSubmission: true
    })
  })

  router.get('/interaction/:uid/abort', async (ctx) => {
    const result = {
      error: 'access_denied',
      error_description: 'End-User aborted interaction'
    }

    return provider.interactionFinished(ctx.req, ctx.res, result, {
      mergeWithLastSubmission: false
    })
  })

  return router
}
