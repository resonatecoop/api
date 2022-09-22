const Router = require('@koa/router')
const { initialize } = require('koa-openapi')
const openapiDoc = require('./api-doc')
const koaBody = require('koa-body')
const bytes = require('bytes')
const path = require('path')

const playlists = new Router()
const router = new Router()
const BASE_DATA_DIR = process.env.BASE_DATA_DIR || '/'

initialize({
  router,
  basePath: '/v3/user/playlists',
  apiDoc: openapiDoc,
  paths: [
    { path: '/apiDocs', module: require('./routes/apiDocs') },
    { path: '/', module: require('./routes') },
    { path: '/{id}', module: require('./routes/{id}') },
    { path: '/{id}/cover', module: require('./routes/{id}/cover') },
    { path: '/{id}/privacy', module: require('./routes/{id}/privacy') },
    { path: '/{id}/items', module: require('./routes/{id}/items') },
    { path: '/{id}/items/add', module: require('./routes/{id}/items/add') },
    { path: '/{id}/items/remove', module: require('./routes/{id}/items/remove') }
  ]
})

playlists.use(koaBody({
  multipart: true,
  formidable: {
    uploadDir: path.join(BASE_DATA_DIR, '/data/media/incoming/'),
    maxFileSize: bytes('2 GB')
  },
  onError: (err, ctx) => {
    console.log(err)
    if (/maxFileSize/.test(err.message)) {
      ctx.status = 400
      ctx.throw(400, err.message)
    }
  }
}))
playlists.use('/playlists', router.routes(), router.allowedMethods({ throw: true }))

module.exports = playlists
