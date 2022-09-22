const { Play, Track, Credit } = require('../../../../db/models')
const { Op } = require('sequelize')
const { calculateCost, formatCredit } = require('@resonate/utils')
const numbro = require('numbro')
const authenticate = require('../../authenticate')

const add = (a, b) => numbro(a).add(b).value()
const subtract = (a, b) => numbro(a).subtract(b).value()

module.exports = function () {
  const operations = {
    // GET,
    POST: [authenticate, POST]
  }

  async function POST (ctx, next) {
    const { track_id: tid } = ctx.request.body

    try {
      const track = await Track.findOne({
        where: {
          tid: tid,
          status: {
            [Op.in]: [0, 2, 3]
          }
        }
      })

      if (!track) {
        ctx.status = 404
        ctx.throw(ctx.status, 'Track does not exist or is unavailable')
      }

      const wallet = await Credit.findOne({
        where: {
          user_id: ctx.profile.userId
        }
      })

      if (!wallet) {
        ctx.status = 404
        ctx.throw(ctx.status, 'Wallet does not exist')
      }

      const currentCount = await Play.count({
        where: {
          track_id: tid,
          user_id: ctx.profile.legacyId,
          event: 1
        }
      })

      let cost = 0
      let newCount = currentCount

      if (track.get('status') !== 'free' && currentCount < 9) {
        cost = calculateCost(currentCount)
      }

      const play = Play.build({
        track_id: track.id,
        user_id: ctx.profile.legacyId,
        createdAt: new Date().getTime() / 1000 | 0
      })

      if (cost > 0 && wallet.total >= cost) {
        wallet.total = subtract(wallet.total, cost)
        play.type = 'paid'
        newCount = add(currentCount, 1)

        await play.save()
        await wallet.save()
      } else {
        await play.save()
      }

      ctx.body = {
        data: {
          tid: play.tid,
          count: newCount,
          cost: cost,
          total: formatCredit(wallet.total)
        }
      }
    } catch (err) {
      ctx.throw(ctx.status, err.message)
    }

    await next()
  }

  POST.apiDoc = {
    operationId: 'addPlay',
    description: 'Add play',
    tags: ['plays'],
    parameters: [
      {
        in: 'body',
        name: 'play',
        schema: {
          type: 'object',
          additionalProperties: false,
          required: ['track_id'],
          properties: {
            track_id: {
              type: 'number',
              minimum: 1
            }
          }
        }
      }
    ],
    responses: {
      200: {
        description: 'The play data',
        schema: {
          type: 'object'
        }
      },
      404: {
        description: 'No play data found.'
      },
      default: {
        description: 'Unexpected error',
        schema: {
          $ref: '#/definitions/Error'
        }
      }
    }
  }

  return operations
}
