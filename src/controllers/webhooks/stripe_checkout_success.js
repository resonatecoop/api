const { Credit, User, UserMembership, MembershipClass } = require('../../db/models')
const unparsed = require('koa-body/unparsed.js')
const stripe = require('stripe')(process.env.STRIPE_KEY)

const values = {
  'Stream-Credit-05': 5,
  'Stream-Credit-10': 10,
  'Stream-Credit-20': 20,
  'Stream-Credit-50': 50
}

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET ?? ''

module.exports = function () {
  const operations = {
    POST: [POST]
  }

  async function POST (ctx, next) {
    try {
      // FIXME: Better error handling here
      // console.log('raw', ctx.request)
      const unparsedBody = ctx.request.body[unparsed]
      const sig = ctx.request.headers['stripe-signature']

      let event
      try {
        event = stripe.webhooks.constructEvent(unparsedBody, sig, endpointSecret)
      } catch (err) {
        console.error(err)
        ctx.status = 400
        ctx.throw('Webhook failure')
      }

      if (event.type === 'checkout.session.completed') {
        const { object } = event.data

        const session = await stripe.checkout.sessions.retrieve(object.id)
        const userId = session.client_reference_id
        console.log('event', event, session)
        if (!userId) {
          ctx.throw(404, 'Unmatched userId')
        }

        const user = await User.findOne({
          where: { id: userId }
        })

        if (!user) {
          ctx.throw(404, 'User not found')
        }
        const lineItems = await stripe.checkout.sessions.listLineItems(session.id)
        // console.log('lineItems', lineItems.data[1])
        await Promise.all(lineItems.data.map(async lineItem => {
          if (lineItem.description.includes('Stream-Credit')) {
            const [credit] = await Credit.findOrCreate({
              where: { user_id: user.id },
              defaults: {
                userId: userId,
                total: 0
              }
            })
            await credit.update({ total: credit.total + values[lineItem.description] })
            await credit.save()
          }
          if (lineItem.description.includes('Listener Subscription') && session.subscription) {
            const listenerClass = await MembershipClass.findOne({ where: { name: 'Listener' } })
            const [membership] = await UserMembership.findOrCreate({
              where: {
                membershipClassId: listenerClass.id,
                userId: user.id
              },
              defaults: {
                membershipClassId: listenerClass.id,
                userId: user.id,
                subscriptionId: session.subscription
              }
            })
            await membership.update({
              subscriptionId: session.subscription
            })
            await membership.save()
          }
        }))
      }

      ctx.status = 200
    } catch (err) {
      console.error('err', err)
      ctx.status = err.status
      ctx.throw(ctx.status, err.message)
    }

    await next()
  }

  return operations
}
