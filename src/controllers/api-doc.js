const Artist = {
  displayName: {
    type: 'string'
  },
  description: {
    type: 'string'
  },
  shortBio: {
    type: 'string'
  },
  email: {
    type: 'string'
  },
  addressId: {
    type: 'string'
  }
}

const TrackProperties = {
  creatorId: {
    type: 'string',
    format: 'uuid'
  }
}

const apiDoc = {
  swagger: '2.0',
  info: {
    title: 'Resonate API',
    version: '4.0.0'
  },
  definitions: {
    ProfileUpdate: {
      type: 'object',
      additionalProperties: false,
      properties: {
        displayName: {
          type: 'string'
        },
        newsletterNotification: {
          type: 'boolean'
        },
        country: {
          type: 'string'
        },
        email: {
          type: 'string',
          format: 'email'
        },
        password: {
          type: 'string'
        }
      }
    },
    Artist: {
      type: 'object',
      properties: {
        ...Artist,
        id: {
          type: 'string',
          format: 'uuid'
        },
        ownerId: {
          type: 'string',
          format: 'uuid'
        },
        typeId: {
          type: 'number'
        }
      }
    },
    ArtistCreate: {
      type: 'object',
      required: ['displayName'],
      properties: Artist
    },
    Error: {
      type: 'object',
      properties: {
        code: {
          type: 'string'
        },
        message: {
          type: 'string'
        }
      },
      required: ['code', 'message']
    },
    Trackgroup: {
      type: 'object',
      properties: {
        about: {
          type: 'string'
        },
        cover: {
          type: 'string',
          format: 'uuid'
        },
        type: {
          type: 'string',
          enum: ['lp', 'ep', 'single', 'compilation']
        }
      }
    },
    TrackCreate: {
      type: 'object',
      required: ['creatorId'],
      properties: TrackProperties
    },
    Playlist: {
      type: 'object',
      required: ['title'],
      properties: {
        title: {
          type: 'string'
        },
        about: {
          type: 'string'
        },
        cover: {
          type: 'string',
          format: 'uuid'
        },
        private: {
          type: 'boolean'
        }
      }
    },
    Track: {
      type: 'object',
      properties: {
        ...TrackProperties,
        id: {
          type: 'string',
          format: 'uuid'
        }
      }
    },
    ArrayOfTrackgroupItems: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid'
          },
          index: {
            type: 'number'
          },
          trackgroupId: {
            type: 'string',
            format: 'uuid'
          },
          trackId: {
            type: 'string',
            format: 'uuid'
          },
          track: {
            type: 'object'
          }
        }
      }
    }
  },
  responses: {
    BadRequest: {
      description: 'Bad request',
      schema: {
        $ref: '#/definitions/Error'
      }
    },
    NotFound: {
      description: 'No trackgroups were found.',
      schema: {
        $ref: '#/definitions/Error'
      }
    }
  },
  paths: {}
}

module.exports = apiDoc
