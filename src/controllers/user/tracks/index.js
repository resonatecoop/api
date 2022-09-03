const Router = require('@koa/router')
const { initialize } = require('koa-openapi')
const openapiDoc = require('./api-doc')
const cors = require('@koa/cors')
const koaBody = require('koa-body')
const bytes = require('bytes')
const path = require('path')

const tracks = new Router()
const router = new Router()

const BASE_DATA_DIR = process.env.BASE_DATA_DIR || '/'

initialize({
  router,
  basePath: '/v3/user/tracks',
  apiDoc: openapiDoc,
  paths: [
    { path: '/apiDocs', module: require('./routes/apiDocs') },
    { path: '/', module: require('./routes') },
    { path: '/{id}', module: require('./routes/{id}') },
    { path: '/{id}/file', module: require('./routes/{id}/file') }
  ],
  dependencies: {
    trackService: require('../../tracks/services/trackService')
  }
})

tracks.use(koaBody({
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
tracks.use(cors())
tracks.use('/tracks', router.routes(), router.allowedMethods({ throw: true }))

module.exports = tracks
