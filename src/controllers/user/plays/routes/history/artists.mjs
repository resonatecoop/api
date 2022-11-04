import models from '../../../../../db/models/index.js'
import { authenticate } from '../../../authenticate.js'
const { UserGroup, Resonate: sequelize } = models

export default function () {
  const operations = {
    GET: [authenticate, GET]
  }

  async function GET (ctx, next) {
    const {
      limit = 10
    } = ctx.request.query

    try {
      const result = await sequelize.query(`
        SELECT ug.id as "creatorId", ug.display_name as "displayName", count(*)
        FROM user_groups ug 
        LEFT JOIN tracks ON tracks.creator_id = ug.id 
        LEFT JOIN plays ON plays.track_id = tracks.id
        WHERE plays.user_id = :userId
        GROUP BY ug.id
        LIMIT :limit
      `, {
        type: sequelize.QueryTypes.SELECT,
        mapToModel: true,
        replacements: {
          userId: ctx.profile.id,
          limit
        },
        model: UserGroup,
        raw: true
      })

      ctx.body = {
        data: result
      }
    } catch (err) {
      console.error('endpoint error')
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
