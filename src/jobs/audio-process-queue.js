#!/usr/bin/env node

const yargs = require('yargs')
const { Worker } = require('bullmq')
const winston = require('winston')
const convertAudioJob = require('./jobs/convert-audio')
const audioDurationJob = require('./jobs/audio-duration')

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'audio-process-queue' },
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

const workerOptions = {
  prefix: 'justifay',
  connection: {
    port: process.env.REDIS_PORT || 6379,
    host: process.env.REDIS_HOST || '127.0.0.1',
    password: process.env.REDIS_PASSWORD
  }
}

yargs // eslint-disable-line
  .command('run [name]', 'starts audio processing queue', (yargs) => {
    yargs
      .positional('name', {
        type: 'string',
        describe: 'queue name',
        default: 'convert-audio'
      })
  }, (argv) => {
    audioQueue(argv.name)
    audioDurationQueue()
  })
  .help()
  .argv

function audioQueue (name) {
  const worker = new Worker(name, convertAudioJob, workerOptions)

  logger.info('Worker is running')

  worker.on('completed', (job) => {
    logger.info(job)
  })

  worker.on('failed', (job, err) => {
    logger.error(err)
  })
}

function audioDurationQueue () {
  const worker = new Worker('audio-duration', audioDurationJob, workerOptions)

  logger.info('Audio duration worker started')

  worker.on('completed', (job) => {
    logger.info(job)
  })

  worker.on('failed', (job, err) => {
    logger.error(err)
  })
}
