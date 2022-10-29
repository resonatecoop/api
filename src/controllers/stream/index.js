const Koa = require('koa')
const Router = require('@koa/router')
const path = require('path')
const fs = require('fs')

const { File, Track } = require('../../db/models')

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

    const { url: filename } = track

    let alias = `/audio/trim-${filename}.m4a`

    if (track.get('status') === 'free') {
      alias = `/audio/${filename}.m4a`
    }

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
        console.log('error', e)
        ctx.throw(404, 'Not found')
      }
    } else {
      ctx.set({
        Pragma: 'no-cache',
        'Content-Type': 'audio/mp4',
        // 'Content-Length': filesize, TODO if we have a file metadata
        // 'Content-Disposition': `inline; filename=${filename}`,
        'X-Accel-Redirect': alias
      })
      ctx.attachment(filename)

      ctx.body = null
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
