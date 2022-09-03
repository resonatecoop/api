// const { Queue } = require('bullmq') // TODO: phase this out
const { Queue3, Queue, QueueEvents } = require('bullmq')
const FileType = require('file-type')
const { promises: fs } = require('fs')
const path = require('path')
const shasum = require('shasum')
const winston = require('winston')
const dimensions = require('image-size')
const mm = require('music-metadata')

const { Track, File } = require('../db/models')

const sendEmailJob = require('../jobs/send-mail')
const uploadJob = require('../jobs/upload-b2')
const sharpConfig = require('../config/sharp') // TODO publish this)

const {
  HIGH_RES_AUDIO_MIME_TYPES,
  SUPPORTED_IMAGE_MIME_TYPES
} = require('../config/supported-media-types')
const { REDIS_CONFIG } = require('../config/redis')

const BASE_DATA_DIR = process.env.BASE_DATA_DIR || '/'

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'upload' },
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

const queueOptions = {
  prefix: 'resonate',
  connection: REDIS_CONFIG
}

const audioQueue = new Queue('convert-audio', queueOptions)

const audioQueueEvents = new QueueEvents('convert-audio', queueOptions)

audioQueueEvents.on('global:completed', async (jobId) => {
  logger.log(`Job with id ${jobId} has been completed`)

  try {
    const job = await audioQueue.getJob(jobId)

    const file = await File.findOne({
      where: {
        id: job.data.filename
      }
    })

    const metadata = file.metadata || { variants: [] }
    const variants = metadata.variants || []

    for (const result of job.returnvalue) {
      variants.push({
        format: 'm4a',
        size: result.size,
        name: 'audiofile'
      })
    }

    metadata.variants = variants

    await File.update({
      metadata: metadata,
      status: 'ok'
    }, {
      where: {
        id: job.data.filename // uuid
      }
    })
  } catch (err) {
    logger.error(err)
  }
})

const sendEmailQueue = new Queue3('send-email', queueOptions)

const sendEmailQueueEvents = new QueueEvents('send-email', queueOptions)

sendEmailQueueEvents.on('completed', (job, result) => {
  logger.info(`Email sent to ${job.data.message.to}`)
})

const uploadQueue = new Queue3('upload', queueOptions)

const uploadQueueEvents = new QueueEvents('upload', queueOptions)

uploadQueueEvents.on('completed', async (job, result) => {
  const { profile } = job.data

  try {
    sendEmailQueue.add({
      template: 'new-upload',
      message: {
        to: process.env.APP_EMAIL
      },
      locals: {
        name: profile.nickname,
        firstName: profile.first_name
      }
    })
  } catch (err) {
    logger.error(err)
  }
})

const audioDurationQueue = new Queue3('audio-duration', queueOptions)

const audioDurationQueueEvents = new QueueEvents('audio-duration', queueOptions)

audioDurationQueueEvents.on('global:completed', async (jobId) => {
  try {
    const job = await audioDurationQueue.getJob(jobId)

    const file = await File.findOne({
      where: {
        id: job.data.filename
      }
    })

    const track = await Track.findOne({
      where: {
        url: file.id
      }
    })

    track.duration = job.returnvalue

    await track.save()
  } catch (err) {
    logger.error(err)
  }
})

const imageQueue = new Queue('optimize-image', queueOptions)

const imageQueueEvents = new QueueEvents('optimize-image', queueOptions)

imageQueueEvents.on('global:completed', async (jobId) => {
  logger.info(`Job with id ${jobId} has been completed`)

  try {
    const job = await imageQueue.getJob(jobId)

    await File.update({
      status: 'ok'
    }, {
      where: {
        id: job.data.filename // uuid
      }
    })
  } catch (err) {
    logger.error(err)
  }
})

sendEmailQueue.process(sendEmailJob)
uploadQueue.process(uploadJob)

/*
 * Process a file then queue it for upload
 * @param {object} ctx Koa context
 * @returns {Promise} Promise object containing image
 */
const processFile = ctx => {
  return async file => {
    const { size: fileSize, path: filePath } = file
    const type = await FileType.fromFile(filePath)
    const mime = type !== null ? type.mime : file.type
    const isImage = SUPPORTED_IMAGE_MIME_TYPES
      .includes(mime)

    const isAudio = HIGH_RES_AUDIO_MIME_TYPES
      .includes(mime)

    if (!isImage && !isAudio) {
      ctx.status = 400
      ctx.throw(400, `File type not supported: ${mime}`)
    }

    const buffer = await fs.readFile(file.path)
    const sha1sum = shasum(buffer)

    // create record for original file
    const result = await File.create({
      owner_id: ctx.profile.id,
      filename: file.name, // original file name
      size: fileSize,
      mime,
      hash: sha1sum
    }, { raw: true })

    const { id: filename, filename: originalFilename } = result.dataValues // uuid/v4

    try {
      await fs.rename(
        file.path,
        path.join(BASE_DATA_DIR, `/data/media/incoming/${filename}`)
      )
    } catch (e) {
      console.error(e)
    }

    if (process.env.NODE_ENV !== 'development') {
      uploadQueue.add({
        profile: ctx.profile,
        filename,
        filesize: fileSize,
        mime
      })
    }

    const data = Object.assign({}, result.dataValues, {
      filename, // uuid filename
      filename_orig: originalFilename
    })

    if (isAudio) {
      logger.info('Parsing audio metadata')

      const metadata = await mm.parseFile(path.join(BASE_DATA_DIR, `/data/media/incoming/${filename}`), {
        duration: true,
        skipCovers: true
      })

      logger.info('Done parsing audio metadata')

      logger.info('Creating new track')

      // TODO: extract metadata from file and put it on the
      // const track = await Track.create({
      //   title: metadata.common.title || originalFilename,
      //   creator_id: ctx.profile.id,
      //   url: filename,
      //   duration: metadata.format.duration || 0,
      //   artist: metadata.common.artist,
      //   album: metadata.common.album,
      //   year: metadata.common.year,
      //   album_artist: metadata.common.albumartist,
      //   number: metadata.common.track.no,
      //   createdAt: new Date().getTime() / 1000 | 0
      // })

      if (!metadata.format.duration) {
        audioDurationQueue.add({ filename })
      }

      data.metadata = metadata.common
      // data.track = track.get({ plain: true })

      logger.info('Adding audio to queue')
      audioQueue.add('convert-audio', { filename })
    }

    if (isImage) {
      const { config = 'artwork' } = ctx.request.body // sharp config key
      const { width, height } = await dimensions(path.join(BASE_DATA_DIR, `/data/media/incoming/${filename}`))

      const file = await File.findOne({
        where: {
          id: filename
        }
      })

      const metadata = file.metadata || {}

      file.metadata = Object.assign(metadata, { dimensions: { width, height } })

      await file.save()

      logger.info('Adding image to queue')

      data.image = file.dataValues

      imageQueue.add('optimize-image', { filename, config: sharpConfig[config] })
    }

    return data
  }
}

module.exports = { processFile }
