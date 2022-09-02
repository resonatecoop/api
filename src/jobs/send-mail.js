const winston = require('winston')
const path = require('path')
const nodemailer = require('nodemailer')
const mailgun = require('nodemailer-mailgun-transport')
const Email = require('email-templates')

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'cleanup' },
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

const viewsDir = path.join(__dirname, '../../emails')

/**
 * Cleanup incoming folder and more (later)
 */

const sendMail = async (job) => {
  try {
    const email = new Email({
      message: {
        from: `"Resonate" <${process.env.MAILGUN_SENDER}>`
      },
      juice: true,
      send: true,
      juiceResources: {
        preserveImportant: true,
        webResources: {
          relativeTo: path.resolve(viewsDir)
        }
      },
      transport: nodemailer.createTransport(mailgun({
        auth: {
          api_key: process.env.MAILGUN_API_KEY,
          domain: process.env.MAILGUN_DOMAIN
        }
      }))
    })

    await email.send({
      template: job.data.template,
      message: job.data.message,
      locals: job.data.locals
    })

    logger.info('Email sent')

    return Promise.resolve()
  } catch (err) {
    return Promise.reject(err)
  }
}

module.exports = sendMail
