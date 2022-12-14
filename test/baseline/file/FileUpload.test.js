/* eslint-disable no-unused-expressions */
/* eslint-env mocha */

// ****************************************************************
//  THIS FILE IS USED TO GENERATE TEST DATA FOR THE files-seeder.js
//    SEQUELIZE SEEDER.
//  IT IS NOT A LEGITIMATE TEST FILE
// ****************************************************************
//  DO NOT RUN THIS FILE UNLESS YOU WANT TO GENERATE NEW TEST DATA
// ****************************************************************

// OUTPUT FROM process-file.js FOR TRACK ID 44a28752-1101-4e0d-8c40-2c36dc82d035
// resonate-api         | processFile.data:  {
// resonate-api         |   id: '8e2243a0-5c8d-4885-a134-460015dd52ef',
// resonate-api         |   status: 'processing',
// resonate-api         |   ownerId: '1c88dea6-0519-4b61-a279-4006954c5d4c',
// resonate-api         |   filename: '8e2243a0-5c8d-4885-a134-460015dd52ef',
// resonate-api         |   size: 466080,
// resonate-api         |   mime: 'audio/x-m4a',
// resonate-api         |   hash: '4beb60bbdd05674f0dba63b09b010bb11762acb6',
// resonate-api         |   updatedAt: 2022-12-10T04:38:25.061Z,
// resonate-api         |   createdAt: 2022-12-10T04:38:25.061Z,
// resonate-api         |   filename_prefix: null,
// resonate-api         |   description: null,
// resonate-api         |   metadata: {
// resonate-api         |     track: { no: null, of: null },
// resonate-api         |     disk: { no: null, of: null },
// resonate-api         |     movementIndex: {},
// resonate-api         |     compilation: false,
// resonate-api         |     gapless: true
// resonate-api         |   },
// resonate-api         |   filename_orig: 'whiteNoise5s1.m4a'
// resonate-api         | }

const { request, expect, testArtistUserId, testAccessToken } = require('../../testConfig')
const MockAccessToken = require('../../MockAccessToken')

// after processing, audio is served from /var/www/api/data/media/audio/, not .../incoming
// below is the location of the source files. they are 'bundled' into the container in the test folder
//    and need to be moved to /var/www/api/data/media/audio/, then renamed to use the uuid's in the
//      File model / table / seeder thing
const audioSourceFilePath = '/var/www/api/test/media/audio/'

let response = null
let trackId = null
let fileName = null

describe.skip('baseline / file upload endpoint tests', () => {
  MockAccessToken(testArtistUserId)

  it('should reject a PUT request without access token', async () => {
    response = await request.put('/user/tracks/:id/file')

    expect(response.status).to.eql(401)
  })
  it('should reject a PUT request with with a valid access token, but no track id ', async () => {
    response = await request.put('/user/tracks/:id/file')
      .set('Authorization', `Bearer ${testAccessToken}`)

    expect(response.status).to.eql(500)
  })
  it('should reject a PUT request with with a valid access token, but invalid track id ', async () => {
    response = await request.put('/user/tracks/1234-asdf/file')
      .set('Authorization', `Bearer ${testAccessToken}`)

    expect(response.status).to.eql(500)
  })
})

describe.skip('ALBUM: Best Album Ever', () => {
  MockAccessToken(testArtistUserId)

  // Ergonomic interactive concept,  Laurie Yost
  it('should process audio file / track 01', async () => {
    trackId = '44a28752-1101-4e0d-8c40-2c36dc82d035'
    fileName = 'whiteNoise5s1.m4a'

    response = await request.put(`/user/tracks/${trackId}/file`)
      .set('Authorization', `Bearer ${testAccessToken}`)
      .attach('files', `${audioSourceFilePath}${fileName}`)

    expect(response.status).to.eql(200)
  })

  // Customer-focused fresh-thinking groupware Miss Lewis Ondricka
  it('should process audio file / track 02', async () => {
    trackId = '706cff12-ba44-49f7-8982-98b3996a2919'
    fileName = 'whiteNoise5s2.m4a'

    response = await request.put(`/user/tracks/${trackId}/file`)
      .set('Authorization', `Bearer ${testAccessToken}`)
      .attach('files', `${audioSourceFilePath}${fileName}`)

    expect(response.status).to.eql(200)
  })

  // Configurable bandwidth-monitored definition Roberto Romaguera
  it('should process audio file / track 03', async () => {
    trackId = '56ea16b1-f732-4e46-a9a2-4a6bb3e64ecc'
    fileName = 'whiteNoise5s3.m4a'

    response = await request.put(`/user/tracks/${trackId}/file`)
      .set('Authorization', `Bearer ${testAccessToken}`)
      .attach('files', `${audioSourceFilePath}${fileName}`)

    expect(response.status).to.eql(200)
  })

  // Managed tangible instruction set Glenn Schmeler
  it('should process audio file / track 04', async () => {
    trackId = '39565f69-cb1c-4e96-89d4-dc02b8fa6b16'
    fileName = 'whiteNoise5s4.m4a'

    response = await request.put(`/user/tracks/${trackId}/file`)
      .set('Authorization', `Bearer ${testAccessToken}`)
      .attach('files', `${audioSourceFilePath}${fileName}`)

    expect(response.status).to.eql(200)
  })

  // Exclusive directional complexity Dr. Elvira Sauer
  it('should process audio file / track 05', async () => {
    trackId = '0ba2f958-ab3a-4807-8247-567995d3ff47'
    fileName = 'whiteNoise5s5.m4a'

    response = await request.put(`/user/tracks/${trackId}/file`)
      .set('Authorization', `Bearer ${testAccessToken}`)
      .attach('files', `${audioSourceFilePath}${fileName}`)

    expect(response.status).to.eql(200)
  })

  // Down-sized regional alliance Edgar Erdman
  it('should process audio file / track 06', async () => {
    trackId = '556c6f38-9cfa-4b83-b379-1f663f8901e4'
    fileName = 'whiteNoise5s6.m4a'

    response = await request.put(`/user/tracks/${trackId}/file`)
      .set('Authorization', `Bearer ${testAccessToken}`)
      .attach('files', `${audioSourceFilePath}${fileName}`)

    expect(response.status).to.eql(200)
  })

  // Ameliorated systemic infrastructure Nora Kiehn
  it('should process audio file / track 07', async () => {
    trackId = '0bd6bdcb-ee99-4c30-b637-668c4ac0fee2'
    fileName = 'whiteNoise50s1.m4a'

    response = await request.put(`/user/tracks/${trackId}/file`)
      .set('Authorization', `Bearer ${testAccessToken}`)
      .attach('files', `${audioSourceFilePath}${fileName}`)

    expect(response.status).to.eql(200)
  })

  // Vision-oriented didactic circuit Phyllis Luettgen
  it('should process audio file / track 08', async () => {
    trackId = 'aa67b1ed-3d86-419e-9d51-0a3cb91f4218'
    fileName = 'whiteNoise50s2.m4a'

    response = await request.put(`/user/tracks/${trackId}/file`)
      .set('Authorization', `Bearer ${testAccessToken}`)
      .attach('files', `${audioSourceFilePath}${fileName}`)

    expect(response.status).to.eql(200)
  })

  // Seamless impactful ability Rafael Runolfsson
  it('should process audio file / track 09', async () => {
    trackId = '0a103865-0c47-4c60-af3d-6d5c62203531'
    fileName = 'whiteNoise50s3.m4a'

    response = await request.put(`/user/tracks/${trackId}/file`)
      .set('Authorization', `Bearer ${testAccessToken}`)
      .attach('files', `${audioSourceFilePath}${fileName}`)

    expect(response.status).to.eql(200)
  })

  // Devolved explicit installation Chester Harber
  it('should process audio file / track 10', async () => {
    trackId = 'e5387217-6ab7-48be-909a-2925609a1024'
    fileName = 'whiteNoise50s4.m4a'

    response = await request.put(`/user/tracks/${trackId}/file`)
      .set('Authorization', `Bearer ${testAccessToken}`)
      .attach('files', `${audioSourceFilePath}${fileName}`)

    expect(response.status).to.eql(200)
  })
})

describe.skip('ALBUM: Best Album Ever 2', () => {
  MockAccessToken(testArtistUserId)

  // Phased fresh-thinking service-desk Johnnie Gorczany
  it('should process audio file / track 01', async () => {
    trackId = '2d1f5012-dff5-401d-8503-628439ca8ef2'
    fileName = 'whiteNoise50s5.m4a'

    response = await request.put(`/user/tracks/${trackId}/file`)
      .set('Authorization', `Bearer ${testAccessToken}`)
      .attach('files', `${audioSourceFilePath}${fileName}`)

    expect(response.status).to.eql(200)
  })

  // Exclusive methodical success Doreen Cronin
  it('should process audio file / track 02', async () => {
    trackId = '7c5864c6-634d-476d-a8b0-ca7ed5900345'
    fileName = 'whiteNoise50s6.m4a'

    response = await request.put(`/user/tracks/${trackId}/file`)
      .set('Authorization', `Bearer ${testAccessToken}`)
      .attach('files', `${audioSourceFilePath}${fileName}`)

    expect(response.status).to.eql(200)
  })

  // Synchronised composite emulation Clinton Reynolds
  it('should process audio file / track 03', async () => {
    trackId = '92e91e90-e1cd-4bc7-b470-67421bc2f147'
    fileName = 'whiteNoise5s1.m4a'

    response = await request.put(`/user/tracks/${trackId}/file`)
      .set('Authorization', `Bearer ${testAccessToken}`)
      .attach('files', `${audioSourceFilePath}${fileName}`)

    expect(response.status).to.eql(200)
  })

  // Up-sized stable array Allison Hirthe V
  it('should process audio file / track 04', async () => {
    trackId = '1e14bc37-c5a8-4667-bc78-01a633a23520'
    fileName = 'whiteNoise5s2.m4a'

    response = await request.put(`/user/tracks/${trackId}/file`)
      .set('Authorization', `Bearer ${testAccessToken}`)
      .attach('files', `${audioSourceFilePath}${fileName}`)

    expect(response.status).to.eql(200)
  })

  // Polarised motivating internet solution Janet Koelpin
  it('should process audio file / track 05', async () => {
    trackId = '51cfa034-9e56-4564-9ed7-e3b4bceda731'
    fileName = 'whiteNoise5s3.m4a'

    response = await request.put(`/user/tracks/${trackId}/file`)
      .set('Authorization', `Bearer ${testAccessToken}`)
      .attach('files', `${audioSourceFilePath}${fileName}`)

    expect(response.status).to.eql(200)
  })

  // Integrated radical encoding Dustin White
  it('should process audio file / track 06', async () => {
    trackId = 'c62d1c4c-0c5a-4b6a-91c4-217cff092082'
    fileName = 'whiteNoise5s4.m4a'

    response = await request.put(`/user/tracks/${trackId}/file`)
      .set('Authorization', `Bearer ${testAccessToken}`)
      .attach('files', `${audioSourceFilePath}${fileName}`)

    expect(response.status).to.eql(200)
  })

  // Face to face transitional project Charlie Blick
  it('should process audio file / track 07', async () => {
    trackId = '78f6da45-91e4-40c9-8447-b99581528139'
    fileName = 'whiteNoise5s5.m4a'

    response = await request.put(`/user/tracks/${trackId}/file`)
      .set('Authorization', `Bearer ${testAccessToken}`)
      .attach('files', `${audioSourceFilePath}${fileName}`)

    expect(response.status).to.eql(200)
  })

  // Synergized high-level collaboration Della Block
  it('should process audio file / track 08', async () => {
    trackId = '7effd259-f531-42f7-bd06-f1182673ecd6'
    fileName = 'whiteNoise5s6.m4a'

    response = await request.put(`/user/tracks/${trackId}/file`)
      .set('Authorization', `Bearer ${testAccessToken}`)
      .attach('files', `${audioSourceFilePath}${fileName}`)

    expect(response.status).to.eql(200)
  })

  // Face to face local pricing structure Brent Morissette
  it('should process audio file / track 09', async () => {
    trackId = 'c8bbe191-823c-430f-86d2-d8c2b2ee7a6c'
    fileName = 'whiteNoise50s1.m4a'

    response = await request.put(`/user/tracks/${trackId}/file`)
      .set('Authorization', `Bearer ${testAccessToken}`)
      .attach('files', `${audioSourceFilePath}${fileName}`)

    expect(response.status).to.eql(200)
  })

  // Reactive client-server model Roxanne Beahan
  it('should process audio file / track 10', async () => {
    trackId = 'ede3c192-4ebe-48a8-b9f0-320e2bd4da8b'
    fileName = 'whiteNoise50s2.m4a'

    response = await request.put(`/user/tracks/${trackId}/file`)
      .set('Authorization', `Bearer ${testAccessToken}`)
      .attach('files', `${audioSourceFilePath}${fileName}`)

    expect(response.status).to.eql(200)
  })
})

describe.skip('ALBUM: Best Album Ever 3', () => {
  MockAccessToken(testArtistUserId)

  // Future-proofed methodical conglomeration Calvin Larson
  it('should process audio file / track 01', async () => {
    trackId = 'e2a99f8e-0d81-4fe8-9a85-5b6ca115ab44'
    fileName = 'whiteNoise50s3.m4a'

    response = await request.put(`/user/tracks/${trackId}/file`)
      .set('Authorization', `Bearer ${testAccessToken}`)
      .attach('files', `${audioSourceFilePath}${fileName}`)

    expect(response.status).to.eql(200)
  })

  // Self-enabling reciprocal system engine Orville Toy
  it('should process audio file / track 02', async () => {
    trackId = '3dc37b61-31ef-4070-b9eb-73e869e8e0ab'
    fileName = 'whiteNoise50s4.m4a'

    response = await request.put(`/user/tracks/${trackId}/file`)
      .set('Authorization', `Bearer ${testAccessToken}`)
      .attach('files', `${audioSourceFilePath}${fileName}`)

    expect(response.status).to.eql(200)
  })

  // Virtual clear-thinking standardization Edith Harber
  it('should process audio file / track 03', async () => {
    trackId = 'fcf41302-e549-4ab9-9937-f0bfead5a44f'
    fileName = 'whiteNoise50s5.m4a'

    response = await request.put(`/user/tracks/${trackId}/file`)
      .set('Authorization', `Bearer ${testAccessToken}`)
      .attach('files', `${audioSourceFilePath}${fileName}`)

    expect(response.status).to.eql(200)
  })

  // Digitized demand-driven ability Maureen Welch
  it('should process audio file / track 04', async () => {
    trackId = '4f27cebc-1afb-4e2c-a7e7-a7e1002e1244'
    fileName = 'whiteNoise50s5.m4a'

    response = await request.put(`/user/tracks/${trackId}/file`)
      .set('Authorization', `Bearer ${testAccessToken}`)
      .attach('files', `${audioSourceFilePath}${fileName}`)

    expect(response.status).to.eql(200)
  })

  // Assimilated actuating hierarchy Alberto Kerluke
  it('should process audio file / track 05', async () => {
    trackId = 'ccb9b344-c26b-4efa-a595-beacdc7d163c'
    fileName = 'whiteNoise50s6.m4a'

    response = await request.put(`/user/tracks/${trackId}/file`)
      .set('Authorization', `Bearer ${testAccessToken}`)
      .attach('files', `${audioSourceFilePath}${fileName}`)

    expect(response.status).to.eql(200)
  })

  // Multi-tiered 3rd generation circuit Nicole Rogahn PhD
  it('should process audio file / track 06', async () => {
    trackId = '96b5e86a-76b0-40ee-94ab-5226da627b62'
    fileName = 'whiteNoise5s1.m4a'

    response = await request.put(`/user/tracks/${trackId}/file`)
      .set('Authorization', `Bearer ${testAccessToken}`)
      .attach('files', `${audioSourceFilePath}${fileName}`)

    expect(response.status).to.eql(200)
  })

  // Virtual 6th generation knowledge base Evelyn Jacobson
  it('should process audio file / track 07', async () => {
    trackId = '2684ca14-9864-4377-aab9-7a471b1f8d14'
    fileName = 'whiteNoise5s2.m4a'

    response = await request.put(`/user/tracks/${trackId}/file`)
      .set('Authorization', `Bearer ${testAccessToken}`)
      .attach('files', `${audioSourceFilePath}${fileName}`)

    expect(response.status).to.eql(200)
  })

  // Up-sized executive task-force Maryann Farrell
  it('should process audio file / track 08', async () => {
    trackId = '8221ddea-2cf7-457d-989f-a69df823ba09'
    fileName = 'whiteNoise5s3.m4a'

    response = await request.put(`/user/tracks/${trackId}/file`)
      .set('Authorization', `Bearer ${testAccessToken}`)
      .attach('files', `${audioSourceFilePath}${fileName}`)

    expect(response.status).to.eql(200)
  })

  // Secured 24 hour website Inez Collins MD
  it('should process audio file / track 09', async () => {
    trackId = '374d19fc-18af-474d-8c19-debc993db991'
    fileName = 'whiteNoise5s4.m4a'

    response = await request.put(`/user/tracks/${trackId}/file`)
      .set('Authorization', `Bearer ${testAccessToken}`)
      .attach('files', `${audioSourceFilePath}${fileName}`)

    expect(response.status).to.eql(200)
  })

  // Upgradable context-sensitive implementation Marjorie Beahan
  it('should process audio file / track 10', async () => {
    trackId = '6bb1b466-82a7-4e6b-a173-16c3a8829d3d'
    fileName = 'whiteNoise5s5.m4a'

    response = await request.put(`/user/tracks/${trackId}/file`)
      .set('Authorization', `Bearer ${testAccessToken}`)
      .attach('files', `${audioSourceFilePath}${fileName}`)

    expect(response.status).to.eql(200)
  })
})
