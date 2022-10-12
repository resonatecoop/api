/* eslint-disable no-unused-expressions */
/* eslint-env mocha */

const { request, expect, testLabelId } = require('../../testConfig')

describe.skip('Api.ts/labels endpoint test', () => {
  let response = null

  it('should get all labels', async () => {
    response = await request.get('/labels')

    console.log('should get all labels RESPONSE: ', response.text)
    expect(response.status).to.eql(200)

    const attributes = response.body
    expect(attributes).to.be.an('object')
    expect(attributes).to.include.keys('data', 'count', 'pages')

    expect(attributes.data).to.be.an('array')
    expect(attributes.data.length).to.greaterThan(0)

    const theData = attributes.data[0]
    expect(theData).to.include.keys('')
    expect(theData.xxx).to.eql()

    expect(attributes.count).to.eql(1)
    expect(attributes.numberOfPages).to.eql(1)
    expect(attributes.status).to.eql('ok')
  })
  it('should get a label by id', async () => {
    response = await request.get(`/labels/${testLabelId}`)

    expect(response.status).to.eql(200)

    const attributes = response.body
    expect(attributes).to.be.an('object')
    expect(attributes).to.include.keys('data', 'count', 'pages')

    expect(attributes.data).to.be.an('array')
    expect(attributes.data.length).to.greaterThan(0)

    // const theData = attributes.data[0]
    // expect(theData).to.include.keys("")
    // expect(theData.xxx).to.eql()

    // expect(attributes.count).to.eql(1)
    // expect(attributes.numberOfPages).to.eql(1)
    // expect(attributes.status).to.eql('ok')
  })
  it('should a label\'s releases by label id', async () => {
    response = await request.get(`/labels/${testLabelId}/releases`)

    expect(response.status).to.eql(200)

    const attributes = response.body
    expect(attributes).to.be.an('object')
    expect(attributes).to.include.keys('data', 'count', 'pages')

    expect(attributes.data).to.be.an('array')
    expect(attributes.data.length).to.greaterThan(0)

    // const theData = attributes.data[0]
    // expect(theData).to.include.keys("")
    // expect(theData.xxx).to.eql()

    // expect(attributes.count).to.eql(1)
    // expect(attributes.numberOfPages).to.eql(1)
    // expect(attributes.status).to.eql('ok')
  })
  it('should get a label\'s artists by label id', async () => {
    response = await request.get(`/labels/${testLabelId}/artists`)

    expect(response.status).to.eql(200)

    const attributes = response.body
    expect(attributes).to.be.an('object')
    expect(attributes).to.include.keys('data', 'count', 'pages')

    expect(attributes.data).to.be.an('array')
    expect(attributes.data.length).to.greaterThan(0)

    // const theData = attributes.data[0]
    // expect(theData).to.include.keys("")
    // expect(theData.xxx).to.eql()

    // expect(attributes.count).to.eql(1)
    // expect(attributes.numberOfPages).to.eql(1)
    // expect(attributes.status).to.eql('ok')
  })
  it('should get a label\'s albums by label id', async () => {
    response = await request.get(`/labels/${testLabelId}/albums`)

    expect(response.status).to.eql(200)

    const attributes = response.body
    expect(attributes).to.be.an('object')
    expect(attributes).to.include.keys('data', 'count', 'pages')

    expect(attributes.data).to.be.an('array')
    expect(attributes.data.length).to.greaterThan(0)

    // const theData = attributes.data[0]
    // expect(theData).to.include.keys("")
    // expect(theData.xxx).to.eql()

    // expect(attributes.count).to.eql(1)
    // expect(attributes.numberOfPages).to.eql(1)
    // expect(attributes.status).to.eql('ok')
  })
})