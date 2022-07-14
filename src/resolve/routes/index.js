const { WpUser, TrackGroup } = require('../../db/models')
const ms = require('ms')

module.exports = function () {
  const operations = {
    GET
  }

  async function GET (ctx, next) {
    if (await ctx.cashed(ms('30s'))) return

    const { url } = ctx.request.query

    try {
      const { pathname } = new URL(url)

      const parts = pathname.split('/')

      const id = parts[2].split('-')[0]

      const key = Number(id) ? 'id' : 'nicename'

      const user = await WpUser.findOne({
        attributes: [
          'id'
        ],
        where: { [key]: parts[2] }
      })

      if (!user) {
        ctx.status = 404
        ctx.throw(ctx.status, 'Not found')
      }

      if (!parts[4]) {
        const url = new URL(`/artists/${user.id}`, process.env.APP_HOST)
        ctx.body = {
          data: Object.assign({}, user.dataValues, { uri: url.href }),
          status: 'ok'
        }
      } else {
        const resource = parts[3]
        const where = {
          creator_id: user.id,
          slug: parts[4]
        }

        if (resource === 'playlist') {
          where.type = 'playlist'
        }

        const result = await TrackGroup.findOne({
          attributes: [
            'id',
            'type',
            'private',
            'creator_id',
            'title'
          ],
          where: where
        })

        if (!result) {
          ctx.status = 404
          ctx.throw(ctx.status, 'Not found')
        }

        const url = new URL(`/v3/trackgroups/${result.id}`, process.env.APP_HOST)

        ctx.body = {
          data: Object.assign({}, result.dataValues, { uri: url.href }),
          status: 'ok'
        }
      }
    } catch (err) {
      ctx.throw(ctx.status, err.message)
    }

    await next()
  }

  GET.apiDoc = {
    operationId: 'resolve',
    description: 'Resolve a profile or trackgroup',
    tags: ['resolve'],
    produces: [
      'application/json'
    ],
    responses: {
      400: {
        description: 'Bad request',
        schema: {
          $ref: '#/responses/BadRequest'
        }
      },
      404: {
        description: 'Not found',
        schema: {
          $ref: '#/responses/NotFound'
        }
      },
      default: {
        description: 'error payload',
        schema: {
          $ref: '#/definitions/Error'
        }
      }
    },
    parameters: [
      {
        description: 'The url to resolve',
        in: 'query',
        name: 'url',
        type: 'string'
      }
    ]
  }

  return operations
}
