
// all role-related test I could find in the existing test suite

const { request, expect, path } = require('../testConfig')

describe('Roles endpoint tests', () => {
  let response = null

  //  FIXME: not sure this is good coverage
  it('should reject a request without an id', async () => {
    response = await request.get('/role')

    expect(response.status).to.eql(404)
  })

  describe('AS-BUILT Tests', () => {
    describe('test-as-built/roles.js', () => {
      it.skip('should fail with 401:unauthorized', async () => {
        response = await request.post('/upload')
          .field('name', 'uploads')
          .attach('uploads', path.join(__dirname, './fixtures/Resonate.aiff.js'))

        expect(response.status).to.eql(401)
      })
    })
  })
})
