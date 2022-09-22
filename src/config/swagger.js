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
          url: getServiceUrl(''),
          name: 'Resonate API'
        },
        {
          url: getServiceUrl('/user/collection'),
          name: 'User Collection API Service'
        },
        {
          url: getServiceUrl('/user/favorites'),
          name: 'User Favorites API Service'
        },
        {
          url: getServiceUrl('/user/plays'),
          name: 'User Plays API Service'
        },
        {
          url: getServiceUrl('/user/trackgroups'),
          name: 'User Trackgroups API Service'
        },
        {
          url: getServiceUrl('/user/tracks'),
          name: 'User Tracks API Service'
        }
      ]
    }
  }
}
