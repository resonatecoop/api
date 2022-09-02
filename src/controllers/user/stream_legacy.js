const Koa = require('koa')
const path = require('path')
const send = require('koa-send')
const { promises: fs } = require('fs')
const { File, Track } = require('../../db/models')
const Router = require('@koa/router')
const { isEnv } = require('../../util/dev')

const BASE_DATA_DIR = process.env.BASE_DATA_DIR || '/'

const stream = new Koa()
const router = new Router()

/**
 * WIP rewrite legacy stream endpoint
 */

router.get('/:id', isEnv(['development', 'test']), async (ctx, next) => {
  try {
    const track = await Track.findOne({
      where: {
        id: ctx.params.id
      },
      include: [
        {
          required: true, // associated file is required
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

    // TODO check if listener can pay or owns the track (ctx.profile.id)

    const fileid = track.audiofile.id
    const filename = track.audiofile.filename || `${track.title} - ${track.artist}`
    const filesize = track.audiofile.size

    await fs.stat(path.join(BASE_DATA_DIR, '/data/media/audio', fileid + '.m4a'))

    ctx.set({
      Pragma: 'no-cache',
      'Content-Type': 'audio/mp4',
      'Content-Length': filesize,
      'Content-Disposition': `inline; filename=${filename}`
    })

    await send(ctx, `/${fileid}.m4a`, { root: path.join(BASE_DATA_DIR, '/data/media/audio') })
  } catch (err) {
    console.log('err', err)
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
