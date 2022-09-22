const test = require('tape')
const path = require('path')
const genAudio = require('../src/util/gen-silent-audio')
const ffprobe = require('../src/util/ffprobe-metadata')
const mm = require('music-metadata')

require('dotenv-safe').config({ path: path.join(__dirname, '../.env.test') })

/**
 * Testing various solutions for reading/writing tags
 */

test('should gen audio file and get file metadata', async t => {
  t.plan(4)

  try {
    const metadata = {
      title: 'Resonate',
      artist: 'Resonate',
      genre: 'Silent',
      albumArtist: 'Resonate',
      album: 'Resonate',
      composer: 'Resonate',
      year: 2020
    }

    await genAudio(path.join(__dirname, './fixtures/Resonate.aiff'), metadata)

    const res = await ffprobe(path.join(__dirname, './fixtures/Resonate.aiff'))

    t.equal(typeof res, 'object', 'result should be an object')
    t.equal(res.duration, 60, 'duration should be equal to 60')
    t.equal(res.title, 'Resonate', 'title should be equal to `Resonate`')
    t.equal(res.year, 2020, 'year should be equal to `2020`')
  } catch (err) {
    t.end(err)
  }
})

test('should read id3 metadata using music-metadata', async t => {
  t.plan(1)

  try {
    const metadata = {
      title: 'Resonate',
      artist: 'Resonate',
      genre: 'Silent',
      albumArtist: 'Resonate',
      album: 'Resonate',
      composer: 'Resonate',
      year: 2020
    }

    await genAudio(path.join(__dirname, './fixtures/Resonate.aiff'), metadata)

    const tags = await mm.parseFile(path.join(__dirname, './fixtures/Resonate.aiff'))

    t.equal(tags.common.title, 'Resonate', 'title should be equal to `Resonate`')
    // t.equal(tags.year, 2020, 'year should be equal to `2020`') year not showing up ?
  } catch (err) {
    t.end(err)
  }
})

test('should gen audio file without metadata and not complain', async t => {
  t.plan(1)

  try {
    await genAudio(path.join(__dirname, './fixtures/Resonate.aiff'))

    const res = await ffprobe(path.join(__dirname, './fixtures/Resonate.aiff'))

    t.equal(res.duration, 60, 'duration should be equal to 60')
  } catch (err) {
    t.end(err)
  }
})
