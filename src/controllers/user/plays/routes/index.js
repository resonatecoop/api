const { Play, Track, Credit } = require('../../../../db/models')
const { Op } = require('sequelize')
const { calculateCost } = require('@resonate/utils')
const numbro = require('numbro')
const { authenticate } = require('../../authenticate')

const add = (a, b) => numbro(a).add(b).value()
const subtract = (a, b) => numbro(a).subtract(b).value()

module.exports = function () {
  const operations = {
    POST: [authenticate, POST]
  }

  async function POST (ctx, next) {
    const { trackId: id } = ctx.request.body

    try {
      const track = await Track.findOne({
        where: {
          id,
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
          userId: ctx.profile.id
        }
      })

      if (!wallet) {
        ctx.status = 404
        ctx.throw(ctx.status, 'Wallet does not exist')
      }

      const currentCount = await Play.count({
        where: {
          track_id: id,
          user_id: ctx.profile.id,
          event: 1
        }
      })

      let cost = 0
      let newCount = currentCount

      if (track.get('status') !== 'free' && currentCount < 9) {
        cost = calculateCost(currentCount)
      }

      const play = Play.build({
        trackId: track.id,
        userId: ctx.profile.id
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
          trackId: play.trackId,
          count: newCount,
          cost: cost,
          total: wallet.total
        }
      }
    } catch (err) {
      console.error(err)
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
          required: ['trackId'],
          properties: {
            trackId: {
              type: 'string',
              format: 'uuid'
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
