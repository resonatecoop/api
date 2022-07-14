const DEFAULT_STATIC_BASE_PATH = 'https://' + process.env.STATIC_HOSTNAME
const FALLBACK_STATIC_BASE_PATH = 'https://static.resonate.is'

const coverSrc = (uuid, size, ext, fallback = false) => {
  if (!uuid) return

  let pathname = `/images/${uuid}-x${size}${ext}`
  let url = new URL(pathname, DEFAULT_STATIC_BASE_PATH)

  if (fallback) {
    pathname = `/track-artwork/${size}x${size}/${uuid}`
    url = new URL(pathname, FALLBACK_STATIC_BASE_PATH)
  }

  return url.href
}

module.exports = coverSrc
