const DEFAULT_STATIC_BASE_PATH = process.env.STATIC_MEDIA_HOST

const coverSrc = (uuid, size, ext, fallback = false) => {
  if (!uuid) return

  const pathname = `/images/${uuid}-x${size}${ext}`
  const url = new URL(pathname, DEFAULT_STATIC_BASE_PATH)

  // if (fallback) {
  //   pathname = `/track-artwork/${size}x${size}/${uuid}`
  //   url = new URL(pathname, FALLBACK_STATIC_BASE_PATH)
  // }

  return url.href
}

module.exports = coverSrc
