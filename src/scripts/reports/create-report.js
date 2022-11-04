const mapLimit = require('awaity/mapLimit')
const { Resonate: sequelize, Track, Play } = require('../../db/models')
const { Op } = require('sequelize')
const { findOneArtistEarnings } = require('./earnings')
const { createLogger } = require('../../util/logger')

const logger = createLogger({ service: 'create-report' })

/**
 * @description Return all artist earnings for a given period
 * @param {String} start ISO 8601 date format (ex: 2019-09-01)
 * @param {String} end ISO 8601 date format (ex: 2019-10-01)
 */

async function findAllArtistEarnings (start, end) {
  const result = await Play.findAll({
    attributes: [
      [sequelize.fn('DISTINCT', sequelize.col('track.uid')), 'creatorId']
    ],
    include: [
      {
        model: Track,
        required: true,
        attributes: ['uid'],
        as: 'track'
      }
    ],
    where: {
      event: 1,
      date: {
        [Op.gt]: sequelize.fn('UNIX_TIMESTAMP', start),
        [Op.lt]: sequelize.fn('UNIX_TIMESTAMP', end)
      }
    },
    raw: true
  })

  const concurrency = 1

  return mapLimit(result, track => {
    return findOneArtistEarnings(start, end, track.creatorId)
  }, concurrency)
}

/**
 * @description Create csv report for earnings per track
 * @param {String} start ISO 8601 date format (ex: 2019-09-01)
 * @param {String} end ISO 8601 date format (ex: 2019-10-01)
 * @param {Object} options Optional Creator artist id or label id
 */

async function createReport (start, end, options = {}) {
  const { artistId: creatorId } = options

  try {
    const report = typeof creatorId !== 'undefined'
      ? await findOneArtistEarnings(start, end, creatorId)
      : await findAllArtistEarnings(start, end)

    const data = report.flat(2)

    // FIXME: This needs to be aggregated for `findAllArtistEarnings``?

    return {
      data
    }
  } catch (err) {
    logger.error(err)
    throw err
  }
}

export default createReport
