## List of baseline endpoints

Here is a list of the endpoints for the baseline tests.

Endpoints in [Admin.ts](https://github.com/resonatecoop/beam/blob/main/src/services/api/Admin.ts)

* users
  * GET /user/admin/users/
  * GET /user/admin/users/${id}
* trackgroups
  * GET /user/admin/trackgroups/
  * GET /user/admin/trackgroups/${id}
  * PUT /user/admin/trackgroups/${id}
* tracks
  * GET /user/admin/tracks/
  * GET /user/admin/tracks/${id}
  * PUT /user/admin/tracks/${id}

Endpoints in [Api.ts](https://github.com/resonatecoop/beam/blob/main/src/services/Api.ts)
* trackgroups
  * GET /trackgroups
  * GET /trackgroups/${id}
* tag
  * GET /tag/${tag}
* labels
  * GET /labels
  * GET /labels/${labelId}
  * GET /labels/${labelId}/releases
  * GET /labels/${labelId}/artists
  * GET /labels/${labelId}/albums
* artists
  * GET /artists
  * GET /artists/${artistId}
  * GET /artists/${artistId}/releases
  * GET /artists/${artistId}/tracks/top
* track
  * GET /tracks/${options.order !== "random" ? "latest" : ""}
  * GET /tracks/${trackId}
* search
  * GET /search/
  * searchString: string
    * // NOTE: API is looking for actual "+" (%2B) values instead of whitespace (%20)
    * { q: searchString.replace(/ /g, "+") } <- q is query string?

Endpoints in [User.ts](https://github.com/resonatecoop/beam/blob/main/src/services/api/User.ts)

* user
  * GET /user/profile/
  * GET /users/${id}/playlists
  * POST /user/trackgroups
  * PUT /user/trackgroups/${id}
  * GET /user/trackgroups
  * GET /user/trackgroups/${id}
  * POST /user/trackgroups/${id}/items/add
  * PUT /user/trackgroups/${id}/items/remove  <- PUT to remove?
  * PUT /user/trackgroups/${id}/items         <- ?
  * DELETE /user/trackgroups/${id}
* user artist endpoints
  * GET /user/artists
  * GET /user/artists/${artistId}
  * POST /user/artists
* user tracks
  * POST /user/tracks
  * PUT /{baseUrl}user/tracks/${id}/file        <- this is for upload
  * PUT ${baseUrl}user/trackgroups/${id}/cover <- this is for upload
* misc user info
  * GET /user/plays/stats?from=${from}&to=${to}
  * GET /user/plays/history/artists
  * GET /user/collection/
  * GET /user/plays/history/
  * GET /user/favorites
  * POST /user/favorites
  * POST /user/favorites/resolve
* user plays
  * POST /user/plays
  * POST /user/plays/buy
  * POST /user/plays/resolve
* products
  * GET /user/products