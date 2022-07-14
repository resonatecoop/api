const { Play, Track, Credit } = require('../../../db/models')
const { Op } = require('sequelize')
const { calculateRemainingCost, formatCredit } = require('@resonate/utils')
const map = require('awaity/map')
const numbro = require('numbro')

const subtract = (a, b) => numbro(a).subtract(b).value()

module.exports = function () {
  const operations = {
    POST
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
      const maxCount = 9

      if (track.get('status') !== 'free' && currentCount < maxCount) {
        cost = calculateRemainingCost(currentCount)
      }

      const plays = []

      // current count starts at 0
      for (let i = currentCount; i < maxCount; i = i + 1) {
        plays.push(i)
      }

      let result

      if (cost > 0 && wallet.total >= cost) {
        result = await map(plays, async (count) => {
          // TODO save the final play count
          const play = Play.build({
            // count: count + 1,
            track_id: track.id,
            user_id: ctx.profile.legacyId,
            createdAt: new Date().getTime() / 1000 | 0,
            type: 'paid'
          })

          return play.save()
        })

        wallet.total = subtract(wallet.total, cost)

        newCount = maxCount

        await wallet.save()
      }

      ctx.body = {
        data: {
          result,
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
    operationId: 'buyPlays',
    description: 'Buy plays',
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
