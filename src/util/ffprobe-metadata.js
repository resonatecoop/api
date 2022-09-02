const ffmpeg = require('fluent-ffmpeg')
const winston = require('winston')

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'ffprobe-metadata' },
  transports: [
    new winston.transports.Console({
      level: 'debug',
      format: winston.format.simple()
    }),
    new winston.transports.File({
      filename: 'error.log',
      level: 'error'
    })
  ]
})

function ffprobe (pathname) {
  return new Promise((resolve, reject) => {
    const profiler = logger.startTimer()

    return ffmpeg.ffprobe(pathname, (err, metadata) => {
      if (err) {
        return reject(err)
      }

      profiler.done({ message: 'Done parsing metadata' })

      let data = {
        duration: metadata.format.duration
      }

      if ('tags' in metadata.format) {
        // make sure to normalize object keys
        // TODO normalize case to snake case ?
        const tags = Object.fromEntries(Object.entries(metadata.format.tags).map(([k, v]) => {
          return [k.toLowerCase(), v]
        }))

        const year = tags.date || tags.year

        if (year) {
          data.year = new Date(tags.date || tags.year).getFullYear()
        }

        if (tags.track) {
          data.number = tags.track
        }

        data = Object.assign(data, {
          title: tags.title,
          genre: tags.genre,
          artist: tags.artist,
          album: tags.album,
          album_artist: tags.album_artist
        })
      }

      return resolve(data)
    })
  })
}

module.exports = ffprobe
