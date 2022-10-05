const { Track, Resonate: sequelize } = require('../../../../../db/models')
const { authenticate } = require('../../../authenticate')

module.exports = function () {
  const operations = {
    GET: [authenticate, GET]
  }

  async function GET (ctx, next) {
    const {
      limit = 10
    } = ctx.request.query

    try {
      const result = await sequelize.query(`
        SELECT track.uid, um.meta_value
        FROM plays as play
        INNER JOIN tracks as track ON(track.tid = play.tid)
        INNER JOIN rsntr_usermeta as um ON(um.user_id = track.uid AND meta_key = 'nickname')
        WHERE play.uid = :listenerId
        AND play.event = 1
        GROUP BY track.uid, um.meta_value
        ORDER BY MAX(play.date) DESC
        LIMIT :limit
      `, {
        type: sequelize.QueryTypes.SELECT,
        replacements: {
          listenerId: ctx.profile.id,
          limit: limit
        },
        mapToModel: true,
        model: Track
      })

      ctx.body = {
        data: result
      }
    } catch (err) {
      ctx.status = err.status || 500
      ctx.throw(ctx.status, err.message)
    }

    await next()
  }

  GET.apiDoc = {
    operationId: 'getLatestPlayedArtists',
    description: 'Returns latest played artists',
    tags: ['plays'],
    parameters: [
      {
        description: 'The maximum number of results to return',
        in: 'query',
        name: 'limit',
        type: 'integer'
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
