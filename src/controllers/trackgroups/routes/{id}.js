const { UserGroup, TrackGroup, TrackGroupItem, Track, File } = require('../../../db/models')
const { Op } = require('sequelize')
const ms = require('ms')
const trackgroupService = require('../services/trackgroupService')

module.exports = function () {
  const operations = {
    GET,
    parameters: [
      {
        name: 'id',
        in: 'path',
        type: 'string',
        required: true,
        description: 'Trackgroup uuid.',
        format: 'uuid'
      }
    ]
  }

  async function GET (ctx, next) {
    if (await ctx.cashed?.(ms('30s'))) return

    const where = {
      id: ctx.params.id,
      enabled: true,
      private: false,
      release_date: {
        [Op.or]: {
          [Op.lte]: new Date(),
          [Op.eq]: null
        }
      }
    }

    try {
      const result = await TrackGroup.findOne({
        attributes: [
          'about',
          'cover',
          'creatorId',
          'display_artist',
          'download',
          'id',
          'private',
          'release_date',
          'slug',
          'tags',
          'title',
          'type'
        ],
        where,
        order: [
          [{ model: TrackGroupItem, as: 'items' }, 'index', 'asc']
        ],
        include: [
          {
            model: UserGroup,
            required: false,
            attributes: ['id', 'displayName'],
            as: 'creator'
          },
          {
            model: File,
            required: false,
            attributes: ['id', 'owner_id'],
            as: 'cover_metadata',
            where: {
              mime: {
                [Op.in]: ['image/jpeg', 'image/png']
              }
            }
          },
          {
            model: TrackGroupItem,
            attributes: ['id', 'index'],
            as: 'items',
            include: [{
              model: Track,
              attributes: ['id', 'creatorId', 'cover_art', 'title', 'album', 'artist', 'duration', 'status'],
              as: 'track',
              where: {
                status: {
                  [Op.in]: [0, 2, 3]
                }
              },
              include: [
                {
                  model: File,
                  required: false,
                  attributes: ['id', 'owner_id'],
                  as: 'cover_metadata',
                  where: {
                    mime: {
                      [Op.in]: ['image/jpeg', 'image/png']
                    }
                  }
                },
                {
                  model: File,
                  attributes: ['id', 'size', 'owner_id'],
                  as: 'audiofile'
                }, {
                  model: UserGroup,
                  as: 'creator',
                  attributes: ['id', 'displayName']
                }
              ]
            }
            ]
          }
        ]
      })

      if (!result) {
        ctx.status = 404
        ctx.throw(ctx.status, 'Track group does not exist')
      }

      const data = result.get({
        plain: true
      })

      // FIXME: combine this with trackService
      ctx.body = {
        data: trackgroupService(ctx).single(data),
        status: 'ok'
      }
    } catch (err) {
      console.error(err)
      ctx.throw(ctx.status, err.message)
    }

    await next()
  }

  GET.apiDoc = {
    operationId: 'getTrackgroup',
    description: 'Returns a single trackgroup (lp, ep, single)',
    tags: ['trackgroups'],
    parameters: [
      {
        name: 'id',
        in: 'path',
        type: 'string',
        required: true,
        description: 'Trackgroup uuid',
        format: 'uuid'
      }
    ],
    responses: {
      200: {
        description: 'The requested trackgroup.',
        schema: {
          type: 'object'
        }
      },
      404: {
        description: 'No trackgroup found.'
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
