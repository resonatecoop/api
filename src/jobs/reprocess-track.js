const test = require('tape')
const path = require('path')
const Queue = require('bull')
const winston = require('winston')

require('dotenv-safe').config({ path: path.join(__dirname, '../../.env') })

const { Track, File } = require('../../lib/db/models')

const reprocessTrackJob = require('../../lib/jobs/reprocess-track')
const convertAudioJob = require('../../lib/jobs/convert-audio')
const cleanupJob = require('../../lib/jobs/cleanup')

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'upload' },
  transports: [
    new winston.transports.Console({
      level: 'debug',
      format: winston.format.json()
    }),
    new winston.transports.File({
      filename: 'error.log',
      level: 'error'
    })
  ]
})

const queueOptions = {
  redis: {
    port: process.env.REDIS_PORT || 6379,
    host: process.env.REDIS_HOST || '127.0.0.1',
    password: process.env.REDIS_PASSWORD
  }
}

const reprocessTracksQueue = new Queue('reprocess-tracks', queueOptions)
const audioQueue = new Queue('convert-audio', queueOptions)
const cleanupQueue = new Queue('cleanup', queueOptions)

audioQueue.on('completed', async (job, result) => {
  logger.info(result)

  try {
    await File.update({
      status: 'ok'
    }, {
      where: {
        id: job.data.filename // uuid
      }
    })

    cleanupQueue.add({
      filename: job.data.filename
    })
  } catch (err) {
    logger.error(err)
  }
})

audioQueue.on('error', (error) => {
  logger.error(error)
})

const concurrency = 5

reprocessTracksQueue.process(concurrency, reprocessTrackJob)
audioQueue.process(concurrency, convertAudioJob)
cleanupQueue.process(concurrency, cleanupJob)

cleanupQueue.on('completed', (job, result) => {
  logger.info(result)
})

cleanupQueue.on('error', (error) => {
  logger.error(error)
})

reprocessTracksQueue.on('error', (error) => {
  logger.error(error)
})

test('should reprocess track', async t => {
  const { rows: result, count } = await Track.findAndCountAll({
    where: {
      creator_id: 1056
    },
    raw: true
  })

  t.plan(count)

  logger.info(`count: ${count}`)

  reprocessTracksQueue.on('completed', (job, result) => {
    logger.info('completed')
    t.pass('ok')
    audioQueue.add({
      filename: job.data.filename
    })
  })

  result.forEach((item) => {
    reprocessTracksQueue.add({
      filename: item.url
    })
  })
})
