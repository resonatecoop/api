const { TrackGroup, UserGroup, TrackGroupItem, Track, File } = require('../../../../db/models')
const { Op } = require('sequelize')
const slug = require('slug')
const coverSrc = require('../../../../util/cover-src')
const { authenticate } = require('../../authenticate')

module.exports = function () {
  const operations = {
    POST: [authenticate, POST],
    GET: [authenticate, GET]
  }

  async function POST (ctx, next) {
    const body = ctx.request.body

    try {
      // FIXME: We should allow the user to select an artist to add the album to
      const artist = await UserGroup.findOne({
        where: {
          ownerId: ctx.profile.id
        }
      })
      if (!artist) {
        ctx.status = 404
        ctx.throw(ctx.status, 'UserGroup not found for user')
      }
      const result = await TrackGroup.create(Object.assign(body, {
        enabled: body.type === 'playlist', // FIXME: what's this enforcing?
        creatorId: artist.id
      }))

      ctx.status = 201
      ctx.body = {
        data: result.get({
          plain: true
        }),
        status: 201
      }
    } catch (err) {
      console.log(err)
      ctx.status = err.status || 500
      ctx.throw(ctx.status, err.message)
    }

    await next()
  }

  POST.apiDoc = {
    operationId: 'createTrackgroup',
    description: 'Create new trackgroup',
    tags: ['trackgroups'],
    parameters: [
      {
        in: 'body',
        name: 'trackgroup',
        description: 'The trackgroup to create.',
        schema: {
          $ref: '#/definitions/Trackgroup'
        }
      }
    ],
    responses: {
      201: {
        description: 'Trackgroup created response.',
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
      const { type, limit = 100, page = 1, featured, private: _private, download, enabled, includes } = ctx.request.query

      // FIXME: Allow filtering by artist
      const userArtists = await UserGroup.findAll({
        where: {
          ownerId: ctx.profile.id
        }
      })

      const where = {
        creatorId: userArtists.map(a => a.id),
        type: {
          [Op.or]: {
            [Op.eq]: null,
            [Op.notIn]: ['playlist', 'compilation'] // hide playlists and compilations
          }
        }
      }

      if (type) {
        where.type = type
      }

      if (download) {
        where.download = true
      }

      if (_private) {
        where.private = true
      }

      if (featured) {
        where.featured = true
      }

      if (enabled) {
        where.enabled = true
      }

      const whereTrackGroupItem = {}

      if (includes) {
        whereTrackGroupItem.track_id = includes // trackgroup where trackgroup item has a given track
      }

      const { rows: result, count } = await TrackGroup.findAndCountAll({
        limit,
        offset: page > 1 ? (page - 1) * limit : 0,
        attributes: [
          'id',
          'cover',
          'title',
          'type',
          'creatorId',
          'about',
          'private',
          'enabled',
          'display_artist',
          'composers',
          'performers',
          'release_date'
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
            model: TrackGroupItem,
            attributes: ['id', 'index'],
            required: !!whereTrackGroupItem.track_id,
            as: 'items',
            where: whereTrackGroupItem,
            include: [{
              model: Track,
              required: false,
              attributes: [
                'id',
                'title',
                'duration'
              ],
              as: 'track'
            }]
          }
        ],
        where
      })

      let ext = '.jpg'

      if (ctx.accepts('image/webp')) {
        ext = '.webp'
      }

      const variants = [120, 600]

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

          o.performers = item.get('performers')
          o.artistId = item.get('artistId')

          o.composers = item.get('composers')
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
      },
      {
        type: 'integer',
        description: 'Find trackgroup containing a specific track',
        in: 'query',
        minimum: 1,
        name: 'includes'
      }
    ]
  }

  return operations
}
