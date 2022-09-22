const { Resonate: sequelize } = require('../../../../db/models')
const numbro = require('numbro')
const NodeCache = require('node-cache')
const authenticate = require('../../authenticate')

const cache = new NodeCache({ stdTTL: 100, checkperiod: 120 })
const sum = (a, b) => numbro(a).add(b).value()

module.exports = function () {
  const operations = {
    GET: [authenticate, GET]
  }

  async function GET (ctx, next) {
    const { from = '2020-01-01', to = '2020-12-01' } = ctx.request.query
    const key = `spendings:${from}:${to}:${ctx.profile.id}`

    if (cache.get(key)) {
      return (ctx.body = cache.get(key))
    }

    try {
      const data = await sequelize.query(`
        SELECT
          FROM_UNIXTIME(play.date, '%Y-%m') as d,
          IF(count(play.tid) > 8, 9, count(play.tid)) as plays,
          play.tid as track_id,
          play.uid as listener_id,
          (SELECT rs_set_cost(count(pid), IF(count(play.tid) > 8, 9, count(play.tid))) * 0.7 / 1022 * 1.25 FROM plays WHERE uid = play.uid AND date < play.date AND event = 1 AND tid = track.tid) AS artist_total_eur,
          (SELECT rs_set_cost(count(pid), IF(count(play.tid) > 8, 9, count(play.tid))) * 0.7 FROM plays WHERE uid = play.uid AND date < play.date AND event = 1 AND tid = track.tid) AS artist_total
        FROM plays as play
        INNER JOIN tracks as track ON(track.tid = play.tid)
        WHERE play.event = 1
        AND play.date > UNIX_TIMESTAMP(:startDate) AND play.date < UNIX_TIMESTAMP(:endDate)
        AND play.uid = :listener
        GROUP BY FROM_UNIXTIME(play.date, '%Y-%m'), play.uid, play.date, play.tid
        HAVING count(play.tid) <= 9
      `, {
        type: sequelize.QueryTypes.SELECT,
        replacements: {
          startDate: from,
          endDate: to,
          listener: ctx.profile.id
        }
      })

      const result = []

      if (data.length) {
        data.reduce((res, value, index, array) => {
          let ref

          if (value.d) {
            ref = value.d
          } else {
            ref = value.track_id
          }

          if (value.d && !res[value.d]) {
            res[value.d] = {
              plays: 0,
              date: value.d,
              artist_total: 0,
              artist_total_eur: 0
            }

            result.push(res[value.d])
          }

          if (!value.d && !res[value.track_id]) {
            res[value.track_id] = {
              track_id: value.track_id,
              plays: 0,
              artist_total: 0,
              artist_total_eur: 0
            }

            result.push(res[value.track_id])
          }

          // sum plays
          res[ref].plays = sum(res[ref].plays, value.plays)

          // sum artist share
          res[ref].artist_total = sum(res[ref].artist_total, value.artist_total)
          res[ref].artist_total_eur = sum(res[ref].artist_total_eur, value.artist_total_eur)

          return res
        }, {})
      }

      cache.set(key, result, 10000)

      ctx.body = {
        data: result
      }
    } catch (err) {
      ctx.status = err.status
      ctx.throw(ctx.status, err.message)
    }
  }

  GET.apiDoc = {
    operationId: 'getUserSpendings',
    description: 'Returns user spendings',
    tags: ['plays'],
    parameters: [
      {
        in: 'query',
        name: 'from',
        type: 'string',
        format: 'date'
      },
      {
        in: 'query',
        name: 'to',
        type: 'string',
        format: 'date'
      }
    ],
    responses: {
      200: {
        description: 'The requested search results.',
        schema: {
          type: 'object'
        }
      },
      404: {
        description: 'No results were found.'
      }
    }
  }

  return operations
}
