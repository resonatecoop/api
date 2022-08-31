const models = require('../../../../db/models')
const { User, UserMeta, UserGroup, Resonate: sequelize } = models
const resolveProfileImage = require('../../../../util/profile-image')
const links = require('../../../../util/links')
const he = require('he')

const LAST_WP_ID = process.env.LAST_WP_ID || 20000 // last wp id after migration to user api

module.exports = function () {
  const operations = {
    GET,
    parameters: [
      {
        name: 'id',
        in: 'path',
        type: 'integer',
        required: true,
        description: 'Artist id.'
      }
    ]
  }

  async function GET (ctx, next) {
    if (await ctx.cashed()) return

    try {
      let data = {}

      // TODO replace all of this with a call to the mongodb Profile data once we have enough data there

      if (ctx.params.id <= LAST_WP_ID) {
        const result = await sequelize.query(`
          SELECT user.ID,
          MAX(CASE WHEN um.meta_key = 'nickname' THEN um.meta_value ELSE NULL END) AS name,
          MAX(CASE WHEN um.meta_key = 'country' THEN um.meta_value ELSE NULL END) AS country,
          MAX(CASE WHEN um.meta_key = 'description' THEN um.meta_value ELSE NULL END) AS description,
          MAX(CASE WHEN um.meta_key = 'mylabel' THEN um.meta_value ELSE NULL END) AS label_id,
          MAX(CASE WHEN um.meta_key = 'role' THEN um.meta_value ELSE NULL END) AS role,
          MAX(CASE WHEN um.meta_key = 'facebook' THEN um.meta_value ELSE NULL END) AS facebook_url,
          MAX(CASE WHEN um.meta_key = 'twitter' THEN um.meta_value ELSE NULL END) AS twitter_url,
          MAX(CASE WHEN um.meta_key = 'VimeoMusicians' THEN um.meta_value ELSE NULL END) AS vimeo_url,
          MAX(CASE WHEN um.meta_key = 'youtube' THEN um.meta_value ELSE NULL END) AS youtube_url,
          MAX(CASE WHEN um.meta_key = 'instagram' THEN um.meta_value ELSE NULL END) AS instagram_url,
          MAX(CASE WHEN um.meta_key = 'Website' THEN um.meta_value ELSE NULL END) AS website_url
          FROM rsntr_users as user
          JOIN rsntr_usermeta as um ON(um.user_id = user.ID)
          WHERE user.ID = :id
          GROUP BY um.user_id
          HAVING role IN('member', 'bands') AND name != ''
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
          ctx.throw(ctx.status, 'Artist not found')
        }

        const {
          name,
          id,
          country,
          facebook_url: fb,
          youtube_url: yt,
          website_url: website,
          vimeo_url: vimeo,
          twitter_url: twitter,
          instagram_url: insta,
          description,
          label_id: labelId
        } = result[0]

        let labelName

        if (labelId) {
          const result = await UserMeta.findOne({ where: { user_id: labelId, meta_key: 'nickname' } })

          if (result) {
            labelName = result.meta_value
          }
        }

        data = Object.assign({}, data, {
          name: he.decode(name),
          id: id,
          links: links(
            ['instagram', fb],
            ['twitter', twitter],
            ['vimeo', vimeo],
            ['youtube', yt],
            ['website', website],
            ['instagram', insta]
          ),
          images: await resolveProfileImage(ctx.params.id)
        })

        if (description) {
          data.bio = he.decode(description)
        }

        if (country) {
          data.country = he.decode(country)
        }

        if (labelName) {
          data.label = {
            id: Number(labelId),
            name: labelName,
            images: await resolveProfileImage(labelId)
          }
        }
      }

      const user = await User.findOne({
        where: {
          legacy_id: ctx.params.id,
          role_id: 5 // artist role
        }
      })

      // not all artists are migrated to the new system because many were generated accounts with fake email addresses
      if (!user && ctx.params.id > LAST_WP_ID) {
        ctx.status = 404
        ctx.throw(ctx.status, 'Artist not found')
      } else if (user) {
        const usergroups = await UserGroup.findAll({
          where: {
            ownerID: user.id
          }
        })

        const { displayName, shortBio, description, avatar, banner } = usergroups[0] // first created usergroup as default usergroup

        data = Object.assign({}, data, {
          name: displayName,
          shortBio,
          description,
          avatar,
          banner
        })
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
    operationId: 'getArtist',
    description: 'Returns a single artist',
    tags: ['artists'],
    parameters: [
      {
        name: 'id',
        in: 'path',
        type: 'integer',
        required: true,
        description: 'Artist id'
      }
    ],
    responses: {
      200: {
        description: 'The requested artist profile.',
        schema: {
          type: 'object'
        }
      },
      404: {
        description: 'No artist profile found.'
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
