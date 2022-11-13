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

    const variants = [120, 600]
    const trackGroup = item.trackOn?.[0]?.trackGroup.get
      ? item.trackOn?.[0]?.trackGroup.get({ plain: true })
      : item.trackOn?.[0]?.trackGroup

    return {
      id: item.id,
      creatorId: item.creatorId ?? item.creator_id,
      title: item.title,
      duration: item.duration,
      trackGroup: trackGroup
        ? { ...trackGroup, cover: coverSrc(trackGroup.cover, '600', ext) }
        : {
            title: item.get?.('trackgroup.title'),
            cover: item.get?.('trackgroup.cover') ? coverSrc(item.get?.('trackgroup.cover'), '600', ext) : ''
          },
      trackGroupId: trackGroup?.id,
      year: item.year,
      status: item.status,
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
