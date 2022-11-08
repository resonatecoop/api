const { apiRoot } = require('../../../constants')
const coverSrc = require('../../../util/cover-src')

const trackgroupService = (ctx) => {
  return {
    list (rows) {
      let ext = '.jpg'

      if (ctx.accepts('image/webp')) {
        ext = '.webp'
      }

      const variants = [120, 600, 1500]

      return rows.map((item) => {
        const o = Object.assign({}, item.dataValues)

        o.slug = item.slug

        o.uri = `${process.env.APP_HOST}${apiRoot}/trackgroups/${item.id}`
        o.createdAt = item.createdAt
        o.tags = item.get('tags')

        o.cover = coverSrc(item.cover, '600', ext, !item.dataValues.cover_metadata)

        o.images = variants.reduce((o, key) => {
          const variant = ['small', 'medium', 'large'][variants.indexOf(key)]

          return Object.assign(o,
            {
              [variant]: {
                width: key,
                height: key,
                url: coverSrc(item.cover, key, ext, !item.dataValues.cover_metadata)
              }
            }
          )
        }, {})

        return o
      })
    }
  }
}

module.exports = trackgroupService
