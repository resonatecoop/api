const models = require('../../../db/models')
const { UserGroup, TrackGroup } = models
const artistService = require('../artistService')

module.exports = function () {
  const operations = {
    GET
  }

  async function GET (ctx, next) {
    if (await ctx.cashed?.()) return

    try {
      // FIXME: it probably makes sense to have artists actually be
      // featured on the model directly rather than just whether their
      // track groups are? Dunno.

      const result = await UserGroup.findAll({
        include: [{
          model: TrackGroup,
          as: 'trackgroups',
          where: {
            private: false,
            featured: true,
            enabled: true
          }
        }],
        limit: 10
      })

      const data = await artistService(ctx).list(result)

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
