
const { File, Track, Play, Credit } = require('../../../../db/models')
const { calculateCost } = require('@resonate/utils')
const send = require('koa-send')
const path = require('path')
const { apiRoot } = require('../../../../constants')
const { authenticate } = require('../../authenticate')

const BASE_DATA_DIR = process.env.BASE_DATA_DIR || '/'

module.exports = function () {
  const operations = {
    GET: [authenticate, GET]
  }

  async function GET (ctx, next) {
    try {
      const track = await Track.findOne({
        where: {
          id: ctx.params.id
        },
        include: [
          {
            required: false,
            model: File,
            attributes: ['id', 'size', 'owner_id'],
            as: 'audiofile'
          }
        ]
      })

      if (!track) {
        ctx.status = 404
        ctx.throw(ctx.status, 'Not found')
      }

      const wallet = await Credit.findOne({
        where: {
          user_id: ctx.profile.id
        }
      })

      if (!wallet) {
        const notLoggedInUrl = `${apiRoot}/stream/${ctx.params.id}`
        ctx.redirect(notLoggedInUrl)
        return next()
      }

      const currentCount = await Play.count({
        where: {
          track_id: track.id,
          user_id: ctx.profile.id,
          event: 1
        }
      })

      let cost = 0

      if (track.get('status') !== 'free' && currentCount < 9) {
        cost = calculateCost(currentCount)
      }

      if (wallet.total < cost) {
        // 302
        ctx.redirect(`${apiRoot}/stream/${ctx.params.id}`)
      } else {
        const ext = '.m4a'
        const filename = track.url

        ctx.set({
          'Content-Type': 'audio/mp4',
          // 'Content-Length': filesize, TODO if we have a file metadata
          'Content-Disposition': `inline; filename=${filename}${ext}`,
          'X-Accel-Redirect': `/audio/${filename}${ext}` // internal redirect
        })

        await send(ctx, `/${filename}${ext}`, { root: path.join(BASE_DATA_DIR, '/data/media/audio') })
      }
    } catch (err) {
      console.log('err', err)
      ctx.throw(ctx.status, err.message)
    }

    await next()
  }

  GET.apiDoc = {
    operationId: 'getStream',
    description: 'Get stream',
    tags: ['stream'],

    responses: {
      200: {
        description: 'Streaming details for a song',
        schema: {
          type: 'object'
        }
      },
      404: {
        description: 'No stream found.'
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
