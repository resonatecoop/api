import { fetchFile, findTrack } from '../user/stream/routes/audio.{id}.{segment}.mjs'

export default function () {
  const operations = {
    GET,
    parameters: [
      { name: 'id', in: 'path', type: 'string', required: true, description: 'stream id', format: 'uuid' }
    ]
  }

  async function GET (ctx, next) {
    const { id, segment } = ctx.params

    try {
      const track = await findTrack(id, ctx)
      console.log('ffound track', track.get('status'))
      await fetchFile(ctx, track.url, segment, track.get('status') !== 'free')
    } catch (err) {
      ctx.throw(ctx.status, err.message)
    }

    await next()
  }

  return operations
}
