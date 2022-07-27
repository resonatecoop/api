const AJV = require('ajv')
const ajvKeywords = require('ajv-keywords')
const ajvFormats = require('ajv-formats')

const TrackGroup = {
  type: 'object',
  additionalProperties: false,
  required: ['title', 'type', 'release_date'],
  properties: {
    title: {
      type: 'string',
      allOf: [
        {
          transform: [
            'trim'
          ]
        },
        {
          minLength: 1
        }
      ]
    },
    display_artist: {
      type: 'string'
    },
    release_date: {
      type: 'string',
      format: 'date'
    },
    private: {
      type: 'boolean'
    },
    type: {
      type: 'string',
      enum: ['lp', 'ep', 'single', 'playlist']
    },
    about: {
      type: 'string'
    },
    cover: {
      type: 'string',
      format: 'uuid'
    },
    composers: {
      type: 'array',
      items: {
        type: 'string'
      }
    },
    performers: {
      type: 'array',
      items: {
        type: 'string'
      }
    },
    tags: {
      type: 'array',
      items: {
        type: 'string'
      }
    }
  }
}

const TrackGroupItems = {
  type: 'object',
  additionalProperties: false,
  required: ['tracks'],
  properties: {
    tracks: {
      type: 'array',
      items: {
        type: 'object',
        required: ['track_id'],
        properties: {
          track_id: {
            type: 'number',
            minimum: 1
          },
          title: {
            type: 'string'
          },
          index: {
            type: 'number',
            minimum: 1
          }
        }
      }
    }
  }
}

const ajvConfig = {
  allErrors: true,
  removeAdditional: true
}

const ajv = new AJV(ajvConfig)

ajvKeywords(ajv)
ajvFormats(ajv)

module.exports.validateTrackgroup = ajv.compile(TrackGroup)
module.exports.validateTrackgroupItems = ajv.compile(TrackGroupItems)

module.exports = {
  TrackGroup,
  TrackGroupItems
}
