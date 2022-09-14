const path = require('path')
const getAudioDuration = require('../util/get-audio-duration')

const BASE_DATA_DIR = process.env.BASE_DATA_DIR || '/'

module.exports = async job => {
  const { filename } = job.data
  try {
    // fallback for file with no headers?
    // see: https://github.com/Borewit/music-metadata/issues/543
    // https://github.com/Borewit/music-metadata/pull/584 partially addressed?
    const duration = await getAudioDuration(path.join(BASE_DATA_DIR, `/data/media/incoming/${filename}`))

    return Promise.resolve(duration)
  } catch (err) {
    return Promise.reject(err)
  }
}
