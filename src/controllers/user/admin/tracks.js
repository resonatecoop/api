const Koa = require('koa')
const AJV = require('ajv')
const ajvKeywords = require('ajv-keywords')
const ajvFormats = require('ajv-formats')

const Roles = require('koa-roles')
const Router = require('@koa/router')
const koaBody = require('koa-body')
const { Track, File } = require('../../../db/models')
const coverSrc = require('../../../util/cover-src')

// const {
//   validateQuery
// } = require('../../../schemas/trackgroup')

const ajv = new AJV({
  allErrors: true,
  removeAdditional: true
})

ajvKeywords(ajv)
ajvFormats(ajv)

// FIXME: openapi validation
// const validateBody = ajv.compile({
//   type: 'object',
//   additionalProperties: false,
//   properties: {
//     creator_id: {
//       type: 'number',
//       minimum: 1
//     },
//     title: {
//       type: 'string'
//     },
//     artist: {
//       type: 'string'
//     },
//     album_artist: {
//       type: 'string'
//     },
//     album: {
//       type: 'string'
//     },
//     composer: {
//       type: 'string'
//     },
//     status: {
//       type: 'string',
//       enum: ['paid', 'free', 'free+paid', 'deleted', 'hidden'],
//       default: 'paid'
//     },
//     year: {
//       type: 'number',
//       minimum: 1900,
//       maximum: new Date().getFullYear() + 1
//     }
//   }
// })

const tracks = new Koa()
const user = new Roles({
  async failureHandler (ctx, action) {
    ctx.status = 403

    ctx.body = {
      message: 'Access Denied - You don\'t have permission to: ' + action
    }
  }
})
const router = new Router()

tracks.use(user.middleware())

user.use((ctx, action) => {
  return !!ctx.profile
})

user.use((ctx, action) => {
  const allowed = ['admin', 'superadmin']

  if (allowed.includes(ctx.profile.role)) {
    return true
  }
})

router.get('/', user.can('access tracks'), async (ctx, next) => {
  // FIXME validation
  // const isValid = validateQuery(ctx.request.query)

  // if (!isValid) {
  //   const { message, dataPath } = validateQuery.errors[0]
  //   ctx.status = 400
  //   ctx.throw(400, `${dataPath}: ${message}`)
  // }

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
        // {
        //   model: UserMeta,
        //   attributes: ['meta_key', 'meta_value'],
        //   required: true,
        //   where: { meta_key: { [Op.in]: ['nickname'] } },
        //   as: 'meta'
        // }
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
})

router.put('/:id', user.can('access tracks'), async (ctx, next) => {
  const body = ctx.request.body
  // const isValid = validateBody(body)

  // if (!isValid) {
  //   const { message, dataPath } = validateBody.errors[0]
  //   ctx.status = 400
  //   ctx.throw(400, `${dataPath}: ${message}`)
  // }

  try {
    const result = await Track.update(body, {
      where: {
        id: ctx.params.id
      },
      returning: true,
      plain: true
    })

    ctx.status = 201
    ctx.body = {
      data: result,
      status: 'ok'
    }
  } catch (err) {
    ctx.throw(ctx.status, err.message)
  }

  await next()
})

router.get('/:id', user.can('access tracks'), async (ctx, next) => {
  try {
    const result = await Track.findOne({
      where: {
        id: ctx.params.id
      },
      include: [
        {
          model: File,
          attributes: ['id', 'size', 'owner_id'],
          as: 'audiofile'
        },
        {
          model: File,
          attributes: ['id', 'size', 'owner_id'],
          as: 'cover_metadata'
        }
      ]
    })

    const data = result.get({
      plain: true
    })

    let ext = '.jpg'

    if (ctx.accepts('image/webp')) {
      ext = '.webp'
    }

    const variants = [120, 600]

    data.cover = coverSrc(data.cover_art, '600', ext, !data.cover_metadata)

    data.images = variants.reduce((o, key) => {
      const variant = ['small', 'medium', 'large'][variants.indexOf(key)]

      return Object.assign(o,
        {
          [variant]: {
            width: key,
            height: key,
            url: coverSrc(data.cover_art, key, ext, !data.cover_metadata)
          }
        }
      )
    }, {})

    if (!data.cover_metadata) {
      data.cover_metadata = { id: data.cover }
    }

    ctx.body = {
      data,
      message: 'ok'
    }
  } catch (err) {
    ctx.throw(ctx.status, err.message)
  }

  await next()
})

tracks
  .use(koaBody())
  .use(router.routes())
  .use(router.allowedMethods({
    throw: true
  }))

module.exports = tracks
