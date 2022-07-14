/**
 * Track.status
 */

module.exports.TRACK_STATUS_LIST = [
  'free+paid',
  'hidden',
  'free',
  'paid',
  'deleted'
]

/**
 * File.status
 */

module.exports.FILE_STATUS_LIST = [
  'processing',
  'errored',
  'ok'
]

module.exports.TRACKGROUP_TYPES = [
  'lp', // long player
  'ep', // extended play
  'single',
  'playlist',
  'compilation',
  'collection'
]

/**
 * Roles
 */

const ADMIN_ROLE = 'admin'
const SUPER_ADMIN_ROLE = 'superadmin'
const ARTIST_ROLE = 'artist'
const LABEL_ROLE = 'label'

module.exports.ROLES_LIST = [
  ADMIN_ROLE,
  SUPER_ADMIN_ROLE,
  ARTIST_ROLE,
  LABEL_ROLE
]

module.exports.CREATORS_ROLES_LIST = [
  ARTIST_ROLE,
  LABEL_ROLE
]

module.exports.STAFF_ROLES_LIST = [
  ADMIN_ROLE,
  SUPER_ADMIN_ROLE
]

// module.exports = {
//   ADMIN_ROLE,
//   ARTIST_ROLE,
//   LABEL_ROLE,
//   ROLES_LIST: module.exports.RO,
//   CREATORS_ROLES_LIST,
//   STAFF_ROLES_LIST,
//   FILE_STATUS_LIST,
//   TRACKGROUP_TYPES,
//   TRACK_STATUS_LIST
// }
