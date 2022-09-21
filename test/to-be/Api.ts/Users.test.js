
const {request, expect, testUserId} = require('../../testConfig') 

describe.skip('Users endpoint test', () => {
  let response = null

  it('should reject a request without a user id', async () => {
    response = await request.get('/users')

    expect(response.status).to.eql(404) 
  })

  describe('NEW Tests', () => {
    it('should return data for the test user id', async () => {
      response = await request.get(`/users/${testUserId}`)

      if (response.status != 200) {
        console.log(response.error.text)
      }
      expect(response.status).to.eql(200)
    })    
  })


})