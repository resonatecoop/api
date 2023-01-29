
import models from '../../../../db/models/index.js'
import { calculateCost } from '@resonate/utils'
import path from 'path'
import send from 'koa-send'
import { apiRoot } from '../../../../constants.js'
import { authenticate } from '../../authenticate.js'
import fs from 'fs'
const { File, Track, Play, Credit } = models
const fsPromises = fs.promises

const ROOT = '/data/media/audio'

export const fetchFile = async (ctx, filename, segment) => {
  const alias = `${filename}/${segment}`
  // We test if this file works with m3u8.
  try {
    await fsPromises.stat(path.join(ROOT, alias))
  } catch (e) {
    ctx.throw(404, 'Track data not found')
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
      ctx.body = fs.createReadStream(path.join(ROOT, alias))
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
    await send(ctx, `/${alias}`, { root: path.join(ROOT) })
  }
}

export const findTrack = async (id, ctx) => {
  const track = await Track.findOne({
    where: {
      id
    },
    include: [
      {
        required: false,
        model: File,
        where: {
          id
        },
        attributes: ['id', 'size', 'ownerId'],
        as: 'audiofile'
      }
    ]
  })

  if (!track) {
    ctx.status = 404
    ctx.throw(ctx.status, 'Not found')
  }

  return track
}

export default function () {
  const operations = {
    GET: [authenticate, GET]
  }

  async function GET (ctx, next) {
    const { segment, id } = ctx.params

    try {
      if (segment === 'playlist.m3u8') {
        const track = await findTrack(id, ctx)

        if (!ctx.profile) {
          const notLoggedInUrl = `${apiRoot}/stream/${ctx.params.id}/playlist.m3u8`
          ctx.redirect(notLoggedInUrl)
          return next()
        }

        const wallet = await Credit.findOne({
          where: {
            user_id: ctx.profile.id
          }
        })

        if (!wallet) {
          const notLoggedInUrl = `${apiRoot}/stream/${ctx.params.id}/playlist.m3u8`

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
          ctx.redirect(`${apiRoot}/stream/${ctx.params.id}/playlist.m3u8`)
        } else {
          await fetchFile(ctx, track.url, segment)
        }
      } else {
        // TODO: make it so that if we're fetching segment N
        // we charge the user if they have money and if not
        // we cut off playing. This will eliminate the play
        // endpoint as well as the need for storing separate trim
        // fields. This can only be done once we've migrated
        // all of our music to be folder structured.
        const track = await findTrack(id)
        await fetchFile(ctx, track.url, segment)
      }
    } catch (err) {
      console.error(err)
      ctx.throw(ctx.status, 'Error finding file')
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