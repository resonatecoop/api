const getServiceUrl = path => {
  const basePath = `/api/v3${path}`
  const url = new URL(basePath + '/apiDocs', process.env.APP_HOST)
  url.search = new URLSearchParams({
    type: 'apiDoc'
  })
  return url.href
}

module.exports = () => {
  return {
    swaggerOptions: {
      urls: [
        {
          url: '/api/v3/apiDocs?type=apiDoc',
          name: 'Resonate API'
        }
      ]
    }
  }
}
