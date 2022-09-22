const test = require('tape')
const path = require('path')
const mm = require('music-metadata')
const roundTo = require('round-to')
const { v4: uuid } = require('uuid')
const { getAudioDurationInSeconds } = require('get-audio-duration')

// const sequelize = require('sequelize')
// const { Op } = require('sequelize')
// const decodeUriComponent = require('decode-uri-component')

require('dotenv-safe').config({ path: path.join(__dirname, '../../../.env.test.js') })

const { Track } = require('../../../lib/db/models.js')

test('should parse metadata and save a new track', async t => {
  t.plan(2)

  try {
    const metadata = await mm.parseFile(path.join(__dirname, '../../fixtures/test.wav.js'), {
      duration: true,
      skipCovers: true
    })

    let duration = metadata.format.duration

    if (!duration) {
      // fallback for file with no headers
      // see: https://github.com/Borewit/music-metadata/issues/543
      duration = await getAudioDurationInSeconds(path.join(__dirname, '../../fixtures/test.flac.js'))
    }

    const data = {}
    const track = await Track.create({
      title: metadata.common.title,
      creator_id: 0,
      url: uuid(),
      artist: metadata.common.artist,
      album: metadata.common.album,
      duration: duration,
      year: metadata.common.year,
      album_artist: metadata.common.albumartist,
      number: metadata.common.track.no,
      createdAt: new Date().getTime() / 1000 | 0
    })

    data.metadata = metadata.common
    data.track = track.get({ plain: true })

    t.equal(data.track.duration, roundTo.down(duration, 2))

    t.pass('ok')
  } catch (err) {
    t.end(err)
  }
})

/**
 * Testing cleanup
 */
/*

test('should get some tracks', async t => {
  t.plan(1)

  try {
    const { rows: result } = await Track.findAndCountAll({
      attributes: [
        [sequelize.fn('DISTINCT', sequelize.col('track_cover_art')), 'track_cover_art']
      ],
      where: {
        url: {
          [Op.ne]: sequelize.col('track_cover_art')
        }
      },
      limit: 100
    })

    const data = result.map((track) => {
      const cover = track.get('track_cover_art')
      return {
        cover_art: decodeUriComponent(cover).replace('track/visual/', '').split('.')[0]
      }
    })

    console.log(data)

    t.pass('ok')
  } catch (err) {
    t.end(err)
  }
})
*/
