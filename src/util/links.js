const decodeUriComponent = require('decode-uri-component')
const normalizeUrl = require('normalize-url')

const base = {
  facebook: 'https://www.facebook.com',
  instagram: 'https://www.instagram.com',
  twitter: 'https://twitter.com',
  vimeo: 'https://vimeo.com',
  youtube: 'https://www.youtube.com/user'
}

module.exports = (...links) => {
  return links
    .filter(([platform, value]) => {
      if (!value) return false
      return true
    })
    .map(([platform, value]) => {
      const isWebsite = platform === 'website'

      if (!isWebsite) {
        const parts = value.split('/')

        if (parts.length === 1) {
          // assume it's only an username
          value = base[platform] + '/' + value
          return {
            href: value,
            text: normalizeUrl(value, { stripWWW: true, stripProtocol: true })
          }
        }
      }

      let removeQueryParameters = [/^\w+/i] // remove all query params

      if (platform === 'youtube' && value.includes('watch?')) {
        removeQueryParameters = [/^utm_\w+/i] // default
      }

      return {
        href: decodeUriComponent(normalizeUrl(value, { forceHttps: !isWebsite, stripWWW: false, removeQueryParameters })),
        text: decodeUriComponent(normalizeUrl(value, { stripWWW: true, stripProtocol: true, removeQueryParameters }))
      }
    })
}
