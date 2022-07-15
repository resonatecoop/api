const getServiceUrl = path => {
  const basePath = path
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
          url: getServiceUrl('/users'),
          name: 'Users API Service'
        },
        {
          url: getServiceUrl('/search'),
          name: 'Search API Service'
        },
        {
          url: getServiceUrl('/tag'),
          name: 'Tag API Service'
        },
        {
          url: getServiceUrl('/trackgroups'),
          name: 'Trackgroups API Service'
        },
        {
          url: getServiceUrl('/tracks'),
          name: 'Tracks API Service'
        },
        {
          url: getServiceUrl('/resolve'),
          name: 'Resolve API Service'
        },
        {
          url: getServiceUrl('/artists'),
          name: 'Artist Profiles API Service'
        },
        {
          url: getServiceUrl('/labels'),
          name: 'Label Profiles API Service'
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
        },
        {
          url: getServiceUrl('/user/profile'),
          name: 'User Profile API Service'
        }
      ]
    }
  }
}
