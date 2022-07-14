module.exports.HIGH_RES_AUDIO_MIME_TYPES = [
  'audio/x-flac',
  'audio/vnd.wave',
  'audio/aiff'
]

module.exports.SUPPORTED_IMAGE_MIME_TYPES = [
  'image/png',
  'image/jpeg'
]

module.exports.SUPPORTED_AUDIO_MIME_TYPES = [
  'audio/aac',
  'audio/aiff',
  'audio/mp4',
  'audio/vnd.wave',
  'audio/x-flac',
  'audio/x-m4a'
]

module.exports.SUPPORTED_MEDIA_TYPES = [
  ...module.exports.SUPPORTED_AUDIO_MIME_TYPES,
  ...module.exports.SUPPORTED_IMAGE_MIME_TYPES,
  'text/csv'
]
