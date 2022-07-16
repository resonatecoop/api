const { User, Resonate: sequelize } = require('../../../db/models')
const resolveProfileImage = require('../../../util/profile-image')
const links = require('../../../util/links')
const he = require('he')

module.exports = function () {
  const operations = {
    GET,
    parameters: [
      {
        name: 'id',
        in: 'path',
        type: 'integer',
        required: true,
        description: 'User id.'
      }
    ]
  }

  async function GET (ctx, next) {
    if (await ctx.cashed()) return

    try {
      const result = await sequelize.query(`
        SELECT user.ID,
        MAX(CASE WHEN um.meta_key = 'nickname' THEN um.meta_value ELSE NULL END) AS name,
        MAX(CASE WHEN um.meta_key = 'description' THEN um.meta_value ELSE NULL END) AS description,
        MAX(CASE WHEN um.meta_key = 'role' THEN um.meta_value ELSE NULL END) AS role,
        MAX(CASE WHEN um.meta_key = 'facebook' THEN um.meta_value ELSE NULL END) AS facebook_url,
        MAX(CASE WHEN um.meta_key = 'twitter' THEN um.meta_value ELSE NULL END) AS twitter_url,
        MAX(CASE WHEN um.meta_key = 'youtube' THEN um.meta_value ELSE NULL END) AS youtube_url,
        MAX(CASE WHEN um.meta_key = 'instagram' THEN um.meta_value ELSE NULL END) AS instagram_url,
        MAX(CASE WHEN um.meta_key = 'Website' THEN um.meta_value ELSE NULL END) AS website_url
        FROM rsntr_users as user
        JOIN rsntr_usermeta as um ON(um.user_id = user.ID)
        WHERE user.ID = :id
        GROUP BY um.user_id
        LIMIT 1
      `, {
        type: sequelize.QueryTypes.SELECT,
        replacements: {
          id: ctx.params.id
        },
        mapToModel: true,
        model: User,
        raw: true
      })

      if (!result.length) {
        ctx.status = 404
        ctx.throw(ctx.status, 'Not found')
      }

      const {
        name,
        id,
        facebook_url: fb,
        youtube_url: yt,
        website_url: website,
        twitter_url: twitter,
        instagram_url: insta,
        description
      } = result[0]

      const data = {
        name: he.decode(name),
        id: id,
        links: links(
          ['instagram', fb],
          ['twitter', twitter],
          ['youtube', yt],
          ['website', website],
          ['instagram', insta]
        ),
        images: await resolveProfileImage(ctx.params.id)
      }

      if (description) {
        data.bio = he.decode(description)
      }

      ctx.body = {
        data: data
      }
    } catch (err) {
      ctx.throw(ctx.status, err.message)
    }

    await next()
  }

  GET.apiDoc = {
    operationId: 'getUser',
    description: 'Returns a single user',
    tags: ['users'],
    parameters: [
      {
        name: 'id',
        in: 'path',
        type: 'integer',
        required: true,
        description: 'User id'
      }
    ],
    responses: {
      200: {
        description: 'The requested user profile.',
        schema: {
          type: 'object'
        }
      },
      404: {
        description: 'No user found.'
      },
      default: {
        description: 'Unexpected error',
        schema: {
          $ref: '#/definitions/Error'
        }
      }
    }
  }

  return operations
}
