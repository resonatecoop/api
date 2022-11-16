const { UserGroup, UserGroupType, Track, TrackGroup, TrackGroupItem } = require('../../../db/models')
const { Op } = require('sequelize')
const ms = require('ms')
const artistService = require('../../artists/artistService')
const trackService = require('../../tracks/services/trackService')
const trackgroupService = require('../../trackgroups/services/trackgroupService')

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
        }],
        limit: 20
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
        }],
        limit: 20
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
        }],
        limit: 20
      })

      const tracks = await Track.findAll({
        where: {
          title: {
            [Op.iLike]: `%${q}%`
          }
        },
        include: [{
          model: TrackGroupItem,
          separate: true,
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
        }],
        limit: 20
      })

      const trackgroups = await TrackGroup.findAll({
        where: {
          title: {
            [Op.iLike]: `%${q}%`
          },
          private: false,
          enabled: true
        },
        limit: 50
      })

      ctx.body = {
        data: {
          artists: await artistService(ctx).list(artists),
          labels: await artistService(ctx).list(labels),
          bands: await artistService(ctx).list(bands),
          tracks: trackService(ctx).list(tracks),
          trackgroups: trackgroupService(ctx).list(trackgroups)
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
