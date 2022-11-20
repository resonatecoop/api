const AJV = require('ajv')
const ajvKeywords = require('ajv-keywords')
const ajvFormats = require('ajv-formats')

const Query = {
  type: 'object',
  additionalProperties: false,
  properties: {
    q: {
      type: 'string',
      minLength: 3
    },
    url: {
      type: 'string'
    },
    limit: {
      type: 'number',
      maximum: 100,
      minimum: 1
    },
    page: {
      type: 'number',
      minimum: 1
    },
    type: {
      type: 'string',
      enum: ['ep', 'lp', 'single', 'playlist']
    },
    includes: {
      type: 'number' // track id in trackgroup
    },
    featured: {
      type: 'boolean'
    }
  }
}

const Params = {
  type: 'object',
  additionalProperties: false,
  properties: {
    id: {
      type: 'string',
      format: 'uuid'
    }
  }
}

const TrackGroup = {
  type: 'object',
  additionalProperties: false,
  required: ['title'],
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
    releaseDate: {
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
        required: ['trackId'],
        properties: {
          trackId: {
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
module.exports.validateParams = ajv.compile(Params)
module.exports.validateQuery = new AJV(Object.assign({}, ajvConfig, { coerceTypes: true })).compile(Query)

module.exports = {
  TrackGroup,
  TrackGroupItems,
  Query,
  Params
}
