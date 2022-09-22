
// all metadata-related test I could find in the existing test suite

const { baseURL, request, expect, testUserId, genAudio, path } = require('../testConfig') 

describe('Metadata endpoint tests', () => {
  let response = null

  //  FIXME: not sure this is good coverage
  it('should reject a request without an id', async () => {
    response = await request.get('/metadata')

    expect(response.status).to.eql(404)
  })

  describe('AS-BUILT Tests', () => {
    describe('test-as-built/metadata.js', () => {
      const metadata = {
                          title: 'Resonate',
                          artist: 'Resonate',
                          genre: 'Silent',
                          albumArtist: 'Resonate',
                          album: 'Resonate',
                          composer: 'Resonate',
                          year: 2020
                        }
      
      it('should gen audio file and get file metadata', async () => {
        await genAudio(path.join(__dirname, './fixtures/Resonate.aiff'), metadata)
        const res = await ffprobe(path.join(__dirname, './fixtures/Resonate.aiff'))
        
        // FIXME: convert to chai expect format
        // t.equal(typeof res, 'object', 'result should be an object')
        // t.equal(res.duration, 60, 'duration should be equal to 60')
        // t.equal(res.title, 'Resonate', 'title should be equal to `Resonate`')
        // t.equal(res.year, 2020, 'year should be equal to `2020`')
        
        // FIXME: original test has no expect
        // expect(response.status).to.eql()
      })
      it('should read id3 metadata using music-metadata', async () => {
        await genAudio(path.join(__dirname, './fixtures/Resonate.aiff'), metadata)

        const tags = await mm.parseFile(path.join(__dirname, './fixtures/Resonate.aiff'))

        // FIXME: convert to chai expect format
        // t.equal(tags.common.title, 'Resonate', 'title should be equal to `Resonate`')
        
        // FIXME: original test has no expect
        // expect(response.status).to.eql()
      })
      it('should gen audio file without metadata and not complain', async () => {

        await genAudio(path.join(__dirname, './fixtures/Resonate.aiff'))
        const res = await ffprobe(path.join(__dirname, './fixtures/Resonate.aiff'))

        // FIXME: convert to chai expect format
        // t.equal(res.duration, 60, 'duration should be equal to 60')

        // FIXME: original test has no expect
        // expect(response.status).to.eql()
      })
    })
  })
})