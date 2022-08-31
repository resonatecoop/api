const Koa = require('koa')
const Router = require('@koa/router')
const { File, Track, Play, Credit } = require('../../db/models')
const { calculateCost } = require('@resonate/utils')

const stream = new Koa()
const router = new Router()

router.get('/:id', async (ctx, next) => {
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
        user_id: ctx.profile.userId
      }
    })

    if (!wallet) {
      ctx.status = 404
      ctx.throw(ctx.status, 'Not found')
    }

    const currentCount = await Play.count({
      where: {
        track_id: track.id,
        user_id: ctx.profile.legacyId,
        event: 1
      }
    })

    let cost = 0

    if (track.get('status') !== 'free' && currentCount < 9) {
      cost = calculateCost(currentCount)
    }

    if (wallet.total < cost) {
      // 302
      ctx.redirect(`/api/v3/stream/${ctx.params.id}`)
    } else {
      const ext = '.m4a'
      const filename = process.env.NODE_ENV === 'development'
        ? 'blank-audio'
        : track.url

      ctx.set({
        'Content-Type': 'audio/mp4',
        // 'Content-Length': filesize, TODO if we have a file metadata
        'Content-Disposition': `inline; filename=${filename}${ext}`,
        'X-Accel-Redirect': `/audio/${filename}${ext}` // internal redirect
      })
    }
  } catch (err) {
    ctx.throw(ctx.status, err.message)
  }

  await next()
})

stream
  .use(router.routes())
  .use(router.allowedMethods({
    throw: true
  }))

module.exports = stream
