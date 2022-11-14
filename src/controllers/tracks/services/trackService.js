const coverSrc = require('../../../util/cover-src')
const he = require('he')
const { apiRoot } = require('../../../constants')

const trackService = (ctx) => {
  const single = (item) => {
    const ext = '.jpg'

    // FIXME: Need to migrate existing jpg to webp
    // if (ctx.accepts('image/webp')) {
    //   ext = '.webp'
    // }

    const variants = [120, 600, 1500]
    const trackGroup = item.trackOn?.[0]?.trackGroup.get
      ? item.trackOn?.[0]?.trackGroup.get({ plain: true })
      : item.trackOn?.[0]?.trackGroup

    const coverFromTrackGroup = trackGroup ? coverSrc(trackGroup.cover, '600', ext) : undefined
    const cover = coverFromTrackGroup ?? (item.get?.('trackgroup.cover') ? coverSrc(item.get?.('trackgroup.cover'), '600', ext) : '')

    return {
      id: item.id,
      creatorId: item.creatorId ?? item.creator_id,
      title: item.title,
      duration: item.duration,
      trackGroup: trackGroup
        ? { ...trackGroup, cover }
        : {
            title: item.get?.('trackgroup.title'),
            cover
          },
      trackGroupId: trackGroup?.id,
      year: item.year,
      status: item.status,
      creator: item.creator,
      // FIXME: artist is legacy stuff, we probably need to migrate it.
      artist: item.artist ? he.decode(item.artist) : null,
      url: `${process.env.APP_HOST}${apiRoot}/user/stream/${item.id}`,
      images: variants.reduce((o, key) => {
        const variant = ['small', 'medium', 'large'][variants.indexOf(key)]
        const coverUrl = coverSrc(cover, key, ext)

        if (!coverUrl) {
          return o
        }

        return Object.assign(o,
          {
            [variant]: {
              width: key,
              height: key,
              url: coverUrl
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
