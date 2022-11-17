const Queue = require('bull')
const DateFns = require('date-fns')
const path = require('path')
const winston = require('winston')
const { REDIS_CONFIG } = require('../config/redis')

const { File } = require('../db/models')
const createReport = require('../scripts/reports')
const sendEmailJob = require('./send-mail')

const sendEmailQueue = new Queue('send-email', {
  redis: REDIS_CONFIG
})

sendEmailQueue.on('completed', (job, result) => {
  logger.info('Email sent')
})

sendEmailQueue.process(sendEmailJob)

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

module.exports = async (job) => {
  const { from, to, id: artistId = job.profile.id, labelId, profile } = job.data

  try {
    const profiler = logger.startTimer()

    logger.info('starting creating report')

    const { id: fileId } = await File.create({
      ownerId: profile.id,
      mime: 'text/csv',
      status: 'processing'
    }, { raw: true })

    const { stats, sha1sum } = await createReport(from, to, { filename: fileId, artistId, labelId })

    File.update({
      hash: sha1sum,
      size: stats.size,
      status: 'ok'
    }, {
      where: {
        id: fileId,
        ownerId: profile.id
      },
      raw: true
    })

    sendEmailQueue.add({
      template: 'earnings-report',
      message: {
        to: job.data.email || profile.email,
        attachments: [
          {
            filename: `report_${from}_${to}-${artistId}.csv`,
            path: path.resolve(path.join(BASE_DATA_DIR, '/data/reports'), fileId)
          }
        ]
      },
      locals: {
        name: profile.nickname,
        firstName: profile.first_name,
        from: DateFns.format(from, 'PP'),
        to: DateFns.format(to, 'PP')
      }
    })

    profiler.done({ message: 'Done creating report. An email will be sent.' })

    return Promise.resolve()
  } catch (err) {
    return Promise.reject(err)
  }
}
