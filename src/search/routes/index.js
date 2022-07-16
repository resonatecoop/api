const fetch = require('node-fetch')
const resolveProfileImage = require('../../util/profile-image')
const { User, Track, TrackGroup, File } = require('../../db/models')
const { Op } = require('sequelize')
const coverSrc = require('../../util/cover-src')
const he = require('he')
const ms = require('ms')

module.exports = function () {
  const operations = {
    GET
  }

  async function GET (ctx, next) {
    if (await ctx.cashed(ms('30s'))) return

    try {
      const hostname = process.env.SEARCH_API_PROTOCOL + '://' + process.env.SEARCH_API_HOST
      const url = new URL(hostname)
      url.search = new URLSearchParams(ctx.request.query)
      const response = await fetch(url.href)

      if (response.status === 404 || !response.data) {
        ctx.status = 404
        ctx.throw(ctx.status, 'No results')
      }

      const data = await Promise.all(response.data.map(async (item) => {
        if (['artist', 'band', 'label'].includes(item.kind)) {
          const result = await User.findOne({ id: item.user_id })

          if (!result) {
            return false
          }

          item.images = await resolveProfileImage(item.user_id)
          item.name = he.decode(item.name)
        }

        if (item.kind === 'album') {
          const result = await TrackGroup.findOne({
            attributes: [
              'cover',
              'creator_id',
              'slug'
            ],
            where: {
              id: item.track_group_id,
              enabled: true,
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
              },
              {
                model: User,
                required: false,
                as: 'user'
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
              id: item.track_id,
              [Op.not]: {
                [Op.or]: [
                  { track_album: { [Op.eq]: null } },
                  { track_album: { [Op.eq]: '' } },
                  { track_cover_art: { [Op.eq]: null } },
                  { track_cover_art: { [Op.eq]: '' } }
                ]
              },
              status: {
                [Op.in]: [0, 2, 3]
              }
            },
            include: [
              {
                attributes: ['id'],
                model: File,
                as: 'cover_metadata'
              }
            ]
          })

          if (!result) {
            return false
          }

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

      ctx.body = {
        data: data.filter(Boolean)
      }
    } catch (err) {
      ctx.throw(ctx.status, err.message)
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
