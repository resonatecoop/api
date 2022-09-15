const { groupBy, keyBy } = require('lodash')
const { Op } = require('sequelize')
const { User, Favorite, Play, File, UserGroup, Track } = require('../models')

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
const fetchUserMeta = async (client, id) => {
  return new Promise((resolve, reject) => {
    client.query(`SELECT * FROM rsntr_usermeta WHERE user_id = ${id}`, function (error, results, fields) {
      if (error) reject(error)

      resolve(results)
    })
  })
}

// eslint-disable-next-line
const migrateTracks = async (client) => {
  Track.destroy({
    truncate: true
  })
  const users = await User.findAll({
    where: {
      legacyId: {
        [Op.not]: null
      }
    },
    include: [{
      model: UserGroup,
      as: 'user_groups'
    }]
  })
  const usersGroupedByLegacyId = keyBy(users, 'legacyId')
  // console.log('users', users)
  const usersWithoutGroups = keyBy(users.filter(u => u.user_groups.length !== 0), 'legacyId')
  console.log('usersGroupedByLegacyId', Object.keys(usersWithoutGroups).length)

  await new Promise((resolve, reject) => {
    client.query('SELECT * FROM tracks WHERE status != 4 LIMIT 1', async function (error, results, fields) {
      if (error) reject(error)
      const tracksGroupedByArtist = groupBy(results, 'uid')
      await Promise.all(Object.keys(tracksGroupedByArtist).map(async legacyArtistId => {
        const artistTracks = tracksGroupedByArtist[legacyArtistId]
        console.log('legacyArtistId', legacyArtistId)
        let user = usersWithoutGroups[legacyArtistId]?.get({ plain: true })
        if (!user) {
          console.log('user_group does not exist', legacyArtistId)
          user = usersGroupedByLegacyId[legacyArtistId].get({ plain: true })
          // We have to create this user woop woop
          // Fetch user_meta
          const meta = await fetchUserMeta(client, legacyArtistId)
          console.log('meta', meta)
          if (meta) {
            const ug = await UserGroup.create({
              ownerId: user.id,
              typeId: 1,
              displayName: meta.find(m => m.meta_key === 'nickname')?.meta_value,
              description: meta.find(m => m.meta_key === 'description')?.meta_value
            })

            console.log('artistTracks', artistTracks)

            try {
              await Track.bulkCreate(artistTracks.map(r => ({
                creatorId: ug.id,
                title: r.track_name,
                artist: r.track_artist,
                album: r.track_album,
                duration: +r.track_duration,
                album_artist: r.track_album_artist,
                composer: r.track_composer,
                year: r.track_year,
                url: r.track_url,
                cover_art: r.track_cover_art,
                number: r.track_number,
                status: r.status
              })))
            } catch (e) {
              console.log('e', e)
            }
          }
        } else {
          // console.log('user_group exists for user', legacyArtistId)
          user = usersGroupedByLegacyId[legacyArtistId].get({ plain: true })
          const ug = user.user_groups[0]
          try {
            await Track.bulkCreate(artistTracks.map(r => ({
              creatorId: ug.id,
              title: r.track_name,
              artist: r.track_artist,
              album: r.track_album,
              duration: +r.track_duration,
              album_artist: r.track_album_artist,
              composer: r.track_composer,
              year: r.track_year,
              url: r.track_url,
              cover_art: r.track_cover_art,
              number: r.track_number,
              status: r.status
            })))
          } catch (e) {
            console.log('e', e)
          }
        }
        // await Promise.all(tracksGroupedByArtist[legacyArtistId].map(result => {

        // }))
      }))
      resolve()

      // console.log('tracks', results)
    })
  })
}

/**
 * Because apparently the user group migrations weren't done
 */
// const migrateUsers = async (client) => {
//   const users = await User.findAll({
//     where: {
//       legacyId: {
//         [Op.not]: null
//       }
//     },
//     include: [{
//       model: UserGroup,
//       as: 'user_groups'
//     }]
//   })
//   const usersWithoutGroups = keyBy(users.filter(u => u.user_groups.length === 0), 'legacyId')

// }

module.exports = async (client) => {
  // await migrateFavorites(client)
  // await migratePlays(client)
  // await migrateFiles(client)
  // TODO copy over tag
  // await migrateUsers(client)
  await migrateTracks(client)
  // await migrateTags(client)
  // TODO copy over image
  // TODO copy over links from rsntr_user_meta
  // TODO copy over track_group_item
  // TODO copy over track_group
  // TODO copy over track
}
