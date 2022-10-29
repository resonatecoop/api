const { UserGroup, UserGroupMember, TrackGroup, TrackGroupItem, Track, File } = require('../../../../db/models')
const { Op } = require('sequelize')
const slug = require('slug')
const coverSrc = require('../../../../util/cover-src')
const ms = require('ms')
const { apiRoot } = require('../../../../constants')

module.exports = function () {
  const operations = {
    GET,
    parameters: [
      {
        name: 'id',
        in: 'path',
        type: 'string',
        required: true,
        description: 'Label id.',
        format: 'uuid'
      }
    ]
  }

  async function GET (ctx, next) {
    if (await ctx.cashed?.(ms('30s'))) return

    try {
      const { type, limit = 90, page = 1, order } = ctx.request.query

      const query = {
        where: {
          private: false,
          enabled: true,
          release_date: {
            [Op.or]: {
              [Op.lte]: new Date(),
              [Op.eq]: null
            }
          }
        },
        limit: limit,
        attributes: [
          'about',
          'cover',
          'creatorId',
          'id',
          'slug',
          'tags',
          'title',
          'type',
          'createdAt'
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
            model: UserGroup,
            attributes: ['id', 'displayName'],
            required: true,
            as: 'creator',
            include: [{
              model: UserGroupMember,
              required: true,
              as: 'memberOf',
              where: {
                belongsToId: ctx.params.id
              }
            }]
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

      const { count, rows: result } = await TrackGroup.findAndCountAll(query)

      let ext = '.jpg'

      if (ctx.accepts('image/webp')) {
        ext = '.webp'
      }

      const variants = [120, 600, 1500]

      ctx.body = {
        data: await Promise.all(result.map(async (item) => {
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
              attributes: ['id', 'creatorId', 'cover_art', 'title', 'duration', 'status'],
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
                url: `${process.env.APP_HOST}${apiRoot}/user/stream/${item.track.id}`
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
        })),
        count,
        pages: Math.ceil(count / limit),
        status: 'ok'
      }
    } catch (err) {
      console.error(err)
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
