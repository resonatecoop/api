const coverSrc = require('../../../util/cover-src')

const playlistService = (ctx) => {
  const single = (data) => {
    let ext = '.jpg'

    if (ctx.accepts('image/webp')) {
      ext = '.webp'
    }

    const variants = [120, 600, 1500]

    return {
      about: data.about,
      cover: coverSrc(data.cover, !data.cover_metadata ? '600' : '1500', ext, !data.cover_metadata),
      cover_metadata: {
        id: data.cover
      },
      creator: data.creator,
      // creatorId: data.creator?.id,
      id: data.id,
      items: data.items?.map((item) => {
        const fallback = !item.track.cover_art ? false : !item.track.cover_metadata

        return {
          index: item.index,
          track: {
            id: item.track.id,
            title: item.track.title,
            status: item.track.status,
            album: item.track.album,
            duration: item.track.duration,
            creator_id: item.track.creator_id,
            artist: item.track.artist,
            cover: coverSrc(item.track.cover_art || data.cover, '600', ext, fallback),
            images: variants.reduce((o, key) => {
              const variant = ['small', 'medium', 'large'][variants.indexOf(key)]

              return Object.assign(o,
                {
                  [variant]: {
                    width: key,
                    height: key,
                    url: coverSrc(item.track.cover_art || data.cover, key, ext, fallback)
                  }
                }
              )
            }, {}),
            url: `${process.env.APP_HOST}/api/v3/user/stream/${item.track.id}`
          }
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
