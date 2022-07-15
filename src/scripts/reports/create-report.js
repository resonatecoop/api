const decodeUriComponent = require('decode-uri-component')
const he = require('he')
const numbro = require('numbro')
const mapLimit = require('awaity/mapLimit')
const { Resonate: sequelize, Track, Play } = require('../../db/models')
const { Op } = require('sequelize')
const { findOneArtistEarnings } = require('./earnings')
const { createLogger } = require('../../util/logger')

const logger = createLogger({ service: 'create-report' })

const sum = (a, b) => numbro(a).add(b).value()
const divide = (a, b) => numbro(a).divide(b).value()

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

    const result = []

    let sums = {
      artist_total: 0,
      artist_total_eur: 0,
      resonate_total: 0,
      resonate_total_eur: 0,
      tracks: 0
    }

    if (data.length) {
      data.reduce((res, value, index, array) => {
        const ref = value.d || value.track_id // group key

        if (!res[ref]) {
          res[ref] = {
            track_id: value.track_id,
            avg: 0,
            plays: 0,
            resonate_total: 0,
            resonate_total_eur: 0,
            artist_total: 0,
            artist_total_eur: 0,
            earned: 0
          }

          if (value.d) {
            res[ref].date = value.d
          }

          if (value.artist_id) {
            res[ref].artist_id = value.artist_id
          }

          if (value.label) {
            res[ref].label = value.label
          }

          if (value.artist) {
            res[ref].artist = decodeUriComponent(he.decode(value.artist))
          }

          if (value.track_album) {
            res[ref].track_album = decodeUriComponent(value.track_album)
          }

          if (value.track_title) {
            res[ref].track_title = decodeUriComponent(value.track_title)
          }

          result.push(res[ref])
        }

        // sum plays
        res[ref].plays = sum(res[ref].plays, value.plays)

        // sum resonate share
        res[ref].resonate_total = sum(res[ref].resonate_total, value.resonate_total)
        res[ref].resonate_total_eur = sum(res[ref].resonate_total_eur, value.resonate_total_eur)

        // sum artist share
        res[ref].artist_total = sum(res[ref].artist_total, value.artist_total)
        res[ref].artist_total_eur = sum(res[ref].artist_total_eur, value.artist_total_eur)

        // sum total value earned
        res[ref].earned = sum(res[ref].earned, value.earned)

        // set avg earned per play
        res[ref].avg = divide(res[ref].earned, res[ref].plays)

        return res
      }, {})

      sums = result.reduce((a, b) => ({
        artist_total: sum(a.artist_total, b.artist_total),
        artist_total_eur: sum(a.artist_total_eur, b.artist_total_eur),
        resonate_total: sum(a.resonate_total, b.resonate_total),
        resonate_total_eur: sum(a.resonate_total_eur, b.resonate_total_eur)
      }))
    }

    sums.tracks = result.length

    logger.info('sums', sums)

    return {
      data: result,
      sums: sums
    }
  } catch (err) {
    logger.error(err)
    throw err
  }
}

export default createReport
