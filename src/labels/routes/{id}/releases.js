const { User, TrackGroup, TrackGroupItem, Track, UserMeta, File, Resonate: sequelize } = require('../../../db/models')
const { Op } = require('sequelize')
const slug = require('slug')
const coverSrc = require('../../../util/cover-src')
const map = require('awaity/map')
const ms = require('ms')

module.exports = function () {
  const operations = {
    GET,
    parameters: [
      {
        name: 'id',
        in: 'path',
        type: 'integer',
        required: true,
        description: 'Label id.'
      }
    ]
  }

  async function GET (ctx, next) {
    if (await ctx.cashed(ms('30s'))) return

    try {
      const { type, limit = 90, page = 1, order } = ctx.request.query

      const subQuery = sequelize.dialect.QueryGenerator.selectQuery('rsntr_usermeta', {
        attributes: [[sequelize.fn('DISTINCT', sequelize.col('user_id')), 'user_id']],
        where: {
          meta_value: ctx.params.id,
          meta_key: 'mylabel'
        }
      }).slice(0, -1)

      const query = {
        where: {
          private: false,
          creator_id: {
            [Op.in]: sequelize.literal('(' + subQuery + ')')
          },
          enabled: true,
          release_date: {
            [Op.or]: {
              [Op.lte]: new Date(),
              [Op.eq]: null
            }
          },
          type: {
            [Op.or]: {
              [Op.eq]: null,
              [Op.notIn]: ['playlist', 'compilation'] // hide playlists and compilations
            }
          }
        },
        limit: limit,
        attributes: [
          'about',
          'cover',
          'creator_id',
          'display_artist',
          'id',
          'slug',
          'tags',
          'title',
          'type'
        ],
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
            model: User,
            required: false,
            attributes: ['id', 'displayName'],
            as: 'user'
          }
        ],
        order: [
          ['createdAt', 'DESC']
        ]
      }

      if (order === 'oldest') {
        query.order = [
          ['createdAt', 'ASC']
        ]
      }

      if (page > 1) {
        query.offset = (page - 1) * limit
      }

      if (type) {
        query.where.type = type
      }

      const { rows: result, count } = await TrackGroup.findAndCountAll(query)

      if (!result.length) {
        ctx.status = 404
        ctx.throw(ctx.status, 'No releases')
      }

      let ext = '.jpg'

      if (ctx.accepts('image/webp')) {
        ext = '.webp'
      }

      const variants = [120, 600, 1500]

      ctx.body = {
        data: await map(result, async (item) => {
          const o = Object.assign({}, item.dataValues)

          const slugTitle = item.get('slug')

          if (!slugTitle) {
            item.slug = slug(o.title)
            item.save()
          }

          const result = await TrackGroupItem.findAll({
            where: {
              trackgroupId: item.id
            },
            order: [
              ['index', 'asc']
            ],
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
          })

          o.items = result.map((item) => {
            const { nickname } = Object.fromEntries(Object.entries(item.track.meta)
              .map(([key, value]) => {
                const metaKey = value.meta_key
                let metaValue = value.meta_value

                if (!isNaN(Number(metaValue))) {
                  metaValue = Number(metaValue)
                }

                return [metaKey, metaValue]
              }))

            const cover = item.track.cover_art
              ? coverSrc(item.track.cover_art, '120', ext, !item.track.cover_metadata)
              : coverSrc(item.cover, '120', ext, !item.cover_metadata) // fallback to trackgroup cover

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
                cover: cover,
                url: `${process.env.STREAM_APP_HOST}/api/v3/user/stream/${item.track.id}`
              }
            }
          })

          o.slug = item.slug

          o.uri = `${process.env.APP_HOST}/v3/trackgroups/${item.id}`

          o.tags = item.get('tags')

          o.cover = coverSrc(item.cover, '600', ext, !item.dataValues.cover_metadata)

          o.images = variants.reduce((o, key) => {
            const variant = ['small', 'medium', 'large'][variants.indexOf(key)]

            return Object.assign(o,
              {
                [variant]: {
                  width: key,
                  height: key,
                  url: coverSrc(item.cover, key, ext, !item.dataValues.cover_metadata)
                }
              }
            )
          }, {})

          return o
        }),
        count: count,
        numberOfPages: Math.ceil(count / limit),
        status: 'ok'
      }
    } catch (err) {
      ctx.throw(ctx.status, err.message)
    }

    await next()
  }

  GET.apiDoc = {
    operationId: 'getLabelReleases',
    description: 'Returns all label artists releases',
    summary: 'Find label artists releases',
    tags: ['labels'],
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
        description: 'The maximum number of results to return',
        in: 'query',
        name: 'limit',
        type: 'integer',
        maximum: 100
      },
      {
        description: 'Order',
        in: 'query',
        name: 'order',
        type: 'string',
        enum: ['oldest', 'newest']
      },
      {
        type: 'integer',
        description: 'The current page',
        in: 'query',
        name: 'page',
        minimum: 1
      }
    ]
  }

  return operations
}
