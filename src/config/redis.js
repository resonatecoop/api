
const REDIS_CONFIG = {
  port: process.env.REDIS_PORT || 6379,
  host: process.env.REDIS_HOST || '127.0.0.1',
  password: process.env.REDIS_PASSWORD
}

module.exports.REDIS_CONFIG = REDIS_CONFIG
