
const { UserGroup, TrackGroup, TrackGroupItem, Track, File } = require('../../../../../db/models')
const { Op } = require('sequelize')
const { authenticate } = require('../../../authenticate')
const trackgroupService = require('../../../../trackgroups/services/trackgroupService')

module.exports = function () {
  const operations = {
    GET: [authenticate, GET],
    PUT: [authenticate, PUT],
    DELETE: [authenticate, DELETE],
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

  async function DELETE (ctx, next) {
    try {
      const result = await TrackGroup.findOne({
        attributes: [
          'enabled',
          'type'
        ],
        where: {
          creatorId: ctx.profile.id,
          id: ctx.params.id
        }
      })

      if (!result) {
        ctx.status = 404
        ctx.throw(ctx.status, 'Trackgroup does not exist')
      }

      if (result.enabled && result.type !== 'playlist') {
        ctx.status = 403
        ctx.throw(ctx.status, 'Trackgroup cannot be deleted right now because it is currently enabled. You must contact our staff.')
      }

      await TrackGroup.destroy({
        where: {
          creatorId: ctx.profile.id,
          id: ctx.params.id
        }
      })

      await TrackGroupItem.destroy({
        where: {
          trackgroupId: ctx.params.id
        }
      })

      ctx.body = {
        data: null,
        message: 'Trackgroup was removed'
      }
    } catch (err) {
      ctx.throw(ctx.status, err.message)
    }

    await next()
  }

  // FIXME: add properties for validation
  DELETE.apiDoc = {
    operationId: 'deleteTrackgroup',
    description: 'Delete trackgroup',
    tags: ['trackgroups'],
    parameters: [{
      name: 'id',
      in: 'path',
      type: 'string',
      required: true,
      description: 'Trackgroup uuid',
      format: 'uuid'
    }],
    responses: {
      200: {
        description: 'Trackgroup deleted response.',
        schema: {
          type: 'object'
        }
      },
      400: {
        description: 'Bad request'
      },
      default: {
        description: 'Unexpected error',
        schema: {
          $ref: '#/definitions/Error'
        }
      }
    }
  }

  async function PUT (ctx, next) {
    const body = ctx.request.body

    try {
      // FIXME: We should allow the user to select an artist to add the album to
      const artists = await UserGroup.findAll({
        where: {
          ownerId: ctx.profile.id
        }
      })

      let result = await TrackGroup.findOne({
        attributes: [
          'creatorId'
        ],
        where: {
          creatorId: artists.map(artist => artist.id),
          id: ctx.params.id
        }
      })

      if (!result) {
        ctx.status = 404
        ctx.throw(ctx.status, 'Track group does not exist or does not belong to your user account')
      }

      result = await TrackGroup.update(body, {
        where: {
          id: ctx.params.id
        },
        returning: true
      })

      if (!result) {
        ctx.status = 404
        ctx.throw(ctx.status, 'Could not update')
      }

      result = await TrackGroup.findOne({
        attributes: [
          'about',
          'composers',
          'cover',
          'creatorId',
          'display_artist',
          'download',
          'id',
          'performers',
          'private',
          'releaseDate',
          'tags',
          'title',
          'type'
        ],
        where: {
          id: ctx.params.id
        }
      })

      ctx.body = {
        data: result,
        status: 'ok'
      }
    } catch (err) {
      ctx.throw(ctx.status, err.message)
    }

    await next()
  }

  PUT.apiDoc = {
    operationId: 'updateTrackgroup',
    description: 'Update trackgroup',
    tags: ['trackgroups'],
    parameters: [
      {
        in: 'body',
        name: 'trackgroup',
        description: 'The trackgroup to update.',
        schema: {
          $ref: '#/definitions/Trackgroup'
        }
      }
    ],
    responses: {
      200: {
        description: 'Trackgroup updated response.',
        schema: {
          type: 'object'
        }
      },
      400: {
        description: 'Bad request'
      },
      default: {
        description: 'Unexpected error',
        schema: {
          $ref: '#/definitions/Error'
        }
      }
    }
  }

  async function GET (ctx, next) {
    try {
      const { type } = ctx.request.query

      const where = {
        id: ctx.params.id
      }

      if (type) {
        where.type = type
      }

      const result = await TrackGroup.findOne({
        attributes: [
          'about',
          'cover',
          'creatorId',
          'display_artist',
          'download',
          'id',
          'private',
          'releaseDate',
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
            required: true,
            attributes: ['id', 'displayName'],
            as: 'creator',
            where: {
              ownerId: ctx.profile.id
            }
          },
          {
            model: File,
            required: false,
            attributes: ['id', 'ownerId'],
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
              attributes: ['id', 'creator_id', 'cover_art', 'title', 'album', 'artist', 'duration', 'status'],
              as: 'track',
              where: {
                status: {
                  [Op.in]: [0, 2, 3]
                }
              },
              include: [
                {
                  model: File,
                  attributes: ['id', 'size', 'ownerId'],
                  as: 'audiofile'
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
