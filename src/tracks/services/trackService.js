const coverSrc = require('../../util/cover-src')
const he = require('he')

const trackService = (ctx) => {
  return {
    list (rows) {
      const ext = '.jpg'
      const variants = [120, 600]

      return rows.map((item) => {
        if (item.meta && !item.artist) {
          const { nickname } = Object.fromEntries(Object.entries(item.meta)
            .map(([key, value]) => {
              const metaKey = value.meta_key
              let metaValue = value.meta_value

              if (!isNaN(Number(metaValue))) {
                metaValue = Number(metaValue)
              }

              return [metaKey, metaValue]
            }))

          item.artist = nickname
        }

        return {
          id: item.id,
          creator_id: item.creator_id,
          title: item.title,
          duration: item.duration,
          album: item.album,
          year: item.year,
          cover: item.cover_art
            ? coverSrc(item.cover_art, '600', ext, !item.dataValues.cover)
            : coverSrc(item.dataValues.cover, '600', ext, !item.dataValues.file),
          cover_metadata: {
            id: item.cover_art
            // width, height ?
          },
          artist: item.artist ? he.decode(item.artist) : null,
          status: item.status === 2 ? 'Free' : 'Paid',
          url: `${process.env.STREAM_APP_HOST}/api/v3/user/stream/${item.id}`,
          images: variants.reduce((o, key) => {
            const variant = ['small', 'medium', 'large'][variants.indexOf(key)]

            return Object.assign(o,
              {
                [variant]: {
                  width: key,
                  height: key,
                  url: item.cover_art
                    ? coverSrc(item.cover_art, key, ext, !item.dataValues.cover)
                    : coverSrc(item.dataValues.cover, ext, ext, !item.dataValues.file)
                }
              }
            )
          }, {})
        }
      })
    }
  }
}

module.exports = trackService
