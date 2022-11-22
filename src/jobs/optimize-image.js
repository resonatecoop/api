const winston = require('winston')
const sharp = require('sharp')
const path = require('path')
const bytes = require('bytes')

const { defaultOptions, config: sharpConfig } = require('../config/sharp')

const BASE_DATA_DIR = process.env.BASE_DATA_DIR || '/'

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'convert-optimize-image' },
  transports: [
    new winston.transports.Console({
      level: 'debug'
    }),
    new winston.transports.File({
      filename: 'error.log',
      level: 'error'
    })
  ]
})

/**
 * Convert and optimize track artworks to mozjpeg and webp
 */

module.exports = async (job) => {
  const {
    filename,
    config = sharpConfig.artwork
  } = job.data

  logger.info(`passed ${JSON.stringify(config)}`)

  const input = path.join(BASE_DATA_DIR, `/data/media/incoming/${filename}`)

  try {
    const profiler = logger.startTimer()

    logger.info(`starting to optimize images ${filename}`)

    const promises = Object.entries(config).map(([key, value]) => {
      const outputType = key // output type (jpeg, webp)
      const { options = {}, variants = [], ext = defaultOptions[outputType].ext } = value

      return variants.map(async variant => {
        const { width, height, suffix = `-x${width}` } = variant
        const dest = path.join(BASE_DATA_DIR, `/data/media/images/${filename}${suffix}${ext}`)

        let buffer

        if (variant.extract) {
          logger.info({ extract: variant.extract })

          const extractOptions = Object.assign({ width, height }, variant.extract)

          buffer = await sharp(input)
            .extract(extractOptions)
            .toBuffer()
        }

        const resizeOptions = Object.assign({
          width,
          height,
          withoutEnlargement: true
        }, variant.resize || {})

        const outputOptions = Object.assign({}, defaultOptions[outputType].outputOptions, options, variant.outputOptions || {})

        buffer = await sharp(buffer || input)
          .resize(resizeOptions)[outputType](outputOptions)
          .toBuffer()

        if (variant.blur) {
          logger.info({ blur: variant.blur.sigma })

          buffer = await sharp(buffer)
            .blur(variant.blur.sigma)
            .toBuffer()
        }

        return new Promise((resolve, reject) => {
          return sharp(buffer)
            .toFile(dest)
            .then(result => {
              logger.info(`Converted and optimized image to ${result.format}`, {
                size: bytes(result.size),
                ratio: `${result.width}x${result.height})`
              })

              return resolve(result)
            })
            .catch(err => {
              return reject(err)
            })
        })
      })
    }).flat(1)

    await Promise.all(promises)

    profiler.done({ message: 'Done optimizing image' })

    return Promise.resolve()
  } catch (err) {
    logger.error(err)
    return Promise.reject(err)
  }
}
