
const { File, Track, Play, Credit } = require('../../../../db/models')
const { calculateCost } = require('@resonate/utils')
const send = require('koa-send')
const path = require('path')

const BASE_DATA_DIR = process.env.BASE_DATA_DIR || '/'

module.exports = function () {
  const operations = {
    GET
  }

  async function GET (ctx, next) {
    try {
      console.log('getting stream')
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
      console.log('got a trakc', track)

      const wallet = await Credit.findOne({
        where: {
          user_id: ctx.profile.id
        }
      })

      console.log('wallet', ctx.profile.id)

      if (!wallet) {
        ctx.status = 404
        ctx.throw(ctx.status, 'Not found')
      }
      console.log('got plays')
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
      console.log('hi', cost, wallet.total)

      if (wallet.total < cost) {
        // 302
        ctx.redirect(`/api/v3/stream/${ctx.params.id}`)
      } else {
        const ext = '.m4a'
        // const filename = process.env.NODE_ENV === 'development'
        //   ? 'blank-audio'
        //   : track.url
        const filename = track.url

        console.log('filename', filename)

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

    console.log('next')
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
