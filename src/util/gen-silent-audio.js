const ffmpeg = require('fluent-ffmpeg')
const winston = require('winston')

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'gen-silent-audio' },
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

/**
 * Generate audio file fixture (aiff)
 */

function genAudio (dest, metadata) {
  return new Promise((resolve, reject) => {
    const profiler = logger.startTimer()

    // sine=frequency=1000:sample_rate=48000:duration=60
    const command = ffmpeg('anullsrc=sample_rate=48000:nb_samples=1024:channel_layout=mono')
      .inputFormat('lavfi')
      .audioChannels(1)
      .audioBitrate('96k')
      .audioFrequency(48000)
      .outputOptions([
        '-t', 60,
        '-acodec', 'pcm_s16le'
      ])

    if (metadata) {
      return command.clone()
        .outputOptions([
          '-write_id3v2', 1, // required for aiff
          '-id3v2_version', 4,
          '-metadata', `title=${metadata.title}`,
          '-metadata', `artist=${metadata.artist}`,
          '-metadata', `genre=${metadata.genre}`,
          '-metadata', `album_artist=${metadata.albumArtist}`,
          '-metadata', `album=${metadata.album}`,
          '-metadata', `composer=${metadata.composer}`,
          '-metadata', `year=${metadata.year}`
        ])
        .save(dest)
        .on('start', () => logger.info('Generating audio file'))
        .on('error', err => {
          logger.error(err.message)
          return reject(err)
        })
        .on('end', () => {
          profiler.done({ message: 'Done generating audio file' })
          return resolve()
        })
    }

    return command
      .save(dest)
      .on('start', () => logger.info('Generating audio file'))
      .on('error', err => {
        logger.error(err.message)
        return reject(err)
      })
      .on('end', () => {
        profiler.done({ message: 'Done generating audio file' })
        return resolve()
      })
  })
}

module.exports = genAudio;