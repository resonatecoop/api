import Router from '@koa/router'
import { initialize } from 'koa-openapi'
import koaBody from 'koa-body'
import bytes from 'bytes'
import path from 'path'

import apiDoc from './api-doc.js'
import apiDocs from './apiDocs.js'

import streamLegacy from './stream/index.mjs'
import streamRoutes from './stream/audio.{id}.{segment}.mjs'
import artistReleases from './artists/routes/{id}/releases.js'
import artistTopTracks from './artists/routes/{id}/tracks/top.js'
import artistTracks from './artists/routes/{id}/tracks/index.js'
import artists from './artists/routes/index.js'
import artistsFeatured from './artists/routes/featured.js'
import artistsId from './artists/routes/{id}/index.js'
import artistsUpdated from './artists/routes/updated.mjs'
import labelArtists from './labels/routes/{id}/artists.js'
import labelReleases from './labels/routes/{id}/releases.js'
import labels from './labels/routes/index.js'
import labelsId from './labels/routes/{id}/index.js'
import playlists from './playlists/routes/index.js'
import playlistsId from './playlists/routes/{id}.js'
import resolve from './resolve/routes/index.js'
import search from './search/routes/index.js'
import tagRoutesTag from './tag/routes/{tag}.js'
import trackService from './tracks/services/trackService.js'
import trackgroups from './trackgroups/routes/index.js'
import trackgroupsId from './trackgroups/routes/{id}.js'
import tracksId from './tracks/routes/{id}.js'
import tracksRoutes from './tracks/routes/index.js'
import userArtists from './user/artists/routes/index.js'
import userArtistsId from './user/artists/routes/{id}/index.js'
import userArtistsIdImage from './user/artists/routes/{id}/image.mjs'
import userCollection from './user/collection/routes/index.js'
import userFavorites from './user/favorites/routes/index.js'
import userFavoritesResolve from './user/favorites/routes/resolve.js'
import userPlaylist from './user/playlists/routes/{id}/index.js'
import userPlaylistAddItems from './user/playlists/routes/{id}/items/add.js'
import userPlaylistCover from './user/playlists/routes/{id}/cover.js'
import userPlaylistItems from './user/playlists/routes/{id}/items/index.js'
import userPlaylistPrivacy from './user/playlists/routes/{id}/privacy.js'
import userPlaylists from './user/playlists/routes/index.js'
import userPlaylistsRemoveItems from './user/playlists/routes/{id}/items/remove.js'
import userPlays from './user/plays/routes/index.mjs'
import userPlaysBuy from './user/plays/routes/buy.js'
import userPlaysHistory from './user/plays/routes/history/tracks.js'
import userPlaysHistoryArtists from './user/plays/routes/history/artists.mjs'
import userPlaysResolve from './user/plays/routes/resolve.js'
import userPlaysSpendings from './user/plays/routes/spendings.js'
import userPlaysStats from './user/plays/routes/stats.js'
import userProducts from './user/products/routes/index.js'
import userProductsCancel from './user/products/routes/cancel.js'
import userProductsCheckout from './user/products/routes/checkout.js'
import userProductsSuccess from './user/products/routes/success.js'
import webhooksStripeCheckoutSuccess from './webhooks/stripe_checkout_success.js'

import userProfile from './user/profile/routes/index.js'
import userStreamLegacy from './user/stream/routes/{id}.js'
import userStreamAudioSegment from './user/stream/routes/audio.{id}.{segment}.mjs'

import userEarnings from './user/earnings.js'
import userFiles from './user/files/index.mjs'
import userFilesId from './user/files/{id}.mjs'

import userTrack from './user/tracks/routes/{id}/index.js'
import userTrackFile from './user/tracks/routes/{id}/file.js'
import userTrackgroup from './user/trackgroups/routes/{id}/index.js'
import userTrackgroupAddItems from './user/trackgroups/routes/{id}/items/add.js'
import userTrackgroupCover from './user/trackgroups/routes/{id}/cover.js'
import userTrackgroupItems from './user/trackgroups/routes/{id}/items/index.js'
import userTrackgroupPrivacy from './user/trackgroups/routes/{id}/privacy.js'
import userTrackgroupRemoveItems from './user/trackgroups/routes/{id}/items/remove.js'
import userTrackgroups from './user/trackgroups/routes/index.js'
import userTracks from './user/tracks/routes/index.js'
import usersId from './users/routes/{id}/index.js'
import usersIdPlaylists from './users/routes/{id}/playlists.js'

import adminUsers from './user/admin/users/index.js'
import adminUsersId from './user/admin/users/{id}.js'

import adminTrackgroups from './user/admin/trackgroups/index.js'
import adminTrackgroupId from './user/admin/trackgroups/{id}/index.js'
import adminTrackgroupItems from './user/admin/trackgroups/{id}/items/index.js'
import adminTrackgroupItemsAdd from './user/admin/trackgroups/{id}/items/add.js'
import adminTrackgroupItemsRemove from './user/admin/trackgroups/{id}/items/remove.js'

import adminPlaylists from './user/admin/playlists/index.js'
import adminPlaylistId from './user/admin/playlists/{id}/index.js'
import adminPlaylistItems from './user/admin/playlists/{id}/items/index.js'
import adminPlaylistItemsAdd from './user/admin/playlists/{id}/items/add.js'
import adminPlaylistItemsRemove from './user/admin/playlists/{id}/items/remove.js'

import adminTracks from './user/admin/tracks/index.js'
import adminTracksId from './user/admin/tracks/{id}.js'
import adminEarnings from './user/admin/earnings.js'
import adminFiles from './user/admin/files/index.mjs'
import adminFilesId from './user/admin/files/{id}.mjs'
import adminPlays from './user/admin/plays.mjs'

import { apiRoot as root } from '../constants.js'

const BASE_DATA_DIR = process.env.BASE_DATA_DIR || '/'
export const apiRouter = new Router()
const openApiRouter = new Router()

// Initialize the API!
initialize({
  router: openApiRouter,
  basePath: root,
  apiDoc: apiDoc,
  paths: [
    { path: `${root}/stream/{id}`, module: streamLegacy },
    { path: `${root}/stream/{id}/{segment}`, module: streamRoutes },
    { path: `${root}/tracks`, module: tracksRoutes },
    { path: `${root}/tracks/{id}`, module: tracksId },

    { path: `${root}/tag/{tag}`, module: tagRoutesTag },

    { path: `${root}/artists/featured`, module: artistsFeatured },
    { path: `${root}/artists/updated`, module: artistsUpdated },
    { path: `${root}/artists`, module: artists },
    { path: `${root}/artists/{id}`, module: artistsId },
    { path: `${root}/artists/{id}/releases`, module: artistReleases },
    { path: `${root}/artists/{id}/tracks`, module: artistTracks },
    { path: `${root}/artists/{id}/tracks/top`, module: artistTopTracks },

    { path: `${root}/labels`, module: labels },
    { path: `${root}/labels/{id}`, module: labelsId },
    { path: `${root}/labels/{id}/releases`, module: labelReleases },
    { path: `${root}/labels/{id}/artists`, module: labelArtists },

    { path: `${root}/search`, module: search },

    // FIXME: Not entirely clear on what the point of this route is
    { path: `${root}/resolve`, module: resolve },

    { path: `${root}/trackgroups`, module: trackgroups },
    { path: `${root}/trackgroups/{id}`, module: trackgroupsId },

    { path: `${root}/playlists`, module: playlists },
    { path: `${root}/playlists/{id}`, module: playlistsId },

    { path: `${root}/users/{id}`, module: usersId },
    { path: `${root}/users/{id}/playlists`, module: usersIdPlaylists },

    { path: `${root}/user/profile`, module: userProfile },
    { path: `${root}/user/artists`, module: userArtists },
    { path: `${root}/user/artists/{id}`, module: userArtistsId },
    { path: `${root}/user/artists/{id}/{imageType}`, module: userArtistsIdImage },

    { path: `${root}/user/collection`, module: userCollection },

    { path: `${root}/user/favorites/resolve`, module: userFavoritesResolve },
    { path: `${root}/user/favorites`, module: userFavorites },

    { path: `${root}/user/plays`, module: userPlays },
    { path: `${root}/user/plays/resolve`, module: userPlaysResolve },
    { path: `${root}/user/plays/spendings`, module: userPlaysSpendings },
    { path: `${root}/user/plays/buy`, module: userPlaysBuy },
    { path: `${root}/user/plays/stats`, module: userPlaysStats },
    { path: `${root}/user/plays/history`, module: userPlaysHistory },
    { path: `${root}/user/plays/history/artists`, module: userPlaysHistoryArtists },

    { path: `${root}/user/playlists`, module: userPlaylists },
    { path: `${root}/user/playlists/{id}`, module: userPlaylist },
    { path: `${root}/user/playlists/{id}/cover`, module: userPlaylistCover },
    { path: `${root}/user/playlists/{id}/privacy`, module: userPlaylistPrivacy },
    { path: `${root}/user/playlists/{id}/items`, module: userPlaylistItems },
    { path: `${root}/user/playlists/{id}/items/add`, module: userPlaylistAddItems },
    { path: `${root}/user/playlists/{id}/items/remove`, module: userPlaylistsRemoveItems },

    { path: `${root}/user/products`, module: userProducts },
    { path: `${root}/user/products/success`, module: userProductsSuccess },
    { path: `${root}/user/products/cancel`, module: userProductsCancel },
    { path: `${root}/user/products/checkout`, module: userProductsCheckout },

    { path: `${root}/user/earnings`, module: userEarnings },
    { path: `${root}/user/stream/{id}/{segment}`, module: userStreamAudioSegment },
    { path: `${root}/user/stream/{id}`, module: userStreamLegacy },
    { path: `${root}/user/files`, module: userFiles },
    { path: `${root}/user/files/{id}`, module: userFilesId },

    { path: `${root}/user/trackgroups`, module: userTrackgroups },
    { path: `${root}/user/trackgroups/{id}`, module: userTrackgroup },
    { path: `${root}/user/trackgroups/{id}/cover`, module: userTrackgroupCover },
    { path: `${root}/user/trackgroups/{id}/privacy`, module: userTrackgroupPrivacy },
    { path: `${root}/user/trackgroups/{id}/items`, module: userTrackgroupItems },
    { path: `${root}/user/trackgroups/{id}/items/add`, module: userTrackgroupAddItems },
    { path: `${root}/user/trackgroups/{id}/items/remove`, module: userTrackgroupRemoveItems },

    { path: `${root}/user/tracks`, module: userTracks },
    { path: `${root}/user/tracks/{id}`, module: userTrack },
    { path: `${root}/user/tracks/{id}/file`, module: userTrackFile },

    { path: `${root}/user/admin/users`, module: adminUsers },
    { path: `${root}/user/admin/users/{id}`, module: adminUsersId },

    { path: `${root}/user/admin/trackgroups`, module: adminTrackgroups },
    { path: `${root}/user/admin/trackgroups/{id}`, module: adminTrackgroupId },
    { path: `${root}/user/admin/trackgroups/{id}/items`, module: adminTrackgroupItems },
    { path: `${root}/user/admin/trackgroups/{id}/items/add`, module: adminTrackgroupItemsAdd },
    { path: `${root}/user/admin/trackgroups/{id}/items/remove`, module: adminTrackgroupItemsRemove },

    { path: `${root}/user/admin/playlists`, module: adminPlaylists },
    { path: `${root}/user/admin/playlists/{id}`, module: adminPlaylistId },
    { path: `${root}/user/admin/playlists/{id}/items`, module: adminPlaylistItems },
    { path: `${root}/user/admin/playlists/{id}/items/add`, module: adminPlaylistItemsAdd },
    { path: `${root}/user/admin/playlists/{id}/items/remove`, module: adminPlaylistItemsRemove },

    { path: `${root}/user/admin/tracks`, module: adminTracks },
    { path: `${root}/user/admin/tracks/{id}`, module: adminTracksId },

    { path: `${root}/user/admin/earnings`, module: adminEarnings },
    { path: `${root}/user/admin/files`, module: adminFiles },
    { path: `${root}/user/admin/files/{id}`, module: adminFilesId },
    { path: `${root}/user/admin/plays`, module: adminPlays },

    { path: '/webhooks/stripe/checkout_success', module: webhooksStripeCheckoutSuccess },

    {
      path: `${root}/apiDocs`, module: apiDocs
    }],
  dependencies: {
    trackService: trackService // how does this work?
  }
})

apiRouter.use(koaBody({
  multipart: true,
  includeUnparsed: true,
  formidable: {
    uploadDir: path.join(BASE_DATA_DIR, '/data/media/incoming/'),
    maxFileSize: bytes('2 GB')
  },
  onError: (err, ctx) => {
    console.error(err)
    if (/maxFileSize/.test(err.message)) {
      ctx.status = 400
      ctx.throw(400, err.message)
    }
  }
}))

apiRouter.use('', openApiRouter.routes(), openApiRouter.allowedMethods({ throw: true }))
