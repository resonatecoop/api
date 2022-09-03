const { Artist, Resonate: Sequelize, TrackGroup, File } = require('../../../db/models')
const { Op } = require('sequelize')
const slug = require('slug')
const coverSrc = require('../../../util/cover-src')
const ms = require('ms')

module.exports = function () {
  const operations = {
    GET
  }

  async function GET (ctx, next) {
    if (ctx.request.query.order !== 'random' && await ctx.cashed(ms('30s'))) return

    try {
      const { type, limit = 90, page = 1, featured, order } = ctx.request.query

      const query = {
        where: {
          private: false,
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
          'artistId',
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
            model: Artist,
            required: false,
            attributes: ['id', 'display_name'],
            as: 'artist'
          }
        ],
        order: [
          ['createdAt', 'DESC'],
          ['creator_id', 'ASC'],
          ['title', 'ASC']
        ]
      }

      if (order === 'random') {
        query.order = Sequelize.literal('rand()')
      } else if (order === 'oldest') {
        query.order = [
          ['createdAt', 'ASC'],
          ['creator_id', 'ASC'],
          ['title', 'ASC']
        ]
      }

      if (page > 1) {
        query.offset = (page - 1) * limit
      }

      if (type) {
        query.where.type = type
      }

      if (featured) {
        query.where.featured = true
      }

      const { rows: result, count } = await TrackGroup.findAndCountAll(query)

      let ext = '.jpg'

      if (ctx.accepts('image/webp')) {
        ext = '.webp'
      }

      const variants = [120, 600, 1500]

      ctx.body = {
        data: result.map((item) => {
          const o = Object.assign({}, item.dataValues)

          const slugTitle = item.get('slug')

          if (!slugTitle) {
            item.slug = slug(o.title)
            item.save()
          }

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
    operationId: 'getTrackgroups',
    description: 'Returns trackgroups (lp, ep, single)',
    summary: 'Find trackgroups',
    tags: ['trackgroups'],
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
        minimum: 1,
        maximum: 100
      },
      {
        description: 'Order',
        in: 'query',
        name: 'order',
        type: 'string',
        enum: ['random', 'oldest', 'newest']
      },
      {
        type: 'integer',
        description: 'The current page',
        in: 'query',
        name: 'page',
        minimum: 1
      },
      {
        type: 'boolean',
        description: 'Filter featured releases',
        in: 'query',
        name: 'featured'
      },
      {
        type: 'string',
        description: 'The trackgroup type',
        in: 'query',
        enum: ['ep', 'lp', 'single', 'playlist'],
        name: 'type'
      }
    ]
  }

  return operations
}
