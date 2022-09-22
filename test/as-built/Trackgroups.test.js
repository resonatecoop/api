// test-as-built/trackgroups.js

// FIXME: this looks like it duplicates test-as-built/user/trackgroups.js

const { baseURL, request, expect, testUserId } = require('../testConfig') 

describe('Trackgroups endpoint test', () => {
  let response = null

  // FIXME: this might not be correct / good coverage
  it('should reject a request without an id', async () => {
    response = await request.get('/trackgroups')

    expect(response.status).to.eql(404)
  })

  describe('AS-BUILT Tests', () => {
    let uuid = null

    describe('test-as-built/trackgroups.js', () => {
      it('should create and save a new release', async () => {
        response = await request.post('/trackgroups')
                                .send({
                                  title: 'Claustro',
                                  display_artist: 'Burial',
                                  type: 'ep',
                                  release_date: '2019-01-02',
                                  cover: '13a4dedc-8b54-413c-bbd5-a96c6b99d91a',
                                  composers: ['Burial'],
                                  performers: ['Burial'],
                                  tags: ['techno', 'experimental'],
                                  about: `
                                    this is about the release
                                  `
                                })
        
        expect(response.status).to.eql(201)

        uuid = response.body.data.id

        // FIXME: convert to chai expect format
        // t.equal(response.body.data.title, 'Claustro', '`data.title` should be equal to `Claustro`')
        // t.equal(response.body.data.display_artist, 'Burial', '`data.display_artist` should be equal to `Burial`')
        // t.equal(response.body.data.type, 'ep', '`data.type` should be equal to `ep`')
        // t.equal(response.body.data.release_date, '2019-01-02', '`data.release_date` should be equal to `2019-01-02`')
        // t.equal(response.body.data.composers.length, 1, '`data.composers` should contain two items')
        // t.equal(response.body.data.composers[0], 'Burial', '`data.composers` first item should be equal to `Burial`')
        // t.equal(response.body.data.performers.length, 1, '`data.performers` should contain two items')
        // t.equal(response.body.data.performers[0], 'Burial', '`data.performers` first item should be equal to `Burial`')
        // t.equal(response.body.data.tags.length, 2, '`data.tags` should contain two items')
        // t.equal(response.body.data.tags[0], 'techno', '`data.tags` first item should be equal to `techno`')
      })
      it('should find a release', async () => {
        response = await request.get(`/trackgroups/${uuid}`)

        expect(response.status).to.eql(200)
      })
      it('should update a release', async () => {
        response = await request.put(`/trackgroups/${uuid}`)
                                .send({
                                  title: 'Claustro',
                                  display_artist: 'Burial',
                                  type: 'ep',
                                  release_date: '2019-02-03',
                                  cover: '13a4dedc-8b54-413c-bbd5-a96c6b99d91a',
                                  composers: ['Burial'],
                                  performers: ['Burial'],
                                  tags: ['techno', 'experimental'],
                                  about: `
                                    this is about the release
                                  `
                                })
        
        expect(response.status).to.eql(200)
      })
      it('should add items', async () => {
        response = await request.put(`/trackgroups/${uuid}/items/add`)
                                .send({
                                  tracks: [
                                    {
                                      title: 'Test track',
                                      track_id: 4,
                                      index: 1
                                    }
                                  ]
                                })
        
        expect(response.status).to.eql(200)
      })
      it('should replace items', async () => {
        response = await request.put(`/trackgroups/${uuid}/items`)
                                .send({
                                  tracks: [
                                    {
                                      title: 'Test track',
                                      track_id: 1,
                                      index: 1
                                    },
                                    {
                                      title: 'Test track 3',
                                      track_id: 2,
                                      index: 2
                                    },
                                    {
                                      title: 'Test track 2',
                                      track_id: 3,
                                      index: 3
                                    }
                                  ]
                                })
        
        expect(response.status).to.eql(200)
      })
      it('should remove items', async () => {
        response = await request.put(`/trackgroups/${uuid}/items/remove`)
                                .send({
                                  tracks: [
                                    {
                                      track_id: 2
                                    },
                                    {
                                      track_id: 4
                                    }
                                  ]
                                })
        
        expect(response.status).to.eql(200)
      })
      it('should update privacy', async () => {
        response = await request.put(`/trackgroups/${uuid}/privacy`)
                                .send({
                                  private: true
                                })
        
        expect(response.status).to.eql(200)
      })
      it('should delete release', async () => {
        response = await request.delete(`/trackgroups/${uuid}`)

        expect(response.status).to.eql(200)
      })
      it('should fail with bad request', async () => {
        response = await request.post('/trackgroups')
                                .send({
                                  title: 'Claustro'
                                  // display_artist: 'Burial',
                                })
        
        expect(response.status).to.eql(400)
      })
      it('should fail with 404', async () => {
        response = await request.get(`/trackgroups/${uuid}`)

        expect(response.status).to.eql(404)
      })
    })
  })
})