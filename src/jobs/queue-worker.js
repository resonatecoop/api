#!/usr/bin/env node

const dotenv = require('dotenv-safe')
dotenv.config()

const yargs = require('yargs')
const { Worker } = require('bullmq')
const winston = require('winston')
const convertAudioJob = require('./convert-audio')
const audioDurationJob = require('./audio-duration')
const optimizeImage = require('./optimize-image')
const uploadB2 = require('./upload-b2')

const {
  REDIS_CONFIG
} = require('../config/redis')

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'file-process-queue' },
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
  .command('run', 'starts file processing queue', (argv) => {
    console.log('STARTING WORKER QUEUE')
    audioQueue()
    audioDurationQueue()
    imageQueue()
    uploadB2Queue()
  })
  .help()
  .argv

async function imageQueue () {
  const worker = new Worker('optimize-image', optimizeImage, workerOptions)
  logger.info('Optimize image worker started')

  worker.on('completed', (job) => {
    logger.info('completed:optimize-image')
  })

  worker.on('failed', (job, err) => {
    logger.error('failed:optimize-image', err)
  })

  worker.on('error', err => {
    logger.error('error:optimize-image', err)
  })
}

async function audioQueue () {
  const worker = new Worker('convert-audio', convertAudioJob, workerOptions)
  logger.info('Convert Audio worker started')

  worker.on('completed', (job) => {
    logger.info('completed:convert-audio')
  })

  worker.on('failed', (job, err) => {
    logger.error('failed:convert-audio', err)
  })

  worker.on('error', err => {
    logger.error('error:convert-audio', err)
  })
}

function audioDurationQueue () {
  const worker = new Worker('audio-duration', audioDurationJob, workerOptions)
  logger.info('Audio duration worker started')

  worker.on('completed', (job) => {
    logger.info('completed:audio-duration')
  })

  worker.on('failed', (job, err) => {
    logger.error('failed:audio-duration', err)
  })

  worker.on('error', err => {
    logger.error('error:audio-duration', err)
  })
}

function uploadB2Queue () {
  const worker = new Worker('upload-b2', uploadB2, workerOptions)
  logger.info('Upload to backblaze worker started')

  worker.on('completed', (job) => {
    logger.info('completed:upload-b2')
  })

  worker.on('failed', (job, err) => {
    logger.error('failed:upload-b2', err)
  })

  worker.on('error', err => {
    logger.error('error:upload-b2', err)
  })
}
