const B2 = require('backblaze-b2')
const Promise = require('bluebird')
const shasum = require('shasum')
const { splitSync } = require('node-split')
const bytes = require('bytes')
const winston = require('winston')
const { promises: fs } = require('fs')
const path = require('path')

const BASE_DATA_DIR = process.env.BASE_DATA_DIR || '/'

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'upload-b2' },
  transports: [
    new winston.transports.Console({
      level: 'debug',
      format: winston.format.simple()
    }),
    new winston.transports.File({ filename: 'error.log', level: 'error' })
  ]
})

const MAX_PART_SIZE = bytes('5 MB')
const MAX_HTTP_REQUESTS = 10

const B2_BUCKET_ID = process.env.B2_BUCKET_ID
const B2_APPLICATION_KEY_ID = process.env.B2_APPLICATION_KEY_ID
const B2_APPLICATION_KEY = process.env.B2_APPLICATION_KEY

/*
 * Returns data of saved image object
 * @returns {Promise} Promise object containing image
 */
const uploadFile = async (filename, mime, data) => {
  console.log('uploading file')
  const b2 = new B2({
    accountId: B2_APPLICATION_KEY_ID,
    applicationKey: B2_APPLICATION_KEY
  })
  await b2.authorize()

  logger.info('Authorized b2')

  const auth = await b2.getUploadUrl(B2_BUCKET_ID)
  const uploaded = await b2.uploadFile({
    uploadUrl: auth.data.uploadUrl,
    uploadAuthToken: auth.data.authorizationToken,
    fileName: filename,
    mime,
    data
  })

  logger.info('Uploaded single file to b2')

  return uploaded
}

const uploadPart = (b2, fileId) => {
  return async (buf, index) => {
    const profiler = logger.startTimer()

    const partNumber = index + 1

    logger.info(`Starting part: ${partNumber}`)

    let response = await b2.getUploadPartUrl({ fileId })

    const uploadURL = response.data.uploadUrl
    const authToken = response.data.authorizationToken

    logger.info(`ready to upload part: ${partNumber}`)

    response = await b2.uploadPart({
      partNumber,
      uploadUrl: uploadURL,
      uploadAuthToken: authToken,
      data: buf
    })

    profiler.done({ message: `Done uploading part: ${partNumber}` })

    return { fileId, partNumber }
  }
}

const uploadParts = async (filename, mime, data) => {
  const profiler = logger.startTimer()
  const b2 = new B2({
    accountId: B2_APPLICATION_KEY_ID,
    applicationKey: B2_APPLICATION_KEY
  })

  await b2.authorize()

  logger.info('Authorized b2')

  logger.info('Starting large file')

  const response = await b2.startLargeFile({
    bucketId: B2_BUCKET_ID,
    mime,
    fileName: filename
  })

  const fileId = response.data.fileId

  logger.info(fileId)

  const parts = splitSync(data, {
    bytes: '5M'
  })

  const promises = Promise.map(parts, uploadPart(b2, fileId), { concurrency: MAX_HTTP_REQUESTS })

  await Promise.all(promises)

  const uploaded = await b2.finishLargeFile({
    fileId,
    partSha1Array: parts.map(buf => shasum(buf))
  })

  profiler.done({ message: 'Done saving file(s)' })

  return uploaded
}

const uploadB2 = async (job) => {
  const { filename, filesize, mime } = job.data
  console.log('uploading', job.data)
  logger.info('Starting upload to b2')

  try {
    const data = await fs.readFile(path.join(BASE_DATA_DIR, `/data/media/incoming/${filename}`))

    if (filesize > MAX_PART_SIZE) { // 5 MB
      await uploadParts(filename, mime, data) // bigger files need to be splitted
    } else {
      await uploadFile(filename, mime, data)
    }

    return Promise.resolve()
  } catch (err) {
    return Promise.reject(err)
  }
}

module.exports = uploadB2
