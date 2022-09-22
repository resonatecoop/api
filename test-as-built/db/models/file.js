const test = require('tape')
const path = require('path')

require('dotenv-safe').config({ path: path.join(__dirname, '../../../.env.test.js') })

const { File } = require('../../../lib/db/models.js')

let id

test('should create a file', async t => {
  t.plan(2)

  try {
    const file = await File.create({
      owner_id: 2124,
      description: 'test file',
      mime: 'image/jpeg',
      size: 1000,
      metadata: {
        dimensions: {
          width: 1500,
          height: 1500
        }
      }
    })

    id = file.id

    t.equal(file.status, 'processing', 'File status should be equal to `processing`')

    t.pass('ok')
  } catch (err) {
    t.end(err)
  }
})

test('should update file status', async t => {
  t.plan(2)

  try {
    let file = await File.findOne({
      where: {
        id
      }
    })

    file.status = 'ok'

    await file.save()

    file = await File.findOne({
      where: {
        id
      }
    })

    t.equal(file.status, 'ok', 'File status should be equal to `ok`')

    t.pass('ok')
  } catch (err) {
    t.end(err)
  }
})

test('should update metadata', async t => {
  t.plan(1)

  try {
    let file = await File.findOne({
      where: {
        id
      },
      plain: true
    })

    await file.update({
      metadata: Object.assign(file.metadata, {
        dimensions: {
          width: 1000,
          height: 1000
        }
      })
    })

    file = await File.findOne({
      where: {
        id
      }
    })

    t.equal(file.metadata.dimensions.width, 1000, 'width should be equal to `1000`')
  } catch (err) {
    t.end(err)
  }
})

test('should remove file', async t => {
  t.plan(1)

  try {
    await File.destroy({
      where: {
        id
      }
    })

    t.pass()
  } catch (err) {
    t.end(err)
  }
})
