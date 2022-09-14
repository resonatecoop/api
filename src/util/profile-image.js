// const fs = require('fs')
// const path = require('path')
const NodeCache = require('node-cache')

const myCache = new NodeCache({ stdTTL: 100, checkperiod: 120 })

// const BASE_DATA_DIR = process.env.BASE_DATA_DIR || '/'

/**
 *
 */

module.exports.resolveProfileImage = async (id) => {
  try {
    const cached = myCache.get(`assets:${id}`)

    if (cached) return cached

    // TODO: Figure out a way to read documents
    // const dirContent = await fs.readdir(path.resolve(path.join(BASE_DATA_DIR, '/data/ultimatemember'), `./${id}`))
    const dirContent = []
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

          res[variant] = `https://resonate.is/wp-content/uploads/ultimatemember/${id}/${value}`

          assets[variant] = res[variant]
        }

        return res
      }, {})

    myCache.set(`assets:${id}`, assets, 10000)

    return assets
  } catch (err) {
    console.error(err)
  } // do not throw
}

module.exports = module.exports.resolveProfileImage
