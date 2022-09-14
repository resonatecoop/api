const { groupBy, keyBy } = require('lodash')
const { Op } = require('sequelize')
const { User, Favorite, Play, File } = require('../models')

// eslint-disable-next-line
function sleep (ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

// eslint-disable-next-line
const migrateFavorites = async (client) => {
  await Favorite.destroy({
    truncate: true
  })

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

// eslint-disable-next-line
const migratePlays = async (client) => {
  await Play.destroy({
    truncate: true
  })

  const users = await User.findAll({
    where: {
      legacyId: {
        [Op.not]: null
      }
    }
  })

  const usersGroupedByLegacyId = keyBy(users, 'legacyId')
  await new Promise((resolve, reject) => {
    client.query('SELECT * FROM plays', async (error, results) => {
      if (error) reject(error)

      try {
        await Play.bulkCreate(results
          .map(r => ({
            id: r.pid,
            trackId: r.tid,
            userId: usersGroupedByLegacyId[r.uid]?.id ?? null,
            type: r.event ? 'paid' : 'free',
            createdAt: r.date
          })))
        console.log('done')
        resolve()
      } catch (e) {
        console.log('e', e)
        reject(e)
      }
    })
  })
}

// eslint-disable-next-line
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

// eslint-disable-next-line
const migrateTags = async (client) => {
  return new Promise((resolve, reject) => {
    client.query('SELECT * FROM tags LIMIT 2', function (error, results, fields) {
      if (error) reject(error)

      console.log('tags', results)
    })
  })
}

// eslint-disable-next-line
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
