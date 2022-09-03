const models = require('../../../../db/models')
const { User, Artist } = models
// const resolveProfileImage = require('../../../../util/profile-image')
// const links = require('../../../../util/links')
// const he = require('he')

// const LAST_WP_ID = process.env.LAST_WP_ID || 20000 // last wp id after migration to user api

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
      // TODO replace all of this with a call to the mongodb Profile data once we have enough data there

      const result = await Artist.findOne({
        where: {
          id: ctx.params.id
        },
        include: [
          {
            model: User,
            required: false,
            attributes: ['id', 'display_name'],
            as: 'user'
          }
        ]
      })

      ctx.body = {
        data: result.get({ plain: true })
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
