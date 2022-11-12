const { apiRoot } = require('../../../constants')
const coverSrc = require('../../../util/cover-src')
const trackService = require('../../tracks/services/trackService')

const trackgroupService = (ctx) => {
  const ext = '.jpg'

  // if (ctx.accepts('image/webp')) {
  //   ext = '.webp'
  // }

  const variants = [120, 600, 1500]

  const single = (trackgroup) => {
    const o = Object.assign({}, trackgroup.get ? trackgroup.get({ plain: true }) : trackgroup)

    o.slug = trackgroup.slug
    o.cover_metadata = trackgroup.cover
      ? {
          id: trackgroup.cover
        }
      : null

    o.uri = `${process.env.APP_HOST}${apiRoot}/trackgroups/${trackgroup.id}`
    o.createdAt = trackgroup.createdAt
    o.tags = trackgroup.tags

    o.items = trackgroup.items?.map((item) => {
      item.track.trackOn = [{
        trackGroup: {
          title: trackgroup.title,
          id: trackgroup.id
        }
      }]
      const track = trackService(ctx).single(item.track)
      return {
        index: item.index,
        trackId: item.track.id,
        track
      }
    })

    o.cover = coverSrc(trackgroup.cover, '600', ext, !trackgroup.cover_metadata)
    o.images = variants.reduce((o, key) => {
      const variant = ['small', 'medium', 'large'][variants.indexOf(key)]

      return Object.assign(o,
        {
          [variant]: {
            width: key,
            height: key,
            url: coverSrc(trackgroup.cover, key, ext, !trackgroup.cover_metadata)
          }
        }
      )
    }, {})

    return o
  }

  return {
    single,
    list (rows) {
      return rows.map(single)
    }
  }
}

module.exports = trackgroupService
