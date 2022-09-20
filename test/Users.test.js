
// all user-related tests I could find in the existing test suite

const {baseURL, request, expect, testUserId} = require('./testConfig') 

describe('Users endpoint test', () => {
  let response = null

  it('should reject a request without a user id', async () => {
    response = await request.get('/users')

    expect(response.status).to.eql(404) 
  })

  describe.only('AS-BUILT Tests', () => {
    describe('test-as-built/users.js', () => {
      it('should fetch user playlists', async () => {
        response = await request.get('/users/12788/playlists')

        expect(response.status).to.eql(200)
      })
    })    

    describe('test-as-built/user/credit.js', () => {
      it('play', async () => {
        response = await request.post('/plays')
                                .send({
                                  track_id: 144
                                })
        expect(response.status).to.eql(200)
      })
    })
    describe('test-as-built/user/payment.js', () => {
      let pid

      it('create payment intent with invalid amount', async () => {
        response = await request.post('/payment/intent/create')
                                .send({
                                  currency: 'eur',
                                  amount: 0
                                })
        expect(response.status).to.eql(400)
      })
      it('create payment intent with invalid currency', async () => {
        response = await request.post('/payment/intent/create')
                                .send({
                                  currency: 'rub',
                                  amount: 4088
                                })
        expect(response.status).to.eql(400)
      })
      it('create payment intent', async () => {
        response = await request.post('/payment/intent/create')
                                .send({
                                  currency: 'eur',
                                  amount: 4088 // 5 €
                                })
        expect(response.status).to.eql(201)

        pid = response.body.data.transaction_id
      })
      it('confirm payment intent', async () => {
        response = await request.post('/payment/intent/confirm')
                                .send({
                                  transaction_id: pid,
                                  payment_method: 'pm_card_visa'
                                })
        expect(response.status).to.eql(200)
      })
      it('capture payment intent', async () => {
        response = await request.post('/payment/intent/capture')
                                .send({
                                  transaction_id: pid
                                })
        expect(response.status).to.eql(200)
      })
      it('create payment intent in usd', async () => {
        response = await request.post('/payment/intent/create')
                                .send({
                                  currency: 'usd',
                                  amount: 4088 // 5 €
                                })
        expect(response.status).to.eql(201)

        pid = response.body.data.transaction_id
      })
      it('cancel payment intent', async () => {
        response = await request.post('/payment/intent/cancel')
                                .send({
                                  transaction_id: pid
                                })
        expect(response.status).to.eql(200)

        pid = response.body.data.transaction_id
      })
    })
    describe('test-as-built/user/plays.js', () => {
      it('should get play counts for period', async () => {
        response = await request.get('/plays')
                                .query({
                                  type: 'free',
                                  period: 'monthly',
                                  from: '2019-01-01',
                                  to: '2019-06-01'
                                })
        expect(response.status).to.eql(200)
      })
    })
    describe('test-as-built/user/trackgroups.js', () => {
      let uuid = null

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
        response = request.put(`/trackgroups/${uuid}/items`)
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
    describe('test-as-built/user/tracks.js', () => {
      let id = null

      it('should save a track', async () => {
        response = await request.post('/tracks')
                                .send({
                                  title: 'Best track',
                                  artist: '@auggod',
                                  album_title: 'Unreleased',
                                  status: 'paid',
                                  year: 2019
                                })
        
        id = response.body.data.id
        
        expect(response.status).to.eql(201)
      })
      it('should find tracks', async () => {
        response = await request.get('/tracks')

        expect(response.status).to.eql(200)
      })
      it('should find a track', async () => {
        response = await request.get(`/tracks/${id}`)

        expect(response.status).to.eql(200)
      })
      it('should delete a track', async () => {
        response = await request.delete(`/tracks/${id}`)

        expect(response.status).to.eql(200)
      })
    })
  })

  describe.skip('NEW Tests', () => {
    it('should return data for the test user id', async () => {
      response = await request.get(`/users/${testUserId}`)

      if (response.status != 200) {
        console.log(response.error.text)
      }
      expect(response.status).to.eql(200)
    })    
  })


})