
const { File, Track } = require('../../../../db/models')
const { authenticate, hasAccess } = require('../../authenticate')
const coverSrc = require('../../../../util/cover-src')

module.exports = function () {
  const operations = {
    GET: [authenticate, hasAccess('admin'), GET]
  }

  async function GET (ctx, next) {
    const { limit = 20, page = 1 } = ctx.request.query

    try {
      const { rows: result, count } = await Track.findAndCountAll({
        attributes: [
          'album',
          'album_artist',
          'artist',
          'cover_art',
          'createdAt',
          'creator_id',
          'duration',
          'id',
          'status',
          'title',
          'year'
        ],
        limit,
        offset: page > 1 ? (page - 1) * limit : 0,
        include: [
          {
            model: File,
            attributes: ['id', 'owner_id'],
            as: 'audiofile'
          },
          {
            model: File,
            attributes: ['id', 'owner_id'],
            as: 'cover'
          }
        ],
        order: [
          ['createdAt', 'DESC']
        ]
      })

      let ext = '.jpg'

      if (ctx.accepts('image/webp')) {
        ext = '.webp'
      }

      const variants = [120, 600]

      ctx.body = {
        data: result.map((item) => {
        // const { nickname } = Object.fromEntries(Object.entries(item.meta)
        //   .map(([key, value]) => {
        //     const metaKey = value.meta_key
        //     let metaValue = value.meta_value

          //     if (!isNaN(Number(metaValue))) {
          //       metaValue = Number(metaValue)
          //     }

          //     return [metaKey, metaValue]
          //   }))

          const o = Object.assign({}, {
            id: item.dataValues.id,
            title: item.dataValues.title,
            album: item.dataValues.album,
            // artist: nickname,
            album_artist: item.dataValues.album_artist,
            composer: item.get('composer'),
            duration: item.get('duration'),
            status: item.get('status'),
            cover: coverSrc(item.dataValues.cover_art, '600', ext, !item.dataValues.cover),
            images: variants.reduce((o, key) => {
              const variant = ['small', 'medium', 'large'][variants.indexOf(key)]

              return Object.assign(o,
                {
                  [variant]: {
                    width: key,
                    height: key,
                    url: coverSrc(item.dataValues.cover_art, key, ext, !item.dataValues.cover)
                  }
                }
              )
            }, {})
          })

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
    operationId: 'getTracksThroughAdmin',
    description: 'Returns all tracks',
    summary: 'Find tracks',
    tags: ['admin'],
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
        enum: ['random', 'oldest', 'newest']
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
