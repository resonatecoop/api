const winston = require('winston')

/**
 * @description Create a winston logger instance
 * @param {Object} options
 */

const createLogger = (options) => {
  const {
    level = {
      production: 'error',
      development: 'info',
      test: 'debug'
    }[process.env.NODE_ENV],
    format = winston.format,
    service = 'resonate-logger'
  } = options

  const filename = {
    test: 'error.test.log'
  }[process.env.NODE_ENV] || 'error.log'

  const logger = winston.createLogger({
    level: level,
    format: format,
    defaultMeta: { service: service },
    transports: [
      new winston.transports.File({
        filename: filename,
        level: 'error'
      })
    ]
  })

  if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
      level: level,
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }))
  }

  return logger
}

module.exports = { createLogger, winston }
