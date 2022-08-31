const { User, UserMeta, TrackGroup, TrackGroupItem, Track, File, Resonate: sequelize } = require('../../../../../db/models')
const { Op } = require('sequelize')
const coverSrc = require('../../../../../util/cover-src')

const {
  validateParams,
  validateTrackgroup
} = require('../../../../../schemas/trackgroup')

module.exports = function () {
  const operations = {
    GET,
    PUT,
    DELETE,
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
    const isValid = validateParams(ctx.params)

    if (!isValid) {
      const { message, dataPath } = validateParams.errors[0]
      ctx.status = 400
      ctx.throw(400, `${dataPath}: ${message}`)
    }

    try {
      const result = await TrackGroup.findOne({
        attributes: [
          'enabled',
          'type'
        ],
        where: {
          creator_id: ctx.profile.id,
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
          creator_id: ctx.profile.id,
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

  DELETE.apiDoc = {
    operationId: 'deleteTrackgroup',
    description: 'Delete trackgroup',
    tags: ['trackgroups'],
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

    let isValid = validateParams(ctx.params)

    if (!isValid) {
      const { message, dataPath } = validateParams.errors[0]
      ctx.status = 400
      ctx.throw(400, `${dataPath}: ${message}`)
    }

    isValid = validateTrackgroup(body)

    if (!isValid) {
      const { message, dataPath } = validateTrackgroup.errors[0]
      ctx.status = 400
      ctx.throw(400, `${dataPath}: ${message}`)
    }

    try {
      let result = await TrackGroup.findOne({
        attributes: [
          'creator_id'
        ],
        where: {
          creator_id: ctx.profile.id,
          id: ctx.params.id
        }
      })

      if (!result) {
        ctx.status = 404
        ctx.throw(ctx.status, 'Track group does not exist or does not belong to your user account')
      }

      result = await TrackGroup.update(body, {
        where: {
          creator_id: ctx.profile.id,
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
          'creator_id',
          'display_artist',
          'download',
          'id',
          'performers',
          'private',
          'release_date',
          'tags',
          'title',
          'type'
        ],
        where: {
          creator_id: ctx.profile.id,
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
    const isValid = validateParams(ctx.params)

    if (!isValid) {
      const { message, dataPath } = validateParams.errors[0]
      ctx.status = 400
      ctx.throw(400, `${dataPath}: ${message}`)
    }

    const { type } = ctx.request.query

    const where = {
      creator_id: ctx.profile.id,
      id: ctx.params.id
    }

    if (type) {
      where.type = type
    }

    if (ctx.profile.role === 'label-owner') {
      const subQuery = sequelize.dialect.QueryGenerator.selectQuery('rsntr_usermeta', {
        attributes: [[sequelize.fn('DISTINCT', sequelize.col('user_id')), 'user_id']],
        where: {
          [Op.or]: [
            {
              [Op.and]: [
                {
                  user_id: ctx.profile.id
                }
              ]
            },
            {
              [Op.and]: [
                {
                  meta_value: ctx.profile.id
                },
                {
                  meta_key: {
                    [Op.in]: ['mylabel']
                  }
                }
              ]
            }
          ]
        }
      }).slice(0, -1)

      where.creator_id = {
        [Op.in]: sequelize.literal('(' + subQuery + ')')
      }
    }

    try {
      const result = await TrackGroup.findOne({
        attributes: [
          'about',
          'cover',
          'creator_id',
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
            model: User,
            required: false,
            attributes: ['id', 'display_name'],
            as: 'user'
          },
          {
            model: UserMeta,
            attributes: ['meta_key', 'meta_value'],
            where: {
              meta_key: {
                [Op.in]: ['nickname', 'role']
              }
            },
            as: 'usermeta'
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
              attributes: ['id', 'creator_id', 'cover_art', 'title', 'album', 'artist', 'duration', 'status'],
              as: 'track',
              where: {
                status: {
                  [Op.in]: [0, 2, 3]
                }
              },
              include: [
                {
                  model: UserMeta,
                  attributes: ['meta_key', 'meta_value'],
                  where: {
                    meta_key: 'nickname'
                  },
                  as: 'meta'
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
                  model: File,
                  attributes: ['id', 'size', 'owner_id'],
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

      const { usermeta } = data

      const { nickname, role } = Object.fromEntries(Object.entries(usermeta)
        .map(([key, value]) => {
          const metaKey = value.meta_key
          let metaValue = value.meta_value

          if (!isNaN(Number(metaValue))) {
            metaValue = Number(metaValue)
          }

          return [metaKey, metaValue]
        }))

      let ext = '.jpg'

      if (ctx.accepts('image/webp')) {
        ext = '.webp'
      }

      const variants = [120, 600, 1500]

      ctx.body = {
        data: {
          about: data.about,
          cover: coverSrc(data.cover, !data.cover_metadata ? '600' : '1500', ext, !data.cover_metadata),
          cover_metadata: {
            id: data.cover
          },
          creator_id: data.creator_id,
          display_artist: data.display_artist,
          user: {
            name: nickname,
            role: role,
            id: data.user.id
          },
          download: data.download,
          id: data.id,
          items: data.items.map((item) => {
            const { nickname } = Object.fromEntries(Object.entries(item.track.meta)
              .map(([key, value]) => {
                const metaKey = value.meta_key
                let metaValue = value.meta_value

                if (!isNaN(Number(metaValue))) {
                  metaValue = Number(metaValue)
                }

                return [metaKey, metaValue]
              }))

            const fallback = !item.track.cover_art ? false : !item.track.cover_metadata

            return {
              index: item.index,
              track: {
                id: item.track.id,
                title: item.track.title,
                status: item.track.status,
                album: item.track.album,
                duration: item.track.duration,
                creator_id: item.track.creator_id,
                artist: item.track.artist || nickname,
                cover: coverSrc(item.track.cover_art || data.cover, '600', ext, fallback),
                images: variants.reduce((o, key) => {
                  const variant = ['small', 'medium', 'large'][variants.indexOf(key)]

                  return Object.assign(o,
                    {
                      [variant]: {
                        width: key,
                        height: key,
                        url: coverSrc(item.track.cover_art || data.cover, key, ext, fallback)
                      }
                    }
                  )
                }, {}),
                url: `${process.env.STREAM_APP_HOST}/api/v3/user/stream/${item.track.id}`
              }
            }
          }),
          images: variants.reduce((o, key) => {
            const variant = ['small', 'medium', 'large'][variants.indexOf(key)]

            return Object.assign(o,
              {
                [variant]: {
                  width: key,
                  height: key,
                  url: coverSrc(data.cover, key, ext, !data.cover_metadata)
                }
              }
            )
          }, {}),
          peformers: data.peformers,
          private: data.private,
          release_date: data.release_date,
          slug: data.slug,
          tags: data.tags,
          title: data.title,
          type: data.type
        },
        status: 'ok'
      }
    } catch (err) {
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
