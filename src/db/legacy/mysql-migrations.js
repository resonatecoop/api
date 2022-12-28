const { keyBy, uniq } = require('lodash')
const { Op } = require('sequelize')
const { User, Favorite, ShareTransaction, MembershipClass, UserMembership, Play, File, UserGroup, UserGroupType, UserGroupMember, Playlist, PlaylistItem, Track, TrackGroupItem, TrackGroup, Image, UserGroupLink, Resonate: sequelize } = require('../models')

// eslint-disable-next-line
function sleep (ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

// eslint-disable-next-line
const migratePlays = async (client) => {
  await Play.destroy({
    truncate: true,
    force: true
  })

  const usersGroupedByLegacyId = await groupUsersByLegacyId()

  const tracks = await Track.findAll({
    where: {
      legacyId: {
        [Op.not]: null
      }
    }
  })

  const tracksGroupedByLegacyId = keyBy(tracks, 'legacyId')
  await new Promise((resolve, reject) => {
    client.query('SELECT * FROM plays', async (error, results) => {
      if (error) reject(error)
      try {
        await Play.bulkCreate(results
          .map(r => ({
            id: r.pid,
            trackId: tracksGroupedByLegacyId[r.tid]?.id ?? null,
            userId: usersGroupedByLegacyId[r.uid]?.id ?? null,
            type: r.event ? 'paid' : 'free',
            createdAt: (new Date(r.date * 1000)).toDateString()
          })))
        console.log('done with plays')
        resolve()
      } catch (e) {
        console.log('e', e)
        reject(e)
      }
    })
  }).catch(e => {
    console.log('e', e)
  })
}

// eslint-disable-next-line
const migrateFiles = async (client) => {
  await File.destroy({
    truncate: true,
    force: true
  })
  const usersGroupedByLegacyId = await groupUsersByLegacyId()
  return new Promise((resolve, reject) => {
    client.query('SELECT * FROM files', async function (error, results, fields) {
      if (error) reject(error)

      try {
        const filtered = results
        // .filter(f => !!usersGroupedByLegacyId[f.owner_id])
        const files = await File.bulkCreate(filtered
          .map(file => ({
            id: file.id,
            filename: file.filename,
            filename_prefix: file.filename_prefix,
            // TODO: should this be linked to the UserGroup?
            ownerId: usersGroupedByLegacyId[file.owner_id]?.id ?? '00000000-0000-0000-0000-000000000000',
            description: file.description,
            size: file.size,
            hash: file.hash,
            status: file.status,
            mime: file.mime,
            metadata: file.metadata,
            updated_at: file.updated_at,
            created_at: file.created_at
          })))
        console.log('files', files.length)
      } catch (e) {
        console.log('error', e)
        reject(e)
      }
      console.log('done with files')
      resolve()
    })
  })
}

// eslint-disable-next-line
const fetchUserMeta = async (client, id) => {
  return new Promise((resolve, reject) => {
    client.query(`SELECT * FROM rsntr_usermeta WHERE user_id = ${id}`, async function (error, results, fields) {
      if (error) reject(error)

      resolve(results)
    })
  })
}

const buildUserGroup = async (client, legacyArtistId, newUser) => {
  const meta = await fetchUserMeta(client, legacyArtistId)
  if (meta && newUser) {
    const ug = await UserGroup.create({
      ownerId: newUser.id,
      typeId: meta.find(m => m.meta_key === 'role').meta_value === 'member' ? 1 : 2,
      displayName: meta.find(m => m.meta_key === 'nickname')?.meta_value,
      description: meta.find(m => m.meta_key === 'description')?.meta_value
    })
    return ug
  }
  return null
}

// eslint-disable-next-line
const fetchLegacyUsers = async (client, id) => {
  return new Promise((resolve, reject) => {
    client.query(`SELECT * FROM rsntr_user WHERE ID = ${id}`, async function (error, results, fields) {
      if (error) reject(error)

      resolve(results)
    })
  })
}

const statusValues = ['free+paid', 'hidden', 'free', 'paid', 'deleted']

// eslint-disable-next-line
const migrateTracks = async (client) => {
  await Track.destroy({
    truncate: true,
    force: true
  })

  let usersGroupedByLegacyId = await groupUsersByLegacyId()
  await new Promise((resolve, reject) => {
    client.query(`SELECT tracks.tid as tid, uid, track_artist, track_name, track_album, track_duration, track_url, track_cover_art, status, event, track_album_artist, track_composer, track_year, date, tagnames FROM tracks 
    LEFT JOIN tags t ON t.tid = tracks.tid
    `, async function (error, results, fields) {
      if (error) reject(error)

      const missingUserGroups = uniq(results.filter(r => {
        return !usersGroupedByLegacyId[r.uid]?.userGroups?.[0]
      }).map(r => r.uid))
      console.log('missingUserGroups', missingUserGroups)
      await Promise.all(missingUserGroups.map(legacyId =>
        buildUserGroup(client, legacyId, usersGroupedByLegacyId[legacyId])))
      console.log('generated new user groups')
      usersGroupedByLegacyId = await groupUsersByLegacyId()
      console.log('bulk generating tracks')
      await Track.bulkCreate(results.map(r => ({
        creatorId: usersGroupedByLegacyId[r.uid]?.userGroups?.[0]?.id,
        legacyId: r.tid,
        title: r.track_name,
        artist: r.track_artist,
        album: r.track_album,
        duration: +r.track_duration,
        album_artist: r.track_album_artist,
        composer: r.track_composer,
        year: r.track_year,
        url: r.track_url,
        cover_art: r.track_cover_art || r.track_cover_art !== '' ? r.track_cover_art : null,
        number: r.track_number,
        tags: r.tagnames?.split(','),
        status: statusValues[r.status]
      })))

      resolve()
    })
  })
}

const groupUsersByLegacyId = async () => {
  const users = await User.findAll({
    attributes: ['legacyId', 'id'],
    where: {
      legacyId: {
        [Op.not]: null
      }
    },
    include: [{
      model: UserGroup,
      as: 'userGroups'
    }]
  })

  return keyBy(users, 'legacyId')
}

// eslint-disable-next-line
const migrateTrackGroups = async (client, id) => {
  await TrackGroup.destroy({
    truncate: true,
    force: true
  })

  let usersGroupedByLegacyId = await groupUsersByLegacyId()

  return new Promise((resolve, reject) => {
    client.query(`SELECT * FROM track_groups 
    WHERE (type != 'playlist' or type IS NULL)`, async function (error, results, fields) {
      if (error) reject(error)

      const missingUserGroups = uniq(results.filter(r => !usersGroupedByLegacyId[r.creator_id]?.userGroups?.[0]).map(r => r.creator_id))
      console.log('missingUserGroups', missingUserGroups)
      await Promise.all(missingUserGroups.map(legacyId =>
        buildUserGroup(client, legacyId, usersGroupedByLegacyId[legacyId])))
      usersGroupedByLegacyId = await groupUsersByLegacyId()

      try {
        await TrackGroup.bulkCreate(results.map(r => ({
          id: r.id,
          cover: r.cover,
          title: r.title,
          slug: r.slug,
          type: r.type,
          about: r.about,
          private: r.private,
          display_artist: r.display_artist,
          creatorId: usersGroupedByLegacyId[r.creator_id]?.userGroups?.[0]?.id,
          composers: r.composers?.split(','),
          performers: r.performers?.split(','),
          tags: r.tags?.split(','),
          releaseDate: r.releaseDate,
          download: r.download,
          featured: r.featured,
          enabled: r.enabled,
          updatedAt: r.updated_at,
          createdAt: r.created_at
        })))
      } catch (e) {
        console.log(e)
        throw e
      }
      console.log('done migrating trackgroups')
      resolve(results)
    })
  })
}

// eslint-disable-next-line
const migratePlaylists = async (client) => {
  await Playlist.destroy({
    truncate: true,
    force: true
  })

  const usersGroupedByLegacyId = await groupUsersByLegacyId()

  return new Promise((resolve, reject) => {
    client.query('SELECT * FROM track_groups WHERE type = \'playlist\'', async function (error, results, fields) {
      if (error) reject(error)

      try {
        await Playlist.bulkCreate(results.map(r => ({
          id: r.id,
          cover: r.cover,
          title: r.title,
          about: r.about,
          private: r.private,
          creatorId: usersGroupedByLegacyId[r.creator_id]?.id,
          tags: r.tags?.split(','),
          featured: r.featured,
          updatedAt: r.updated_at,
          createdAt: r.created_at
        })))
      } catch (e) {
        console.log(e)
        throw e
      }
      console.log('done migrating playlists')
      resolve(results)
    })
  })
}

// eslint-disable-next-line
const migrateTrackGroupItems = async (client, id) => {
  await TrackGroupItem.destroy({
    truncate: true,
    force: true
  })

  const tracks = await Track.findAll({
    where: {
      legacyId: {
        [Op.not]: null
      }
    }
  })

  const tracksGroupedByLegacyId = keyBy(tracks, 'legacyId')

  return new Promise((resolve, reject) => {
    client.query(`SELECT tgi.id, tgi.index, track_group_id, track_id, track_performers, track_composers, tgi.updated_at, tgi.created_at FROM track_group_items tgi
    INNER JOIN track_groups tg
    ON tgi.track_group_id = tg.id
    AND (tg.type != 'playlist' or tg.type IS NULL)
    `, async function (error, results, fields) {
      if (error) reject(error)
      console.log('trackgroup_items result', results.length)
      try {
        await TrackGroupItem.bulkCreate(results
          // TODO: Some tracks' legacy artists don't exist in the user-api database because
          // they didn't have an e-mail associated with them.
          .filter(r => tracksGroupedByLegacyId[r.track_id])
          .map(r => {
            const trackId = tracksGroupedByLegacyId[r.track_id].id ?? null
            return {
              id: r.id,
              index: r.index,
              trackgroupId: r.track_group_id,
              trackId: trackId,
              track_performers: r.track_performers?.split(','),
              track_composers: r.track_composers?.split(','),
              updatedAt: r.updated_at,
              createdAt: r.created_at
            }
          }))
      } catch (e) {
        console.log(e)
        throw e
      }
      console.log('done migrating trackgroup_items')

      resolve(results)
    })
  })
}

// eslint-disable-next-line
const migratePlaylistItems = async (client, id) => {
  await PlaylistItem.destroy({
    truncate: true,
    force: true
  })

  const tracks = await Track.findAll({
    where: {
      legacyId: {
        [Op.not]: null
      }
    }
  })

  const tracksGroupedByLegacyId = keyBy(tracks, 'legacyId')

  return new Promise((resolve, reject) => {
    client.query(`SELECT tgi.id, tgi.index, track_group_id, track_id, track_performers, track_composers, tgi.updated_at, tgi.created_at FROM track_group_items tgi 
    INNER JOIN track_groups tg 
    ON tgi.track_group_id = tg.id 
    AND tg.type = 'playlist'
    `, async function (error, results, fields) {
      if (error) reject(error)
      // console.log('results', results)
      try {
        const totalResults = results
        // TODO: Some tracks' legacy artists don't exist in the user-api database because
        // they didn't have an e-mail associated with them.
          .filter(r => tracksGroupedByLegacyId[r.track_id])

        await PlaylistItem.bulkCreate(totalResults
          .map(r => {
            return {
              id: r.id,
              index: r.index,
              playlistId: r.track_group_id,
              trackId: tracksGroupedByLegacyId[r.track_id].id ?? null,
              updatedAt: r.updated_at,
              createdAt: r.created_at
            }
          }))
      } catch (e) {
        console.log(e)
        throw e
      }
      console.log('done migrating playlist items')

      resolve(results)
    })
  })
}

// eslint-disable-next-line
const migrateFavorites = async (client) => {
  await Favorite.destroy({
    truncate: true,
    force: true
  })

  const tracks = await Track.findAll({
    where: {
      legacyId: {
        [Op.not]: null
      }
    }
  })

  const tracksGroupedByLegacyId = keyBy(tracks, 'legacyId')

  const usersGroupedByLegacyId = await groupUsersByLegacyId()

  return new Promise((resolve, reject) => {
    client.query('SELECT * FROM favorites', async function (error, results, fields) {
      if (error) reject(error)

      try {
        await Favorite.bulkCreate(results
          .filter(r => usersGroupedByLegacyId[r.uid])
          .map(r => ({
            userId: usersGroupedByLegacyId[r.uid].id,
            trackId: tracksGroupedByLegacyId[r.tid].id,
            type: r.type
          })))
      } catch (e) {
        console.error('e', e)
        reject(e)
      }
      resolve()
    })
  })
}

// eslint-disable-next-line
const migrateImages = async (client) => {
  await Image.destroy({
    truncate: true,
    force: true
  })

  const usersGroupedByLegacyId = await groupUsersByLegacyId()

  return new Promise((resolve, reject) => {
    client.query('SELECT * FROM images', async function (error, results, fields) {
      if (error) reject(error)

      try {
        await Image.bulkCreate(results
          .filter(r => usersGroupedByLegacyId[r.uid])
          .map(r => ({
            id: r.iid,
            ownerId: usersGroupedByLegacyId[r.uid].id,
            name: r.name
          })))
      } catch (e) {
        console.error('e', e)
        reject(e)
      }
      console.log('done migrating images')
      resolve()
    })
  })
}

// eslint-disable-next-line
const migrateLinks = async (client) => {
  await UserGroupLink.destroy({
    truncate: true,
    force: true
  })

  const usersGroupedByLegacyId = await groupUsersByLegacyId()

  return new Promise((resolve, reject) => {
    client.query(`SELECT * FROM rsntr_usermeta WHERE meta_key 
      IN ('twitter', 'facebook', 'youtube', 'soundcloud', 'instagram', 'Website', 'VimeoMusicians')
    `, async function (error, results, fields) {
      if (error) reject(error)

      try {
        await UserGroupLink.bulkCreate(results
          .filter(r => usersGroupedByLegacyId[r.user_id]?.userGroups?.[0]?.id && r.meta_value !== '')
          .map(r => ({
            uri: r.meta_value,
            platform: r.meta_key,
            personalData: false,
            ownerId: usersGroupedByLegacyId[r.user_id].userGroups?.[0].id
          })))
      } catch (e) {
        console.error('e', e)
        reject(e)
      }
      resolve()
    })
  })
}

// eslint-disable-next-line
const migrateLabels = async (client) => {
  await UserGroupMember.destroy({
    truncate: true,
    force: true
  })
  const usersGroupedByLegacyId = await groupUsersByLegacyId()
  const types = await UserGroupType.findAll()
  const typeMap = keyBy(types, 'name')

  return new Promise((resolve, reject) => {
    client.query(`SELECT * FROM rsntr_usermeta WHERE meta_key IN ('mylabel')
    `, async function (error, results, fields) {
      if (error) reject(error)

      try {
        // First we need to create labels for everyone who claims to be a label
        const labelIds = uniq(results
          .filter(r => r !== '')
          .map(r => +r.meta_value)
          .filter(r => !isNaN(r)))
        console.log('labelIds', labelIds.length)

        await sequelize.query(`
          update user_groups 
          set type_id = ${typeMap.label.id}
          where user_groups.owner_id in (select id from users where legacy_id in (${labelIds.join(',')}))
        `)
        // Then we need to insert those connections into UserGroupMember
        await UserGroupMember.bulkCreate(results
          .filter(r => usersGroupedByLegacyId[r.user_id]?.userGroups?.[0]?.id &&
            r.meta_value !== '' &&
            !isNaN(+r.meta_value) &&
            usersGroupedByLegacyId[+r.meta_value]?.userGroups?.[0]?.id)
          .map(r => ({
            memberId: usersGroupedByLegacyId[r.user_id].userGroups?.[0].id,
            belongsToId: usersGroupedByLegacyId[+r.meta_value].userGroups?.[0].id
          })))
      } catch (e) {
        console.error('e', e)
        reject(e)
      }
      console.log('added labels')
      resolve()
    })
  })
}

// eslint-disable-next-line
const migrateBands = async (client) => {
  const types = await UserGroupType.findAll()
  const typeMap = keyBy(types, 'name')

  const usersGroupedByLegacyId = await groupUsersByLegacyId()

  return new Promise((resolve, reject) => {
    client.query(`SELECT * FROM rsntr_usermeta WHERE meta_key IN ('mybands')
    `, async function (error, results, fields) {
      if (error) reject(error)

      try {
        // First we need to create labels for everyone who claims to be a label
        const bandIds = uniq(results
          .filter(r => r !== '')
          .reduce((array, r) => {
            const value = r.meta_value.match(/"(\d*)"/g)
            const newValue = value?.map(v => +(v.replace(/"/g, '')))
            const newArray = array.concat(...newValue ?? [])
            return newArray
          }, [])
          .filter(r => !isNaN(r)))
        console.log('bandIds', bandIds.length)

        await sequelize.query(`
          update user_groups
          set type_id = ${typeMap.band.id}
          where user_groups.owner_id in (select id from users where legacy_id in (${bandIds.join(',')}))
        `)
        // Then we need to insert those connections into UserGroupMember
        const bandRelations = results
          .filter(r => {
            return usersGroupedByLegacyId[r.user_id]?.userGroups?.[0]?.id &&
              r.meta_value !== ''
          })
          .reduce((array, r) => {
            const value = r.meta_value.match(/"(\d*)"/g)
            const newValue = value?.map(v => +(v.replace(/"/g, ''))) ?? []
            const newArray = array.concat(...newValue.map(v => ({ bandId: v, userId: r.user_id })))

            return newArray.filter(relation => usersGroupedByLegacyId[relation.bandId]?.userGroups?.[0]?.id)
          }, [])
          .map(r => {
            return {
              memberId: usersGroupedByLegacyId[r.userId].userGroups?.[0].id,
              belongsToId: usersGroupedByLegacyId[r.bandId].userGroups?.[0].id
            }
          })
        console.log('bandRelations', bandRelations.length)
        await UserGroupMember.bulkCreate(bandRelations)
      } catch (e) {
        console.error('e', e)
        reject(e)
      }
      console.log('added bands')
      resolve()
    })
  })
}

// eslint-disable-next-line
// THIS migration looks like it contains duplicate information from the 
// GF form one
// const migrateMemberOrders = async (client) => {
//   const usersGroupedByLegacyId = await groupUsersByLegacyId()

//   return new Promise((resolve, reject) => {
//     client.query(`SELECT * FROM member_orders
//     `, async function (error, results, fields) {
//       if (error) reject(error)

//       try {
//         ShareTransaction.bulkCreate(results
//           .filter(r => usersGroupedByLegacyId[r.uid] && r.shares > 0 && r.status === 1)
//           .map(r => ({
//             userId: usersGroupedByLegacyId[r.uid].id,
//             quantity: r.shares,
//             legacySource: 'member_orders',
//             invoiceId: r.txid,
//             updatedAt: r.date,
//             createdAt: r.date
//           })))
//       } catch (e) {
//         console.error('e', e)
//         reject(e)
//       }
//       console.log('added **old** share transactions')
//       resolve()
//     })
//   })
// }

// eslint-disable-next-line
const migrateGFEntryShares = async (client) => {
  await ShareTransaction.destroy({
    truncate: true,
    force: true,
    where: {
      legacyTransactionId: {
        [Op.not]: null
      }
    }
  })
  const usersGroupedByLegacyId = await groupUsersByLegacyId()

  return new Promise((resolve, reject) => {
    client.query(`SELECT * FROM rsntr_gf_entry
      WHERE form_id = 45
    `, async function (error, results, fields) {
      if (error) reject(error)

      try {
        ShareTransaction.bulkCreate(results
          .filter(r => usersGroupedByLegacyId[r.created_by] &&
            r.payment_status === 'Paid')
          .map(r => ({
            userId: usersGroupedByLegacyId[r.created_by].id,
            quantity: r.payment_amount,
            legacySource: 'rsntr_gf_entry-formid:45',
            invoiceId: r.transaction_id,
            updatedAt: r.date_created,
            createdAt: r.date_created
          })))
      } catch (e) {
        console.error('e', e)
        reject(e)
      }
      console.log('added share transactions')
      resolve()
    })
  })
}

// eslint-disable-next-line
const migrateGFEntryMembers = async (client) => {
  const usersGroupedByLegacyId = await groupUsersByLegacyId()
  const membershipClass = await MembershipClass.findOne({ where: { name: 'Listener' } })

  return new Promise((resolve, reject) => {
    client.query(`SELECT * FROM rsntr_gf_entry
      WHERE form_id = 35
    `, async function (error, results, fields) {
      if (error) reject(error)

      const members = results
        .filter(r => usersGroupedByLegacyId[r.created_by] &&
        r.payment_status === 'Paid')
      try {
        UserMembership.bulkCreate(members
          .map(r => ({
            userId: usersGroupedByLegacyId[r.created_by].id,
            membershipClassId: membershipClass.id,
            legacySource: 'rsntr_gf_entry-formid:35',
            subscriptionId: r.transaction_id,
            updatedAt: r.date_created,
            createdAt: r.date_created
            //     start: '???',
            //     end: '???'
          })))
      } catch (e) {
        console.error('e', e)
        reject(e)
      }
      console.log('added members', members.length)
      resolve()
    })
  })
}

// eslint-disable-next-line
const migrateDescriptions = async (client) => {
  const usersGroupedByLegacyId = await groupUsersByLegacyId()

  return new Promise((resolve, reject) => {
    client.query(`SELECT * FROM rsntr_usermeta
      WHERE meta_key = 'description'
      AND meta_value != ''
    `, async function (error, results, fields) {
      if (error) reject(error)
      try {
        const filtered = results.filter(r => !!usersGroupedByLegacyId[r.user_id])
        console.log('length of descriptions', filtered.length)
        await Promise.all(filtered.map(r => {
          return UserGroup.update({
            description: r.meta_value
          }, {
            where: {
              ownerId: usersGroupedByLegacyId[r.user_id].id,
              description: ''
            }
          })
        }))
        console.log('done updating descriptions')
      } catch (e) {
        console.error('e', e)
        reject(e)
      }
      resolve()
    })
  })
}

module.exports = async (client) => {
  console.log('migrating')
  await migrateTracks(client)
  await migratePlaylists(client)
  await migratePlaylistItems(client)
  await migrateTrackGroups(client)
  await migrateTrackGroupItems(client)
  await migrateFavorites(client)
  await migrateFiles(client)
  await migratePlays(client)
  await migrateImages(client)
  await migrateLinks(client)
  await migrateLabels(client)
  await migrateBands(client)
  // await migrateMemberOrders(client)
  await migrateGFEntryShares(client)
  await migrateGFEntryMembers(client)
  await migrateDescriptions(client)
}
