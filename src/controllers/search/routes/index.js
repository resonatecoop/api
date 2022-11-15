const { UserGroup, UserGroupType, Track, TrackGroup, TrackGroupItem } = require('../../../db/models')
const { Op } = require('sequelize')
const ms = require('ms')

module.exports = function () {
  const operations = {
    GET
  }

  async function GET (ctx, next) {
    if (await ctx.cashed?.(ms('30s'))) return

    const q = ctx.request.query.q
    try {
      const artists = await UserGroup.scope('public').findAll({
        where: {
          displayName: {
            [Op.iLike]: `%${q}%`
          }
        },
        attributes: ['id', 'displayName', 'description', 'shortBio', 'email'],
        include: [{
          model: UserGroupType,
          as: 'type',
          where: {
            name: 'artist'
          },
          required: true
        }]
      })

      const labels = await UserGroup.scope('public').findAll({
        where: {
          displayName: {
            [Op.iLike]: `%${q}%`
          }
        },
        attributes: ['id', 'displayName', 'description', 'shortBio', 'email'],
        include: [{
          model: UserGroupType,
          as: 'type',
          where: {
            name: 'labels'
          },
          required: true
        }]
      })

      const bands = await UserGroup.scope('public').findAll({
        where: {
          displayName: {
            [Op.iLike]: `%${q}%`
          }
        },
        attributes: ['id', 'displayName', 'description', 'shortBio', 'email'],
        include: [{
          model: UserGroupType,
          as: 'type',
          where: {
            name: 'bands'
          },
          required: true
        }]
      })

      const tracks = await Track.findAll({
        where: {
          title: {
            [Op.iLike]: `%${q}%`
          }
        },
        include: [{
          model: TrackGroupItem,
          required: true,
          as: 'trackOn',
          include: [{
            model: TrackGroup,
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
          title: {
            [Op.iLike]: `%${q}%`
          },
          private: false,
          enabled: true
        }
      })

      ctx.body = {
        data: {
          artists: artists.map(a => a.toJSON()),
          labels: labels.map(l => l.toJSON()),
          bands: bands.map(l => l.toJSON()),
          tracks: tracks.map(l => l.toJSON()),
          trackgroups: trackgroups.map(l => l.toJSON())
        }
      }
    } catch (err) {
      console.error(err)
      ctx.throw(500, err.message)
    }
  }

  GET.apiDoc = {
    operationId: 'getSearch',
    description: 'Returns search results for profiles, releases and tracks',
    tags: ['search'],
    parameters: [
      {
        description: 'The search query term',
        in: 'query',
        name: 'q',
        type: 'string',
        required: true
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
