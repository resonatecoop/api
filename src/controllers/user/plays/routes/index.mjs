import models from '../../../../db/models/index.js'
import { Op } from 'sequelize'
import { calculateCost } from '@resonate/utils'
import numbro from 'numbro'
import { authenticate } from '../../authenticate.js'

const { Play, Track, Credit, UserLedgerEntry, UserTrackPurchase, UserGroup } = models
const add = (a, b) => numbro(a).add(b).value()
const subtract = (a, b) => numbro(a).subtract(b).value()

export default function () {
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
        },
        include: [{
          model: UserGroup,
          attributes: ['id', 'ownerId'],
          as: 'creator'
        }]
      })

      if (track.creator.ownerId === ctx.profile.id) {
        ctx.status = 200
        ctx.throw(ctx.status, 'Track owned by listener')
      }

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
          trackId: id,
          userId: ctx.profile.id,
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
        await play.reload()
        await UserLedgerEntry.create({
          userId: track.creatorId,
          amount: Math.max(((cost / 1000) * 1.2).toFixed(2), 0.01),
          type: 'credit',
          extra: {
            playId: play.id
          }
        })
        if (newCount === 9) {
          await UserTrackPurchase.create({
            userId: ctx.profile.id,
            trackId: track.id,
            type: 'play'
          })
        }
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
