// THIS HAS TO RUN AFTER THE TRACKGROUP SEEDER FILE
//    it updates tracks table, so tracks table needs records
//      tracks table is seeded in trackgroups seeder

// SOMETIMES THIS FAILS ON THE FIRST RUN. DON'T KNOW WHY.
//    running the seeders a second time works. no idea why.
//    first run returns ECONNREFUSED error, so it's likely
//      somewhere on the database side
//    https://github.com/sequelize/sequelize/issues/3620

// == 05-files-seeder: migrating =======
// Error in 05-files-seeder:  Error: ECONNREFUSED: Connection refused
//     at Test.assert (/var/www/api/node_modules/supertest/lib/test.js:165:15)
//     at localAssert (/var/www/api/node_modules/supertest/lib/test.js:131:12)
//     at /var/www/api/node_modules/supertest/lib/test.js:128:5
//     at Test.Request.callback (/var/www/api/node_modules/supertest/node_modules/superagent/lib/node/index.js:728:3)
//     at ClientRequest.<anonymous> (/var/www/api/node_modules/supertest/node_modules/superagent/lib/node/index.js:647:10)
//     at Object.onceWrapper (node:events:628:26)
//     at ClientRequest.emit (node:events:525:35)
//     at Socket.socketErrorListener (node:_http_client:494:9)
//     at Socket.emit (node:events:513:28)
//     at emitErrorNT (node:internal/streams/destroy:157:8)
//     at emitErrorCloseNT (node:internal/streams/destroy:122:3)
//     at processTicksAndRejections (node:internal/process/task_queues:83:21)
// == 05-files-seeder: migrated (2.294s)

// curl -X PUT {baseURL}{/user/tracks/${trackId}/file} -H `Authorization: Bearer ${testAccessToken}` -F 'files=@/`${audioSourceFilePath}${fileName}`

const { request, testArtistUserId, testAccessToken, TestRedisAdapter } = require('../../../../test/testConfig')

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Seeds the files table with test audio. 30 files total, 10 per album

    try {
      const audioSourceFilePath = '/var/www/api/test/media/audio/'
      let trackId = null
      let fileName = null

      //  borrow some code from test/MockAccessToken.js
      const adapter = new TestRedisAdapter('AccessToken')
      await adapter.upsert(testAccessToken, {
        accountId: testArtistUserId
      })

      // ******************
      // START FILE UPLOADS
      // ******************

      // BEST ALBUM EVER
      // Ergonomic interactive concept,  Laurie Yost
      trackId = '44a28752-1101-4e0d-8c40-2c36dc82d035'
      fileName = 'whiteNoise5s1.m4a'

      await request.put(`/user/tracks/${trackId}/file`)
        .set('Authorization', `Bearer ${testAccessToken}`)
        .attach('files', `${audioSourceFilePath}${fileName}`)

      // Customer-focused fresh-thinking groupware Miss Lewis Ondricka
      trackId = '706cff12-ba44-49f7-8982-98b3996a2919'
      fileName = 'whiteNoise5s2.m4a'

      await request.put(`/user/tracks/${trackId}/file`)
        .set('Authorization', `Bearer ${testAccessToken}`)
        .attach('files', `${audioSourceFilePath}${fileName}`)

      // Configurable bandwidth-monitored definition Roberto Romaguera
      trackId = '56ea16b1-f732-4e46-a9a2-4a6bb3e64ecc'
      fileName = 'whiteNoise5s3.m4a'

      await request.put(`/user/tracks/${trackId}/file`)
        .set('Authorization', `Bearer ${testAccessToken}`)
        .attach('files', `${audioSourceFilePath}${fileName}`)

      // Managed tangible instruction set Glenn Schmeler
      trackId = '39565f69-cb1c-4e96-89d4-dc02b8fa6b16'
      fileName = 'whiteNoise5s4.m4a'

      await request.put(`/user/tracks/${trackId}/file`)
        .set('Authorization', `Bearer ${testAccessToken}`)
        .attach('files', `${audioSourceFilePath}${fileName}`)

      // Exclusive directional complexity Dr. Elvira Sauer
      trackId = '0ba2f958-ab3a-4807-8247-567995d3ff47'
      fileName = 'whiteNoise5s5.m4a'

      await request.put(`/user/tracks/${trackId}/file`)
        .set('Authorization', `Bearer ${testAccessToken}`)
        .attach('files', `${audioSourceFilePath}${fileName}`)

      // Down-sized regional alliance Edgar Erdman
      trackId = '556c6f38-9cfa-4b83-b379-1f663f8901e4'
      fileName = 'whiteNoise5s6.m4a'

      await request.put(`/user/tracks/${trackId}/file`)
        .set('Authorization', `Bearer ${testAccessToken}`)
        .attach('files', `${audioSourceFilePath}${fileName}`)

      // Ameliorated systemic infrastructure Nora Kiehn
      trackId = '0bd6bdcb-ee99-4c30-b637-668c4ac0fee2'
      fileName = 'whiteNoise50s1.m4a'

      await request.put(`/user/tracks/${trackId}/file`)
        .set('Authorization', `Bearer ${testAccessToken}`)
        .attach('files', `${audioSourceFilePath}${fileName}`)

      // Vision-oriented didactic circuit Phyllis Luettgen
      trackId = 'aa67b1ed-3d86-419e-9d51-0a3cb91f4218'
      fileName = 'whiteNoise50s2.m4a'

      await request.put(`/user/tracks/${trackId}/file`)
        .set('Authorization', `Bearer ${testAccessToken}`)
        .attach('files', `${audioSourceFilePath}${fileName}`)

      // Seamless impactful ability Rafael Runolfsson
      trackId = '0a103865-0c47-4c60-af3d-6d5c62203531'
      fileName = 'whiteNoise50s3.m4a'

      await request.put(`/user/tracks/${trackId}/file`)
        .set('Authorization', `Bearer ${testAccessToken}`)
        .attach('files', `${audioSourceFilePath}${fileName}`)

      // Devolved explicit installation Chester Harber
      trackId = 'e5387217-6ab7-48be-909a-2925609a1024'
      fileName = 'whiteNoise50s4.m4a'

      await request.put(`/user/tracks/${trackId}/file`)
        .set('Authorization', `Bearer ${testAccessToken}`)
        .attach('files', `${audioSourceFilePath}${fileName}`)

      // BEST ALBUM EVER 2
      // Phased fresh-thinking service-desk Johnnie Gorczany
      trackId = '2d1f5012-dff5-401d-8503-628439ca8ef2'
      fileName = 'whiteNoise50s5.m4a'

      await request.put(`/user/tracks/${trackId}/file`)
        .set('Authorization', `Bearer ${testAccessToken}`)
        .attach('files', `${audioSourceFilePath}${fileName}`)

      // Exclusive methodical success Doreen Cronin
      trackId = '7c5864c6-634d-476d-a8b0-ca7ed5900345'
      fileName = 'whiteNoise50s6.m4a'

      await request.put(`/user/tracks/${trackId}/file`)
        .set('Authorization', `Bearer ${testAccessToken}`)
        .attach('files', `${audioSourceFilePath}${fileName}`)

      // Synchronised composite emulation Clinton Reynolds
      trackId = '92e91e90-e1cd-4bc7-b470-67421bc2f147'
      fileName = 'whiteNoise5s1.m4a'

      await request.put(`/user/tracks/${trackId}/file`)
        .set('Authorization', `Bearer ${testAccessToken}`)
        .attach('files', `${audioSourceFilePath}${fileName}`)

      // Up-sized stable array Allison Hirthe V
      trackId = '1e14bc37-c5a8-4667-bc78-01a633a23520'
      fileName = 'whiteNoise5s2.m4a'

      await request.put(`/user/tracks/${trackId}/file`)
        .set('Authorization', `Bearer ${testAccessToken}`)
        .attach('files', `${audioSourceFilePath}${fileName}`)

      // Polarised motivating internet solution Janet Koelpin
      trackId = '51cfa034-9e56-4564-9ed7-e3b4bceda731'
      fileName = 'whiteNoise5s3.m4a'

      await request.put(`/user/tracks/${trackId}/file`)
        .set('Authorization', `Bearer ${testAccessToken}`)
        .attach('files', `${audioSourceFilePath}${fileName}`)

      // Integrated radical encoding Dustin White
      trackId = 'c62d1c4c-0c5a-4b6a-91c4-217cff092082'
      fileName = 'whiteNoise5s4.m4a'

      await request.put(`/user/tracks/${trackId}/file`)
        .set('Authorization', `Bearer ${testAccessToken}`)
        .attach('files', `${audioSourceFilePath}${fileName}`)

      // Face to face transitional project Charlie Blick
      trackId = '78f6da45-91e4-40c9-8447-b99581528139'
      fileName = 'whiteNoise5s5.m4a'

      await request.put(`/user/tracks/${trackId}/file`)
        .set('Authorization', `Bearer ${testAccessToken}`)
        .attach('files', `${audioSourceFilePath}${fileName}`)

      // Synergized high-level collaboration Della Block
      trackId = '7effd259-f531-42f7-bd06-f1182673ecd6'
      fileName = 'whiteNoise5s6.m4a'

      await request.put(`/user/tracks/${trackId}/file`)
        .set('Authorization', `Bearer ${testAccessToken}`)
        .attach('files', `${audioSourceFilePath}${fileName}`)

      // Face to face local pricing structure Brent Morissette
      trackId = 'c8bbe191-823c-430f-86d2-d8c2b2ee7a6c'
      fileName = 'whiteNoise50s1.m4a'

      await request.put(`/user/tracks/${trackId}/file`)
        .set('Authorization', `Bearer ${testAccessToken}`)
        .attach('files', `${audioSourceFilePath}${fileName}`)

      // Reactive client-server model Roxanne Beahan
      trackId = 'ede3c192-4ebe-48a8-b9f0-320e2bd4da8b'
      fileName = 'whiteNoise50s2.m4a'

      await request.put(`/user/tracks/${trackId}/file`)
        .set('Authorization', `Bearer ${testAccessToken}`)
        .attach('files', `${audioSourceFilePath}${fileName}`)

      // BEST ALBUM EVER 3
      // Future-proofed methodical conglomeration Calvin Larson
      trackId = 'e2a99f8e-0d81-4fe8-9a85-5b6ca115ab44'
      fileName = 'whiteNoise50s3.m4a'

      await request.put(`/user/tracks/${trackId}/file`)
        .set('Authorization', `Bearer ${testAccessToken}`)
        .attach('files', `${audioSourceFilePath}${fileName}`)

      // Self-enabling reciprocal system engine Orville Toy
      trackId = '3dc37b61-31ef-4070-b9eb-73e869e8e0ab'
      fileName = 'whiteNoise50s4.m4a'

      await request.put(`/user/tracks/${trackId}/file`)
        .set('Authorization', `Bearer ${testAccessToken}`)
        .attach('files', `${audioSourceFilePath}${fileName}`)

      // Virtual clear-thinking standardization Edith Harber
      trackId = 'fcf41302-e549-4ab9-9937-f0bfead5a44f'
      fileName = 'whiteNoise50s5.m4a'

      await request.put(`/user/tracks/${trackId}/file`)
        .set('Authorization', `Bearer ${testAccessToken}`)
        .attach('files', `${audioSourceFilePath}${fileName}`)

      // Digitized demand-driven ability Maureen Welch
      trackId = '4f27cebc-1afb-4e2c-a7e7-a7e1002e1244'
      fileName = 'whiteNoise50s5.m4a'

      await request.put(`/user/tracks/${trackId}/file`)
        .set('Authorization', `Bearer ${testAccessToken}`)
        .attach('files', `${audioSourceFilePath}${fileName}`)

      // Assimilated actuating hierarchy Alberto Kerluke
      trackId = 'ccb9b344-c26b-4efa-a595-beacdc7d163c'
      fileName = 'whiteNoise50s6.m4a'

      await request.put(`/user/tracks/${trackId}/file`)
        .set('Authorization', `Bearer ${testAccessToken}`)
        .attach('files', `${audioSourceFilePath}${fileName}`)

      // Multi-tiered 3rd generation circuit Nicole Rogahn PhD
      trackId = '96b5e86a-76b0-40ee-94ab-5226da627b62'
      fileName = 'whiteNoise5s1.m4a'

      await request.put(`/user/tracks/${trackId}/file`)
        .set('Authorization', `Bearer ${testAccessToken}`)
        .attach('files', `${audioSourceFilePath}${fileName}`)

      // Virtual 6th generation knowledge base Evelyn Jacobson
      trackId = '2684ca14-9864-4377-aab9-7a471b1f8d14'
      fileName = 'whiteNoise5s2.m4a'

      await request.put(`/user/tracks/${trackId}/file`)
        .set('Authorization', `Bearer ${testAccessToken}`)
        .attach('files', `${audioSourceFilePath}${fileName}`)

      // Up-sized executive task-force Maryann Farrell
      trackId = '8221ddea-2cf7-457d-989f-a69df823ba09'
      fileName = 'whiteNoise5s3.m4a'

      await request.put(`/user/tracks/${trackId}/file`)
        .set('Authorization', `Bearer ${testAccessToken}`)
        .attach('files', `${audioSourceFilePath}${fileName}`)

      // Secured 24 hour website Inez Collins MD
      trackId = '374d19fc-18af-474d-8c19-debc993db991'
      fileName = 'whiteNoise5s4.m4a'

      await request.put(`/user/tracks/${trackId}/file`)
        .set('Authorization', `Bearer ${testAccessToken}`)
        .attach('files', `${audioSourceFilePath}${fileName}`)

      // Upgradable context-sensitive implementation Marjorie Beahan
      trackId = '6bb1b466-82a7-4e6b-a173-16c3a8829d3d'
      fileName = 'whiteNoise5s5.m4a'

      await request.put(`/user/tracks/${trackId}/file`)
        .set('Authorization', `Bearer ${testAccessToken}`)
        .attach('files', `${audioSourceFilePath}${fileName}`)

      // ****************
      // END FILE UPLOADS
      // ****************
      await adapter.destroy(testAccessToken)
    } catch (e) {
      console.log('Error in 05-files-seeder: ', e)
    }
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('files', null, {})
  }
}
