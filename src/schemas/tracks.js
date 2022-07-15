const AJV = require('ajv')
const ajvKeywords = require('ajv-keywords')
const ajvFormats = require('ajv-formats')

const ajv = new AJV({
  allErrors: true,
  removeAdditional: true
})

ajvKeywords(ajv)
ajvFormats(ajv)

const validate = ajv.compile({
  type: 'object',
  additionalProperties: false,
  properties: {
    title: {
      type: 'string'
    },
    artist: {
      type: 'string'
    },
    album_artist: {
      type: 'string'
    },
    album: {
      type: 'string'
    },
    composer: {
      type: 'string'
    },
    status: {
      type: 'string',
      enum: ['paid', 'free', 'hidden'],
      default: 'paid'
    },
    year: {
      type: 'number',
      minimum: 1900,
      maximum: new Date().getFullYear() + 1
    }
  }
})

module.exports.validate = validate
