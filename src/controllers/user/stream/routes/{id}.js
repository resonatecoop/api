
const { File, Track, Play, Credit } = require('../../../../db/models')
const { calculateCost } = require('@resonate/utils')
const path = require('path')
const send = require('koa-send')
const { apiRoot } = require('../../../../constants')
const { authenticate } = require('../../authenticate')
const fs = require('fs')

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
            attributes: ['id', 'size', 'ownerId'],
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
          trackId: track.id,
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
        const ext = '.m3u8'
        const filename = track.url
        const alias = `/audio/${filename}/playlist${ext}`

        // FIXME: this has to happen because of how nginx
        // is set up on local. We can't forward to port :80
        // because we can't guarantee that there won't be anything
        // running on port 80 on the user's machine. But
        // when you use nginx to transparently (x-accel-redirect)
        // to an other endpoint from within the node app,
        // the koa context thinks it's operating within
        // localhost (no port), which is a problem for node-oidc-provider
        // and the automatic URLs it builds. There's probably a
        // cleaner way to fix this.
        if (process.env.NODE_ENV !== 'production') {
          try {
            ctx.body = fs.createReadStream(path.join(process.env.BASE_DATA_DIR ?? '/', '/data/media', alias))
          } catch (e) {
            console.error(e)
            ctx.throw(404, 'Not found')
          }
        } else {
          // FIXME: is there a way to make it so that nginx serves
          // this file?
          // ctx.set({
          //   'Content-Type': 'audio/mp4',
          //   // 'Content-Length': filesize, TODO if we have a file metadata
          //   // 'Content-Disposition': `inline; filename=${filename}${ext}`,
          //   'X-Accel-Redirect': alias // internal redirect
          // })
          // ctx.attachment(filename)
          // ctx.body = null
          await send(ctx, `/${filename}${ext}`, { root: path.join('/data/media/audio') })
        }
      }
    } catch (err) {
      console.error(err)
      ctx.throw(500, 'Error finding file')
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
