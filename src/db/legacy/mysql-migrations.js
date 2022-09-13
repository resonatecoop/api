const { keyBy, groupBy } = require('lodash')
const { Op } = require('sequelize')
const { User, Favorite, Play, File } = require('../models')

function sleep (ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

const migrateFavorites = async (client) => {
  return new Promise((resolve, reject) => {
    client.query('SELECT * FROM favorites', function (error, results, fields) {
      if (error) reject(error)

      resolve(Promise.all(results.map(async result => {
        try {
          const user = await User.findOne({
            where: {
              legacyId: result.uid
            }
          })
          if (user) {
            const [favorite, newlyCreated] = await Favorite.findOrCreate({
              where: {
                userId: user.id,
                trackId: result.tid
              },
              defualts: {
                userId: user.id,
                trackId: result.tid,
                type: result.type
              }
            })
            console.log('created FAVORITE', favorite.userId, favorite.trackId, newlyCreated)
          } else {
            console.log('did not find user for', result.uid)
          }
        } catch (e) {
          console.log('error CREATING FAVORITE', e, result)
          throw e
        }
      })))
    })
  })
}

/**
 * Rewrite these to be more efficient. Takes way too long.
 */
const playsCallback = async (user, results) => {
  await sleep(200)
  try {
    const mapped = results.map(r => ({
      id: r.pid,
      trackId: r.tid,
      userId: user.id,
      type: r.event ? 'paid' : 'free',
      createdAt: r.date
    }))
    await Play.bulkCreate(mapped)
    console.log('created PLAY', user.legacyId, results.length)
  } catch (e) {
    if (e.errors?.[0].message.includes('id must be unique')) {
      console.log('ALREADY PROCESSED', user.legacyId)
    } else {
      console.log('error CREATING PLAY', e)
      throw (e)
    }
  }
}

const migratePlays = async (client) => {
  const users = await User.findAll({
    where: {
      legacyId: {
        [Op.not]: null
      }
    },
    limit: 10000,
    offset: 19900
  })
  await Promise.all(users.map(async user => {
    await new Promise((resolve, reject) => {
      client.query(`SELECT * FROM plays WHERE uid = ${user.legacyId}`, (error, results) => {
        if (error) reject(error)
        if (results.length > 0) {
          resolve(playsCallback(user, results))
        }
      })
    })
  }))
}

const migrateFiles = async (client) => {
  return new Promise((resolve, reject) => {
    client.query('SELECT * FROM files', function (error, results, fields) {
      if (error) reject(error)

      const owners = groupBy(results, 'owner_id')
      resolve(Promise.all(Object.keys(owners).map(async legacyId => {
        const owner = await User.findOne({
          where: {
            legacyId: legacyId
          }
        })

        if (owner) {
          try {
            await File.bulkCreate(owners[legacyId].map(file => ({
              filename: file.filename,
              filename_prefix: file.filename_prefix,
              owner_id: owner.id,
              description: file.description,
              size: file.size,
              hash: file.hash,
              status: file.status,
              mime: file.mime,
              metadata: file.metadata,
              updated_at: file.updated_at,
              created_at: file.created_at
            })))
          } catch (e) {
            console.log('error', e)
          }
        }
      })))
    })
  })
}

const migrateTags = async (client) => {
  return new Promise((resolve, reject) => {
    client.query('SELECT * FROM tags LIMIT 2', function (error, results, fields) {
      if (error) reject(error)

      console.log('tags', results)
    })
  })
}

const migrateTracks = async (client) => {
  await new Promise((resolve, reject) => {
    client.query('SELECT * FROM tracks LIMIT 2', function (error, results, fields) {
      if (error) reject(error)

      console.log('tracks', results)
    })
  })

  await new Promise((resolve, reject) => {
    client.query('SELECT * FROM tracks LIMIT 2', function (error, results, fields) {
      if (error) reject(error)

      console.log('tracks', results)
    })
  })
}

module.exports = async (client) => {
  // await migrateFavorites(client)
  // WARNING: this one should only be run once! And can we figure it out to be more efficient?
  // await migratePlays(client)
  // await migrateFiles(client)
  // TODO copy over tag
  await migrateTracks(client)
  // await migrateTags(client)
  // TODO copy over image
  // TODO copy over links from rsntr_user_meta
  // TODO copy over track_group_item
  // TODO copy over track_group
  // TODO copy over track
}
