const { Track, TrackGroup, TrackGroupItem } = require('../../../db/models')
const { Op } = require('sequelize')

module.exports = function () {
  const operations = {
    GET,
    parameters: [
      {
        name: 'tag',
        in: 'path',
        type: 'string',
        required: true,
        description: 'Tag term.'
      }
    ]
  }

  async function GET (ctx, next) {
    if (await ctx.cashed?.()) return

    const tag = ctx.params.tag?.toLowerCase()

    if (!tag) {
      ctx.throw(400, 'Please supply a tag')
    }

    try {
      const tracks = await Track.findAll({
        where: {
          tags: {
            [Op.contains]: [`${tag}`]
          }
        },
        attributes: ['id', 'creatorId', 'title', 'year', 'status', 'tags'],
        include: [{
          model: TrackGroupItem,
          attributes: ['index', 'track_id', 'trackgroupId'],
          required: true,
          as: 'trackOn',
          include: [{
            model: TrackGroup,
            attributes: ['id', 'title', 'type'],
            required: true,
            as: 'trackGroup',
            where: {
              private: false,
              enabled: true
            }
          }]
        }]
      })

      const trackgroups = await TrackGroup.findAll({
        where: {
          tags: {
            [Op.iLike]: `%${tag}%`
          },
          private: false,
          enabled: true
        }
      })

      ctx.body = {
        data: {
          tracks: tracks.map(l => l.toJSON()),
          trackgroups: trackgroups.map(l => l.toJSON())
        }
      }
    } catch (err) {
      console.error(err)
      ctx.throw(ctx.status, err.message)
    }

    await next()
  }

  GET.apiDoc = {
    operationId: 'getTag',
    description: 'Returns search results for a given tag',
    tags: ['tag'],
    parameters: [
      {
        name: 'tag',
        in: 'path',
        type: 'string',
        required: true,
        description: 'Tag term'
      },
      {
        description: 'The current page',
        in: 'query',
        name: 'page',
        type: 'integer'
      },
      {
        description: 'The maximum number of results to return',
        in: 'query',
        name: 'limit',
        type: 'integer'
      }
    ],
    responses: {
      200: {
        description: 'The requested tag results.',
        schema: {
          type: 'object'
        }
      },
      404: {
        description: 'No results found for this tag.'
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
