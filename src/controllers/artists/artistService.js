const resolveProfileImage = require('../../util/profile-image')
const he = require('he')
const coverSrc = require('../../util/cover-src')

const artistService = (ctx) => {
  const single = async (item) => {
    const o = Object.assign({}, item.get ? item.get({ plain: true }) : item)
    o.displayName = he.decode(o.displayName)

    if (item.banner && item.banner !== '00000000-0000-0000-0000-000000000000') {
      o.banner = {
        small: coverSrc(o.banner, '625', '.jpg'),
        medium: coverSrc(o.banner, '1250', '.jpg'),
        large: coverSrc(o.banner, '2500', '.jpg')
      }
    }

    if (item.avatar && item.avatar !== '00000000-0000-0000-0000-000000000000') {
      o.avatar = {
        xxs: coverSrc(o.avatar, '60', '.jpg'),
        xs: coverSrc(o.avatar, '120', '.jpg'),
        s: coverSrc(o.avatar, '300', '.jpg'),
        m: coverSrc(o.avatar, '600', '.jpg'),
        l: coverSrc(o.avatar, '960', '.jpg'),
        xl: coverSrc(o.avatar, '1200', '.jpg'),
        xxl: coverSrc(o.avatar, '1500', '.jpg')
      }
    }

    o.images = item.owner?.legacyId
      ? await resolveProfileImage({
          legacyId: item.owner.legacyId,
          userGroupId: item.id
        })
      : {}

    return o
  }

  return {
    single,
    list: async (rows) => {
      return Promise.all(rows.map(single))
    }
  }
}

module.exports = artistService
