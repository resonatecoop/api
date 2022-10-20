const { Resonate: sequelize, Play } = require('../../db/models')
const { createLogger } = require('../../util/logger')
const { Op } = require('sequelize')
const RawQuery = require('../../util/query')

const logger = createLogger({ service: 'earnings-report' })
const rawQueryBuilder = RawQuery(sequelize)

/**
 * @description Returns uids of all listeners for the period
 * @param {String} startDate ISO 8601 date format (ex: 2019-09-01)
 * @param {String} endDate ISO 8601 date format (ex: 2019-10-01)
 * @param {Number} creatorId Artist or label id
 * @param {Boolean} isLabel Is the creator a label? Default:false
 * @returns {Array} Listeners ids
 */

const findAllListeners = async (startDate, endDate, creatorId, isLabel = false) => {
  const subQueryOptions = {
    attributes: ['tid'],
    where: {
      uid: creatorId
    }
  }

  if (isLabel) {
    const subQueryLabelArtists = sequelize.dialect.queryGenerator.selectQuery('rsntr_usermeta', {
      attributes: ['user_id'],
      where: {
        meta_key: 'mylabel',
        meta_value: creatorId
      }
    }).slice(0, -1)

    subQueryOptions.where.uid = {
      [Op.in]: sequelize.literal('(' + subQueryLabelArtists + ')')
    }
  }

  const subQuery = sequelize.dialect.queryGenerator.selectQuery('tracks', subQueryOptions).slice(0, -1)

  const queryOptions = {
    attributes: [
      [sequelize.fn('DISTINCT', sequelize.col('uid')), 'id']
    ],
    where: {
      event: 1,
      user_id: {
        [Op.notIn]: [0, creatorId]
      },
      date: {
        [Op.gt]: sequelize.fn('UNIX_TIMESTAMP', startDate),
        [Op.lt]: sequelize.fn('UNIX_TIMESTAMP', endDate)
      },
      track_id: {
        [Op.in]: sequelize.literal('(' + subQuery + ')')
      }
    },
    raw: true
  }

  const result = await Play.findAll(queryOptions)

  const listeners = result.map(item => item.id)

  logger.info(`found ${listeners.length} listeners for period ${startDate} to ${endDate}`)

  return listeners
}

/**
 * @param {String} startDate ISO 8601 date format (ex: 2019-09-01)
 * @param {String} endDate ISO 8601 date format (ex: 2019-10-01)
 * @param {Number} creatorId Optional artist id
 *
 * @description Report all artists earnings between two dates, grouped by date (no tracks data)
 * @returns {Array}
 */

const findOneArtistEarningsByDate = async (startDate, endDate, creatorId, format = '%Y-%m', isLabel) => {
  const listeners = await findAllListeners(startDate, endDate, creatorId, isLabel)

  // for each listeners we calculate revenues per track
  return sequelize.transaction((t) => {
    return Promise.all(listeners.map(listenerId => rawQueryBuilder(
      `
        SELECT
          FROM_UNIXTIME(play.date, :format) as d,
          IF(count(play.tid) > 8, 9, count(play.tid)) as plays,
          play.tid as track_id,
          play.uid as listener_id,
          (SELECT rs_set_cost(count(pid), IF(count(play.tid) > 8, 9, count(play.tid))) FROM plays WHERE uid = :listenerId AND date < play.date AND event = 1 AND tid = track.tid) AS earned,
          (SELECT rs_set_cost(count(pid), IF(count(play.tid) > 8, 9, count(play.tid))) * 0.3 / 1022 * 1.25 FROM plays WHERE uid = :listenerId AND date < play.date AND event = 1 AND tid = track.tid) AS resonate_total_eur,
          (SELECT rs_set_cost(count(pid), IF(count(play.tid) > 8, 9, count(play.tid))) * 0.3 FROM plays WHERE uid = :listenerId AND date < play.date AND event = 1 AND tid = track.tid) AS resonate_total,
          (SELECT rs_set_cost(count(pid), IF(count(play.tid) > 8, 9, count(play.tid))) * 0.7 / 1022 * 1.25 FROM plays WHERE uid = :listenerId AND date < play.date AND event = 1 AND tid = track.tid) AS artist_total_eur,
          (SELECT rs_set_cost(count(pid), IF(count(play.tid) > 8, 9, count(play.tid))) * 0.7 FROM plays WHERE uid = :listenerId AND date < play.date AND event = 1 AND tid = track.tid) AS artist_total
        FROM plays as play
        INNER JOIN tracks as track ON(track.tid = play.tid)
        WHERE play.event = 1
        ${isLabel ? 'AND track.uid IN (SELECT user_id FROM rsntr_usermeta WHERE meta_key = "mylabel" AND meta_value = :creatorId)' : 'AND track.uid = :creatorId'}
        AND play.date > UNIX_TIMESTAMP(:startDate) AND play.date < UNIX_TIMESTAMP(:endDate)
        AND play.uid = :listenerId
        AND play.uid != :creatorId
        GROUP BY FROM_UNIXTIME(play.date, :format), play.date, play.tid
        HAVING count(play.tid) <= 9
        ORDER BY d DESC
      `, { format, listenerId, creatorId, startDate, endDate }
    )))
  }).catch((err) => {
    logger.error(err)
  })
}

/**
 * @param {String} startDate ISO 8601 date format (ex: 2019-09-01)
 * @param {String} endDate ISO 8601 date format (ex: 2019-10-01)
 * @param {Number} creatorId User id (artist or label)
 * @param {Boolean} isLabel If the member is a label or not
 *
 * @description Report all artists earnings between two dates grouped by tracks
 * @returns {Array}
 */

const findOneArtistEarnings = async (startDate, endDate, creatorId, isLabel) => {
  const listeners = await findAllListeners(startDate, endDate, creatorId, isLabel)

  // for each listeners we calculate revenues per track
  return sequelize.transaction((t) => {
    return Promise.all(listeners.map(listenerId => rawQueryBuilder(
      `
        SELECT
          IF(count(play.tid) > 8, 9, count(play.tid)) as plays,
          play.tid as track_id,
          um.meta_value as artist,
          um2.meta_value as label,
          track.track_name as track_title,
          track.track_album,
          play.uid as listener_id,
          track.uid as artist_id,

          (SELECT rs_set_cost(count(pid), IF(count(play.tid) > 8, 9, count(play.tid))) FROM plays WHERE uid = :listenerId AND date < play.date AND event = 1 AND tid = track.tid) AS earned,
          (SELECT rs_set_cost(count(pid), IF(count(play.tid) > 8, 9, count(play.tid))) * 0.3 / 1022 * 1.25 FROM plays WHERE uid = :listenerId AND date < play.date AND event = 1 AND tid = track.tid) AS resonate_total_eur,
          (SELECT rs_set_cost(count(pid), IF(count(play.tid) > 8, 9, count(play.tid))) * 0.3 FROM plays WHERE uid = :listenerId AND date < play.date AND event = 1 AND tid = track.tid) AS resonate_total,
          (SELECT rs_set_cost(count(pid), IF(count(play.tid) > 8, 9, count(play.tid))) * 0.7 / 1022 * 1.25 FROM plays WHERE uid = :listenerId AND date < play.date AND event = 1 AND tid = track.tid) AS artist_total_eur,
          (SELECT rs_set_cost(count(pid), IF(count(play.tid) > 8, 9, count(play.tid))) * 0.7 FROM plays WHERE uid = :listenerId AND date < play.date AND event = 1 AND tid = track.tid) AS artist_total

        FROM plays as play
        INNER JOIN tracks as track ON(track.tid = play.tid)
        LEFT JOIN rsntr_usermeta as um ON(track.uid = um.user_id and um.meta_key = 'nickname')
        LEFT JOIN rsntr_usermeta as um2 ON(track.uid = um2.user_id and um2.meta_key = 'mylabel')
        WHERE play.event = 1
        ${isLabel ? 'AND track.uid IN (SELECT user_id FROM rsntr_usermeta WHERE meta_key = "mylabel" AND meta_value = :creatorId)' : 'AND track.uid = :creatorId'}
        AND play.date > UNIX_TIMESTAMP(:startDate) AND play.date < UNIX_TIMESTAMP(:endDate)
        AND play.uid = :listenerId
        AND play.uid != :creatorId
        GROUP BY play.date, play.tid, um.meta_value, um2.meta_value
        HAVING COUNT(play.tid) <= 9
      `, { listenerId, creatorId, startDate, endDate }
    )))
  }).catch((err) => {
    logger.error(err)
  })
}

module.exports = {
  findOneArtistEarnings,
  findOneArtistEarningsByDate
}
// export default findOneArtistEarnings
