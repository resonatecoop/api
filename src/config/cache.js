const Redis = require('ioredis')
const NodeCache = require('node-cache')
const ms = require('ms')
const safeStringify = require('fast-safe-stringify')

const redisConfig = require('./redis')

const CACHE_MAX_AGE = process.env.NODE_ENV === 'production' ? ms('3h') : 0
const CACHE_MAX_AGE_SEC = CACHE_MAX_AGE / 1000

const cleanKey = (key) => {
  const url = new URL(key, 'http://localhost')
  const params = new URLSearchParams(url.search)

  params.delete('client_id')

  return url.pathname + url.search
}

const memoryCache = new NodeCache({ stdTTL: 100, checkperiod: 120 })
const redis = new Redis(Object.assign(redisConfig, {
  keyPrefix: Date.now().toString(),
  lazyConnect: process.env.NODE_ENV !== 'production' // avoid loading redis in development, especially if connection is remote
}))

redis.on('connect', () => console.log('redis connected'))

module.exports = (env) => {
  return {
    development: {
      maxAge: CACHE_MAX_AGE,
      compression: true, // https://github.com/koajs/cash#compression
      setCachedHeader: true, // https://github.com/koajs/cash#setcachedheader
      get (key, maxAge) {
        const value = memoryCache.get(cleanKey(key))

        return Promise.resolve(value)
      },
      set (key, value) {
        memoryCache.set(cleanKey(key), value, CACHE_MAX_AGE_SEC)

        return Promise.resolve()
      }
    },
    test: {
      maxAge: CACHE_MAX_AGE,
      compression: true, // https://github.com/koajs/cash#compression
      setCachedHeader: true, // https://github.com/koajs/cash#setcachedheader
      get (key, maxAge) {
        const value = memoryCache.get(cleanKey(key))

        return Promise.resolve(value)
      },
      set (key, value) {
        memoryCache.set(cleanKey(key), value, CACHE_MAX_AGE_SEC)

        return Promise.resolve()
      }
    },
    production: {
      maxAge: CACHE_MAX_AGE,
      threshold: 0,
      compression: true, // https://github.com/koajs/cash#compression
      setCachedHeader: true, // https://github.com/koajs/cash#setcachedheader
      async get (key, maxAge) {
        let value
        try {
          value = await redis.get(cleanKey(key))
          if (value) value = JSON.parse(value)

          return Promise.resolve(value)
        } catch (err) {
          return Promise.reject(err)
        }
      },
      async set (key, value, maxAge) {
        if (maxAge <= 0) return redis.set(key, safeStringify(value))

        return redis.set(cleanKey(key), safeStringify(value), 'EX', maxAge / 1000)
      }
    }
  }[env || process.env.NODE_ENV || 'development']
}
