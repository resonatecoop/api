#!/usr/bin/env node

const dotenv = require('dotenv-safe')
dotenv.config()

const yargs = require('yargs')
const { Worker } = require('bullmq')
const winston = require('winston')
const convertAudioJob = require('./convert-audio')
const audioDurationJob = require('./audio-duration')

const {
  REDIS_CONFIG
} = require('../config/redis')

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
  prefix: 'resonate',
  connection: REDIS_CONFIG
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
    audioQueue()
    audioDurationQueue()
  })
  .help()
  .argv

async function audioQueue () {
  const worker = new Worker('convert-audio', convertAudioJob, workerOptions)

  logger.info('Worker is running')

  worker.on('progress', (job) => {
    console.log('failing')
  })

  worker.on('active', (job) => {
    logger.info(JSON.stringify(job))
  })

  worker.on('completed', (job) => {
    logger.info(job)
  })

  worker.on('failed', (job, err) => {
    logger.error(err)
  })

  worker.on('error', err => {
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
