const fs = require('fs')
const path = require('path')
const NodeCache = require('node-cache')

const myCache = new NodeCache({ stdTTL: 100, checkperiod: 120 })

const legacyImages = async (legacyId) => {
  try {
    const cached = myCache.get(`assets:${legacyId}`)

    if (cached) return cached

    // TODO: Figure out a way to read documents
    let dirContent = []
    try {
      const dirPath = path.resolve(path.join('/data/ultimatemember'), `./${legacyId}`)
      dirContent = await fs.promises.readdir(dirPath)
    } catch (e) {
      console.error('error looking in file system', e)
    }
    const assets = {}

    const variants = {
      40: 'profile_photo-xs',
      80: 'profile_photo-sm',
      300: 'profile_photo-m',
      400: 'profile_photo-l',
      800: 'profile_photo-xl',
      1200: 'profile_photo-xxl',
      500: 'cover_photo-s',
      600: 'cover_photo-m',
      1500: 'cover_photo-l'
    }

    const fallback = {
      profile_photo: 'profile_photo',
      cover_photo: 'cover_photo'
    }

    dirContent
      .reduce((res, value) => {
        const name = value.split('-')[0].split('.')[0]
        let key = value.split('.')[0].split('-')[1]

        if (key) {
          // if key is not undefined, we may need to remove x variant
          key = key.split('x')[0]
        }

        if (!res[key]) {
          const variant = variants[key] || fallback[name]

          res[variant] = `https://resonate.is/wp-content/uploads/ultimatemember/${legacyId}/${value}`

          assets[variant] = res[variant]
        }

        return res
      }, {})

    myCache.set(`assets:${legacyId}`, assets, 60 * 60 * 3) // three hours

    return assets
  } catch (err) {
    console.error(err)
  } // do not throw
}

module.exports.resolveProfileImage = async ({ legacyId, bannerId, avatarId }) => {
  if (legacyId) {
    legacyImages(legacyId)
  }
}

module.exports = module.exports.resolveProfileImage
