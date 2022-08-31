const fetch = require('node-fetch')
const { Track, TrackGroup, File } = require('../../../db/models')
const { Op } = require('sequelize')
const coverSrc = require('../../../util/cover-src')

module.exports = function () {
  const operations = {
    GET,
    parameters: [
      {
        name: 'tag',
        in: 'path',
        type: 'string',
        required: true,
        description: 'Tag term.'
      }
    ]
  }

  async function GET (ctx, next) {
    if (await ctx.cashed()) return

    try {
      const hostname = process.env.SEARCH_API_PROTOCOL + '://' + process.env.SEARCH_API_HOST
      const url = new URL(`/tag/${ctx.params.tag}`, hostname)
      url.search = new URLSearchParams(ctx.request.query)
      const response = await fetch(url.href)

      if (response.status === 404) {
        ctx.status = 404
        ctx.throw(ctx.status, 'No results')
      }

      const data = await Promise.all(response.data.map(async (item) => {
        if (item.kind === 'album') {
          const result = await TrackGroup.findOne({
            attributes: [
              'cover',
              'creator_id',
              'slug'
            ],
            where: {
              id: item.track_group_id,
              private: false
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
              }
            ]
          })

          if (!result) {
            return false
          }

          const data = result.get({
            plain: true
          })

          item.creator_id = data.creator_id
          item.slug = data.slug

          let ext = '.jpg'

          if (ctx.accepts('image/webp')) {
            ext = '.webp'
          }

          const variants = [120, 600, 1500]

          item.cover = coverSrc(data.cover, '1500', ext, !data.cover_metadata)

          item.images = variants.reduce((o, key) => {
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
          }, {})

          if (!data.cover_metadata) {
            item.cover_metadata = { id: data.cover }
          }
        }

        if (item.kind === 'track') {
          let ext = '.jpg'

          if (ctx.accepts('image/webp')) {
            ext = '.webp'
          }

          const variants = [120, 600]

          const result = await Track.findOne({
            attributes: ['cover_art'],
            where: {
              id: item.track_id
            },
            include: [
              {
                attributes: ['id'],
                model: File,
                as: 'cover_metadata'
              }
            ]
          })

          const data = result.get({
            plain: true
          })

          item.cover = coverSrc(data.cover_art, '600', ext, !data.cover_metadata)

          item.images = variants.reduce((o, key) => {
            const variant = ['small', 'medium', 'large'][variants.indexOf(key)]

            return Object.assign({}, o,
              {
                [variant]: {
                  width: key,
                  height: key,
                  url: coverSrc(data.cover_art, key, ext, !data.cover_metadata)
                }
              }
            )
          }, {})
        }

        return item
      }))

      if (!data.length) {
        ctx.status = 404
        ctx.throw(ctx.status, 'No results')
      }

      ctx.body = {
        count: response.count,
        numberOfPages: response.numberOfPages,
        data: data.filter(Boolean)
      }
    } catch (err) {
      ctx.throw(ctx.status, err.message)
    }

    await next()
  }

  GET.apiDoc = {
    operationId: 'getTag',
    description: 'Returns search results for a given tag',
    tags: ['tag'],
    parameters: [
      {
        name: 'tag',
        in: 'path',
        type: 'string',
        required: true,
        description: 'Tag term'
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
        description: 'The requested tag results.',
        schema: {
          type: 'object'
        }
      },
      404: {
        description: 'No results found for this tag.'
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
