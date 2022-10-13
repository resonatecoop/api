/* eslint-disable no-console, max-len, camelcase, no-unused-vars */
const { strict: assert } = require('assert')
const querystring = require('querystring')
const { inspect } = require('util')
const { User, Role } = require('../db/models')
const RedisAdapter = require('./redis-adapter')
const send = require('koa-send')
const path = require('path')

const isEmpty = require('lodash/isEmpty')
const bodyParser = require('koa-body')
const Router = require('@koa/router')
const { renderError } = require('./utils')
const sendMail = require('../jobs/send-mail')
const role = require('../db/models/resonate/role')

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

  router.get('/register/emailConfirmation/:token', async (ctx, next) => {
    const token = ctx.params.token
    const user = await User.findOne({
      where: { emailConfirmationToken: token, email: ctx.query.email }
    })

    if (user) {
      user.emailConfirmationToken = null
      user.emailConfirmed = true

      user.save()
      this.flash = { success: ['Your email has been confirmed! You can now log in using your favorite Resonate app'] }
    } else {
      this.flash = { error: ['We couldn\'t find that email or token'] }
    }

    return ctx.render('email-confirmed', {
      uid: undefined,
      client: undefined,
      messages: this.flash,
      params: {},
      title: 'Registration',
      session: {},
      dbg: { params: debug({}), prompt: debug({}) }
    })
  })

  router.get('/register', async (ctx) => {
    return ctx.render('registration', {
      uid: undefined,
      client: undefined,
      messages: this.flash,
      params: {},
      title: 'Registration',
      dbg: { params: debug({}), prompt: debug({}) }
    })
  })

  router.post('/register', body, async (ctx, next) => {
    const user = ctx.request.body

    if (user.password.length < 8) {
      this.flash = { error: ['Password must be at least 8 characters long'] }
      return ctx.redirect('/register')
    }

    const isExisting = await User.findOne({
      where: {
        email: user.email.toLowerCase()
      }
    })

    if (isExisting) {
      this.flash = { error: ['User with this email already exists!'] }
      return ctx.redirect('/register')
    }

    const role = await Role.findOne({ where: { name: 'user' } })
    const newUser = await User.create({ ...user, roleId: role.id })

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
      this.flash = { error: ['Something went wrong'] }
      return ctx.redirect('/register')
    }
  })

  router.get('/account', async (ctx, next) => {
    // Ideally this gets moved into a front-end app.
    const cookie = ctx.cookies.get('_session')
    const session = await adapter.find(cookie)
    const user = await User.findOne({
      where: {
        id: session.accountId
      },
      raw: true
    })
    if (user) {
      return ctx.render('account', {
        title: 'Account',
        uid: session.uid,
        client: undefined,
        user,
        session: session,
        params: {},
        dbg: { params: debug({}), prompt: debug({}) }
      })
    } else {
      next()
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
      }
    })

    if (!user) {
      throw new Error('User not found')
    }

    if (
      !User.checkPassword({
        hash: user.password,
        password: ctx.request.body.password
      })
    ) {
      throw new Error('User not found')
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
