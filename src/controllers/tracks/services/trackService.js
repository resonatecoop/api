const coverSrc = require('../../../util/cover-src')
const he = require('he')
const { apiRoot } = require('../../../constants')

const trackService = (ctx) => {
  const single = (item) => {
    const ext = '.jpg'

    // if (ctx.accepts('image/webp')) {
    //   ext = '.webp'
    // }

    const variants = [120, 600]

    return {
      id: item.id,
      creatorId: item.creatorId ?? item.creator_id,
      title: item.title,
      duration: item.duration,
      trackGroup: item.trackOn?.[0]?.trackGroup ?? { title: item.get?.('trackgroup.title') },
      year: item.year,
      status: item.status,
      cover: item.cover_art
        ? coverSrc(item.cover_art, '600', ext, !item.cover)
        : coverSrc(item.cover, '600', ext, !item.file),
      cover_metadata: {
        id: item.cover_art
        // width, height ?
      },
      creator: item.creator,
      // FIXME: artist is legacy stuff, we probably need to migrate it.
      artist: item.artist ? he.decode(item.artist) : null,
      url: `${process.env.APP_HOST}${apiRoot}user/stream/${item.id}`,
      images: variants.reduce((o, key) => {
        const variant = ['small', 'medium', 'large'][variants.indexOf(key)]

        return Object.assign(o,
          {
            [variant]: {
              width: key,
              height: key,
              url: item.cover_art
                ? coverSrc(item.cover_art, key, ext, !item.cover)
                : coverSrc(item.cover, ext, ext, !item.file)
            }
          }
        )
      }, {})
    }
  }
  return {
    single,
    list (rows) {
      return rows.map(single)
    }
  }
}

module.exports = trackService
