const resolveProfileImage = require('../../util/profile-image')
const he = require('he')

const artistService = (ctx) => {
  const single = async (item) => {
    const o = Object.assign({}, item.get ? item.get({ plain: true }) : item)
    o.displayName = he.decode(o.displayName)
    o.images = item.legacyId ? await resolveProfileImage(item.legacyId) : {}

    return o
  }

  return {
    single,
    list (rows) {
      return Promise.all(rows.map(single))
    }
  }
}

module.exports = artistService
