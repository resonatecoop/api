const Koa = require('koa')
const Router = require('@koa/router')
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

    const alias = `/audio/trim-${filename}.m4a`

    ctx.set({
      Pragma: 'no-cache',
      'Content-Type': 'audio/mp4',
      // 'Content-Length': filesize, TODO if we have a file metadata
      'Content-Disposition': `inline; filename=${filename}`,
      'X-Accel-Redirect': alias
    })

    ctx.body = null
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
