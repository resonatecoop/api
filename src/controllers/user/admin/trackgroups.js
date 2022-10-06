const Koa = require('koa')
const AJV = require('ajv')
const ajvKeywords = require('ajv-keywords')
const ajvFormats = require('ajv-formats')

const Roles = require('koa-roles')
const Router = require('@koa/router')
const koaBody = require('koa-body')
const { TrackGroup, TrackGroupItem, Track, File, Role } = require('../../../db/models')
const { Op } = require('sequelize')
const coverSrc = require('../../../util/cover-src')

const {
  validateTrackgroupItems
  // validateParams
  // validateQuery
} = require('../../../schemas/trackgroup')

const ajv = new AJV({
  allErrors: true,
  removeAdditional: true
})

ajvKeywords(ajv)
ajvFormats(ajv)

const validateTrackgroup = ajv.compile({
  type: 'object',
  additionalProperties: false,
  required: ['title', 'release_date'],
  properties: {
    creator_id: {
      type: 'number',
      minimum: 1
    },
    title: {
      type: 'string'
    },
    display_artist: {
      type: 'string'
    },
    release_date: {
      type: 'string',
      format: 'date'
    },
    type: {
      type: 'string',
      enum: ['lp', 'ep', 'single', 'playlist', 'compilation']
    },
    about: {
      type: 'string'
    },
    cover: {
      type: 'string',
      format: 'uuid'
    },
    composers: {
      type: 'array',
      items: {
        type: 'string'
      }
    },
    performers: {
      type: 'array',
      items: {
        type: 'string'
      }
    },
    tags: {
      type: 'array',
      items: {
        type: 'string'
      }
    }
  }
})

const trackgroups = new Koa()
const user = new Roles({
  async failureHandler (ctx, action) {
    ctx.status = 403

    ctx.body = {
      message: 'Access Denied - You don\'t have permission to: ' + action
    }
  }
})
const router = new Router()

trackgroups.use(user.middleware())

user.use((ctx, action) => {
  //  FINDME
  // return ctx.profile || action === 'access trackgroups'
  return !!ctx.profile
})

user.use('access trackgroups', async (ctx, action) => {
  const allowed = ['admin', 'superadmin']
  const role = await Role.findOne({
    where: {
      id: ctx.profile.roleId
    }
  })
  if (allowed.includes(role.name)) {
    return true
  }
})

user.use(async (ctx, action) => {
  const allowed = ['admin', 'superadmin']
  const role = await Role.findOne({
    where: {
      id: ctx.profile.roleId
    }
  })
  if (allowed.includes(role)) {
    return true
  }
})

router.get('/', user.can('access trackgroups'), async (ctx, next) => {
  try {
    // FIXME Add query validation
    // const isValid = validateQuery(ctx.request.query)

    // if (!isValid) {
    //   const { message, dataPath } = validateQuery.errors[0]
    //   ctx.status = 400
    //   ctx.throw(400, `${dataPath}: ${message}`)
    // }

    const { type, limit = 20, page = 1, featured, private: _private, download, enabled } = ctx.request.query

    const where = {
      type: {
        [Op.or]: {
          [Op.eq]: null,
          [Op.notIn]: ['playlist', 'compilation'] // hide playlists and compilations
        }
      }
    }

    if (download) {
      where.download = true
    }

    if (_private) {
      where.private = true
    }

    if (enabled) {
      where.enabled = true
    }

    if (featured) {
      where.featured = true
    }

    if (type) {
      where.type = type
    }
    const { rows: result, count } = await TrackGroup.findAndCountAll({
      limit,
      offset: page > 1 ? (page - 1) * limit : 0,
      attributes: [
        'id',
        'cover',
        'title',
        'type',
        'about',
        'private',
        'display_artist',
        'composers',
        'performers',
        'release_date',
        'enabled'
      ],
      include: [
        {
          model: File,
          required: false,
          attributes: ['id', 'owner_id', 'mime'],
          as: 'cover_metadata',
          where: {
            mime: {
              [Op.in]: ['image/jpeg', 'image/png']
            }
          }
        }
      ],
      where,
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
        const o = Object.assign({}, item.dataValues)

        o.performers = item.get('performers')
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
})

/**
 * Get a release
 */

router.get('/:id', user.can('access trackgroups'), async (ctx, next) => {
  // const isValid = validateParams(ctx.params)

  // if (!isValid) {
  //   const { message, dataPath } = validateParams.errors[0]
  //   ctx.status = 400
  //   ctx.throw(400, `${dataPath}: ${message}`)
  // }

  const { type } = ctx.request.query

  const where = {
    id: ctx.params.id
  }

  if (type) {
    where.type = type
  }

  try {
    const result = await TrackGroup.findOne({
      where,
      order: [
        [{ model: TrackGroupItem, as: 'items' }, 'index', 'asc']
      ],
      include: [
        {
          model: File,
          required: false,
          attributes: ['id', 'owner_id', 'mime'],
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
            attributes: [
              'id',
              'title',
              'cover_art',
              'album',
              'artist',
              'duration',
              'status',
              'composer',
              'year'
            ],
            as: 'track',
            include: [
              {
                model: File,
                attributes: ['id', 'owner_id'],
                as: 'audiofile'
              },
              {
                model: File,
                attributes: ['id', 'size', 'owner_id'],
                as: 'cover'
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

    let ext = '.jpg'

    if (ctx.accepts('image/webp')) {
      ext = '.webp'
    }

    const variants = [120, 600]

    data.items = data.items.map((item) => {
      item.track.cover = item.track.cover === null
        ? coverSrc(item.track.cover_art, '120', '.jpg', true)
        : coverSrc(item.track.cover, '120', ext, false)

      return item
    })

    data.cover = coverSrc(data.cover, '600', ext, !data.cover_metadata)

    data.images = variants.reduce((o, key) => {
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
      data.cover_metadata = { id: data.cover }
    }

    ctx.body = {
      data,
      status: 'ok'
    }
  } catch (err) {
    ctx.throw(ctx.status, err.message)
  }

  await next()
})

/**
 * Add release
 */

router.post('/', user.can('create track groups'), async (ctx, next) => {
  const body = ctx.request.body
  const isValid = validateTrackgroup(body)

  if (!isValid) {
    const { message, dataPath } = validateTrackgroup.errors[0]
    ctx.status = 400
    ctx.throw(400, `${dataPath}: ${message}`)
  }

  const creatorId = body.creator_id || ctx.profile.id

  try {
    const result = await TrackGroup.create(Object.assign(body, { creator_id: creatorId }))

    ctx.status = 201
    ctx.body = {
      data: result.get({
        plain: true
      }),
      status: 201
    }
  } catch (err) {
    ctx.throw(ctx.status, err.message)
  }

  await next()
})

/**
 * Update endpoint for admin only
 * Primarly used to change trackgroup ownership
 */

router.put('/:id', user.can('access trackgroups'), async (ctx, next) => {
  const body = ctx.request.body
  const isValid = validateTrackgroup(body)

  if (!isValid) {
    const { message, dataPath } = validateTrackgroup.errors[0]
    ctx.status = 400
    ctx.throw(400, `${dataPath}: ${message}`)
  }

  try {
    let result = await TrackGroup.update(body, {
      where: {
        id: ctx.params.id
      }
    })

    if (!result) {
      ctx.status = 404
      ctx.throw(ctx.status, 'Could not update')
    }

    result = await TrackGroup.findOne({
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
})

/*
 * Replace existing trackgroup items if any
 */

router.put('/:id/items', user.can('access trackgroups'), async (ctx, next) => {
  const body = ctx.request.body
  const isValid = validateTrackgroupItems(body)

  if (!isValid) {
    const { message, dataPath } = validateTrackgroupItems.errors[0]
    ctx.status = 400
    ctx.throw(400, `${dataPath}: ${message}`)
  }

  try {
    let result = await TrackGroup.findOne({
      where: {
        id: ctx.params.id
      },
      include: [{
        model: TrackGroupItem,
        attributes: ['id', 'index'],
        as: 'items',
        include: [{
          model: Track,
          as: 'track'
        }]
      }]
    })

    if (!result) {
      ctx.status = 404
      ctx.throw(ctx.status, 'Track group does not exist or does not belong to your user account')
    }

    const count = result.items.length

    await TrackGroupItem.destroy({
      where: {
        trackgroupId: ctx.params.id
      }
    })

    // assign trackgroup id ref to each track group item
    const trackGroupItems = body.tracks.map((item, index) => {
      const o = Object.assign(item, {
        trackgroupId: ctx.params.id
      })
      if (!item.index) {
        o.index = count + 1
      }
      return o
    })

    await TrackGroupItem.bulkCreate(trackGroupItems)

    result = await TrackGroupItem.findAll({
      where: {
        trackgroupId: ctx.params.id
      },
      include: [{
        model: Track,
        as: 'track'
      }],
      order: [
        ['index', 'ASC']
      ]
    })

    ctx.body = {
      data: result,
      status: 'ok'
    }
  } catch (err) {
    ctx.throw(ctx.status, err.message)
  }

  await next()
})

/**
 * Add trackgroup items
 */

router.put('/:id/items/add', user.can('access trackgroups'), async (ctx, next) => {
  const body = ctx.request.body
  const isValid = validateTrackgroupItems(body)

  if (!isValid) {
    const { message, dataPath } = validateTrackgroupItems.errors[0]
    ctx.status = 400
    ctx.throw(400, `${dataPath}: ${message}`)
  }

  try {
    let result = await TrackGroup.findOne({
      where: {
        id: ctx.params.id
      },
      include: [{
        model: TrackGroupItem,
        attributes: ['id', 'index'],
        as: 'items',
        include: [{
          model: Track,
          as: 'track'
        }]
      }]
    })

    if (!result) {
      ctx.status = 404
      ctx.throw(ctx.status, 'Track group does not exist or does not belong to your user account')
    }

    const count = result.items.length

    // assign trackgroup id ref to each track group item
    const trackGroupItems = body.tracks.map((item, index) => {
      const o = Object.assign(item, {
        trackgroupId: ctx.params.id
      })
      if (!item.index) {
        o.index = count + 1 + index
      }
      return o
    })

    await TrackGroupItem.bulkCreate(trackGroupItems)

    result = await TrackGroupItem.findAll({
      where: {
        trackgroupId: ctx.params.id
      },
      include: [{
        model: Track,
        as: 'track'
      }],
      order: [
        ['index', 'ASC']
      ]
    })

    ctx.body = {
      data: result,
      status: 'ok'
    }
  } catch (err) {
    ctx.throw(ctx.status, err.message)
  }

  await next()
})

/**
 * Remove trackgroup items
 */

router.put('/:id/items/remove', user.can('access trackgroups'), async (ctx, next) => {
  const body = ctx.request.body
  const isValid = validateTrackgroupItems(body)

  if (!isValid) {
    const { message, dataPath } = validateTrackgroupItems.errors[0]
    ctx.status = 400
    ctx.throw(400, `${dataPath}: ${message}`)
  }

  const ids = body.tracks.map((item) => item.track_id)

  try {
    let result = await TrackGroup.findOne({
      where: {
        id: ctx.params.id
      }
    })

    if (!result) {
      ctx.status = 404
      ctx.throw(ctx.status, 'Track group does not exist or does not belong to your user account')
    }

    await TrackGroupItem.destroy({
      where: {
        track_group_id: ctx.params.id,
        track_id: {
          [Op.in]: ids
        }
      }
    })

    result = await TrackGroupItem.findAll({
      raw: true,
      where: {
        track_group_id: ctx.params.id
      },
      order: [
        ['index', 'ASC']
      ]
    })

    /*
     * Reset indexes
     */

    if (result) {
      const promises = result.map((item, index) => {
        const data = { index: index + 1 }
        return TrackGroupItem.update(data, {
          where: {
            id: item.id
          }
        })
      })

      await Promise.all(promises)
    }

    result = await TrackGroupItem.findAll({
      where: {
        trackgroupId: ctx.params.id
      },
      include: [{
        model: Track,
        as: 'track'
      }],
      order: [
        ['index', 'ASC']
      ]
    })

    ctx.body = {
      data: result,
      status: 'ok'
    }
  } catch (err) {
    ctx.throw(ctx.status, err.message)
  }

  await next()
})

/**
 * Delete release track_group and related items
 */

router.delete('/:id', user.can('access trackgroups'), async (ctx, next) => {
  try {
    await TrackGroup.destroy({
      where: {
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
      message: 'ok'
    }
  } catch (err) {
    ctx.throw(ctx.status, err.message)
  }

  await next()
})

router.put('/:id/settings', user.can('access trackgroups'), async (ctx, next) => {
  const body = ctx.request.body
  const isValid = new AJV({
    allErrors: true,
    removeAdditional: true
  }).compile({
    type: 'object',
    properties: {
      creator_id: {
        type: 'number',
        minimum: 1
      },
      private: {
        type: 'boolean'
      },
      enabled: {
        type: 'boolean'
      },
      download: {
        type: 'boolean'
      }
    }
  })

  if (!isValid) {
    const { message, dataPath } = validateTrackgroupItems.errors[0]
    ctx.status = 400
    ctx.throw(400, `${dataPath}: ${message}`)
  }

  try {
    await TrackGroup.update(body, {
      where: {
        id: ctx.params.id
      }
    })

    ctx.body = {
      data: null,
      status: 'ok'
    }
  } catch (err) {
    ctx.throw(ctx.status, err.message)
  }

  await next()
})

trackgroups
  .use(koaBody())
  .use(router.routes())
  .use(router.allowedMethods({
    throw: true
  }))

module.exports = trackgroups
