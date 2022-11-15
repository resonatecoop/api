const resolveProfileImage = require('../../util/profile-image')
const he = require('he')

const artistService = (ctx) => {
  const single = async (item) => {
    const o = Object.assign({}, item.get ? item.get({ plain: true }) : item)
    o.displayName = he.decode(o.displayName)
    // FIXME: this should include profile images for newer users too,
    // which sounds like a bit of work.
    o.images = item.owner?.legacyId ? await resolveProfileImage(item.owner.legacyId) : {}

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
