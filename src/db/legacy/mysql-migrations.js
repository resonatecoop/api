const { keyBy, uniq } = require('lodash')
const { Op } = require('sequelize')
const { User, Favorite, Play, File, UserGroup, UserGroupType, UserGroupMember, Playlist, PlaylistItem, Track, TrackGroupItem, TrackGroup, Image, UserGroupLink, Resonate: sequelize } = require('../models')

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
            createdAt: r.date
          })))
        console.log('done with plays')
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
  const usersGroupedByLegacyId = await groupUsersByLegacyId()

  return new Promise((resolve, reject) => {
    client.query('SELECT * FROM files', async function (error, results, fields) {
      if (error) reject(error)

      try {
        await File.bulkCreate(results
          .filter(f => !!usersGroupedByLegacyId[f.owner_id])
          .map(file => ({
            filename: file.filename,
            filename_prefix: file.filename_prefix,
            // TODO: should this be linked to the UserGroup?
            owner_id: usersGroupedByLegacyId[file.owner_id].id,
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
        return !usersGroupedByLegacyId[r.uid]?.user_groups?.[0]
      }).map(r => r.uid))
      console.log('missingUserGroups', missingUserGroups)
      await Promise.all(missingUserGroups.map(legacyId =>
        buildUserGroup(client, legacyId, usersGroupedByLegacyId[legacyId])))
      console.log('generated new user groups')
      usersGroupedByLegacyId = await groupUsersByLegacyId()
      console.log('bulk generating tracks')
      Track.bulkCreate(results.map(r => ({
        creatorId: usersGroupedByLegacyId[r.uid]?.user_groups?.[0]?.id,
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
    client.query('SELECT * FROM track_groups WHERE type != \'playlist\'', async function (error, results, fields) {
      if (error) reject(error)

      const missingUserGroups = uniq(results.filter(r => !usersGroupedByLegacyId[r.creator_id]?.user_groups?.[0]).map(r => r.creator_id))
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
          creatorId: usersGroupedByLegacyId[r.creator_id]?.user_groups?.[0]?.id,
          composers: r.composers?.split(','),
          performers: r.performers?.split(','),
          tags: r.tags?.split(','),
          release_date: r.release_date,
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
    AND tg.type != 'playlist'
    `, async function (error, results, fields) {
      if (error) reject(error)
      console.log('result', results.length)
      try {
        await TrackGroupItem.bulkCreate(results
          // TODO: Some tracks' legacy artists don't exist in the user-api database because
          // they didn't have an e-mail associated with them.
          .filter(r => tracksGroupedByLegacyId[r.track_id])
          .map(r => {
            return {
              id: r.id,
              index: r.index,
              trackgroupId: r.track_group_id,
              track_id: tracksGroupedByLegacyId[r.track_id].id ?? null,
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
      try {
        await PlaylistItem.bulkCreate(results
          // TODO: Some tracks' legacy artists don't exist in the user-api database because
          // they didn't have an e-mail associated with them.
          .filter(r => tracksGroupedByLegacyId[r.track_id])
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
          .filter(r => usersGroupedByLegacyId[r.user_id]?.user_groups?.[0]?.id && r.meta_value !== '')
          .map(r => ({
            uri: r.meta_value,
            platform: r.meta_key,
            personalData: false,
            ownerId: usersGroupedByLegacyId[r.user_id].user_groups?.[0].id
          })))
      } catch (e) {
        console.error('e', e)
        reject(e)
      }
      resolve()
    })
  })
}

const migrateLabels = async (client) => {
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
          .filter(r => usersGroupedByLegacyId[r.user_id]?.user_groups?.[0]?.id &&
            r.meta_value !== '' &&
            !isNaN(+r.meta_value) &&
            usersGroupedByLegacyId[+r.meta_value]?.user_groups?.[0]?.id)
          .map(r => ({
            memberId: usersGroupedByLegacyId[r.user_id].user_groups?.[0].id,
            belongsToId: usersGroupedByLegacyId[+r.meta_value].user_groups?.[0].id
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

module.exports = async (client) => {
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
}
