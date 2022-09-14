const ffmpeg = require('fluent-ffmpeg')

// Try this with some flac with no headers
function getAudioDurationInSeconds (filepath) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filepath, (err, metadata) => {
      if (err) return reject(err)

      return resolve(metadata.format.duration)
    })
  })
}

module.exports = getAudioDurationInSeconds
