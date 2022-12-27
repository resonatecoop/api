const path = require('path')
const winston = require('winston')
const ffmpeg = require('fluent-ffmpeg')
const { promises: fs } = require('fs')

const BASE_DATA_DIR = process.env.BASE_DATA_DIR || '/'

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'convert-audio' },
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

module.exports = async job => {
  const { filename } = job.data

  try {
    await fs.mkdir(`/data/media/audio/${filename}`)

    const result = await Promise.all([
      new Promise((resolve, reject) => {
        return fs.cp(`/data/media/incoming/${filename}`, `/data/media/audio/${filename}/original.flac`)
      }),
      new Promise((resolve, reject) => {
        const profiler = logger.startTimer()
        return ffmpeg(path.join(BASE_DATA_DIR, `/data/media/incoming/${filename}`))
          .noVideo()
          .outputOptions(
            '-movflags',
            '+faststart'
          )
          .addOption('-start_number', 0)// start the first .ts segment at index 0
          .addOption('-hls_time', 10) // 10 second segment duration
          .addOption('-hls_list_size', 0)// Maxmimum number of playlist entries (0 means all entries/infinite)
          // .addOption('-strftime_mkdir', 1)
          // .addOption('-use_localtime_mkdir', 1)
          .addOption('-hls_segment_filename', `/data/media/audio/${filename}/segment-%03d.ts`)
          .addOption('-f', 'hls')// HLS format
          .audioChannels(2)
          .audioBitrate('128k')
          .audioFrequency(48000)
          .audioCodec('libfdk_aac') // convert using Fraunhofer FDK AAC
          .on('start', () => {
            logger.info('Converting original to hls')
          })
          .on('error', err => {
            logger.error(err.message)
            return reject(err)
          })
          .on('end', async () => {
            profiler.done({ message: 'Done converting to m3u8' })

            // FIXME: should this point to the trim track?
            const stat = await fs.stat(path.join(BASE_DATA_DIR, `/data/media/audio/${filename}/playlist.m3u8`))

            return resolve(stat)
          })
          .save(path.join(BASE_DATA_DIR, `/data/media/audio/${filename}/playlist.m3u8`))
      }),
      new Promise((resolve, reject) => {
        const profiler = logger.startTimer()

        return ffmpeg(path.join(BASE_DATA_DIR, `/data/media/incoming/${filename}`))
          .noVideo()
          .outputOptions(
            '-movflags',
            '+faststart'
          )
          .inputOptions('-t', 45)
          .addOption('-start_number', 0)// start the first .ts segment at index 0
          .addOption('-hls_time', 10) // 10 second segment duration
          .addOption('-hls_list_size', 0)// Maxmimum number of playlist entries (0 means all entries/infinite)
          // .addOption('-strftime_mkdir', 1)
          // .addOption('-use_localtime_mkdir', 1)
          .addOption('-hls_segment_filename', `/data/media/audio/${filename}/trim-%03d.ts`)
          .addOption('-f', 'hls')// HLS format
          .audioChannels(2)
          .audioBitrate('128k')
          .audioFrequency(48000)
          .audioCodec('libfdk_aac') // convert using Fraunhofer FDK AAC
          .on('start', () => {
            logger.info('Converting original to hls and trimming')
          })
          .on('error', err => {
            logger.error(err.message)
            return reject(err)
          })
          .on('end', async () => {
            profiler.done({ message: 'Done converting and trimming to m3u8' })

            // FIXME: should this point to the trim track?
            const stat = await fs.stat(path.join(BASE_DATA_DIR, `/data/media/audio/${filename}/trim-playlist.m3u8`))

            return resolve(stat)
          })
          .save(path.join(BASE_DATA_DIR, `/data/media/audio/${filename}/trim-playlist.m3u8`))
      })
    ])
    return Promise.resolve(result)
  } catch (err) {
    return Promise.reject(err)
  }
}
