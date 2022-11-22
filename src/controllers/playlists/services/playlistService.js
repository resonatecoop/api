const coverSrc = require('../../../util/cover-src')
const trackService = require('../../tracks/services/trackService')

const playlistService = (ctx) => {
  const single = (data) => {
    const ext = '.jpg'

    // if (ctx.accepts('image/webp')) {
    //   ext = '.webp'
    // }

    const variants = [120, 600, 1500]

    return {
      about: data.about,
      cover: coverSrc(data.cover, !data.cover_metadata ? '600' : '1500', ext, !data.cover_metadata),
      cover_metadata: {
        id: data.cover
      },
      creator: data.creator,
      creatorId: data.creator?.id ?? data.creatorId,
      id: data.id,
      items: data.items?.map((item) => {
        const track = trackService(ctx).single(item.track)
        return {
          index: item.index,
          track
        }
      }),
      images: variants.reduce((o, key) => {
        const variant = ['small', 'medium', 'large'][variants.indexOf(key)]

        return Object.assign(o,
          {
            [variant]: {
              width: key,
              height: key,
              url: coverSrc(data.cover, key, ext, !data.cover_metadata)
            }
          }
        )
      }, {}),
      private: data.private,
      featured: data.featured,
      tags: data.tags,
      title: data.title
    }
  }
  return {
    single,
    list (rows) {
      return rows.map(single)
    }
  }
}

module.exports = playlistService
