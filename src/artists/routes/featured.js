const models = require('../../db/models')
const { User, Resonate: sequelize } = models
const resolveProfileImage = require('../../util/profile-image')

module.exports = function () {
  const operations = {
    GET
  }

  async function GET (ctx, next) {
    if (await ctx.cashed()) return

    try {
      const result = await sequelize.query(`
        SELECT ID as id, um.meta_value as name
        FROM rsntr_users as user
        INNER JOIN rsntr_usermeta as um ON (user.ID = um.user_id AND um.meta_key = 'nickname')
        INNER JOIN rsntr_usermeta AS umRole ON (
          umRole.user_id = user.ID AND umRole.meta_key = 'role' AND umRole.meta_value IN ('bands', 'member')
        )
        WHERE ID IN (
          SELECT distinct creator_id
          FROM track_groups
          WHERE type != 'playlist'
          AND private = :private
          AND featured = :featured
          AND enabled = :enabled
        )
        LIMIT :limit
      `, {
        type: sequelize.QueryTypes.SELECT,
        mapToModel: true,
        replacements: {
          private: false,
          enabled: true,
          featured: true,
          limit: 10
        },
        model: User,
        raw: true
      })

      const data = await Promise.all(result.map(async (item) => {
        return {
          id: item.id,
          name: item.name,
          images: await resolveProfileImage(item.id)
        }
      }))

      ctx.body = {
        data: data
      }
    } catch (err) {
      ctx.throw(ctx.status, err.message)
    }
  }

  GET.apiDoc = {
    operationId: 'getFeatured',
    description: 'Returns featured artists',
    tags: ['artists'],
    responses: {
      200: {
        description: 'The requested featured artists results.',
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
