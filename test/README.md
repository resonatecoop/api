
# Resonate API Testing

These are tests for the WIP Resonate API (v4) migration. This iteration of the tests development simply migrates tests as-built to a Mocha environment and begins development of new tests of the WIP api specification to-be. This stage of the testing effort deliberately keeps things simple. Later iterations will focus on more fancy stuff.

Some clarification is needed regarding the test target. There are two possible targets:
* http://localhost:4000/api/v3 (this repo: api(v4))
* https://stream.resonate.coop/api/v3/ (beam/api)

The purpose of these tests is to verify / validate the endpoints of this API, and to begin development of a more robust API test suite.

For the sake of total clarity, these tests live in the `/api/test` directory. The previous tests live in `/api/test/as-built` directory. The new tests live in `api/test/to-be` directory. In the `api/test/to-be` directory there are three subfolders (Admin.ts, Api.ts, and User.ts), each of which corresponds to a file in the `beam/src/services` folder.

These tests expect a running instance of the Docker container that you get when you `docker compose up` at the `api` repo root. Make sure first that this container instance is running / has finished loading / etc. before running the tests. 

You also need to seed the database.

The `Getting started with local dev` section of the main repo [README.md](../README.md) file explains what to do.

## Setup and running
There is a file name `Template.test.js` in the `test` folder. You can copy this file to start writing new tests more quicly.

There is a file named `testConfig.js` in the `test` folder. It has vars and modules that are used in test files. It's basically used as an include header at the head of each test file. If you create new tests, this file will help you go faster.

In `testConfig.js` there is a const `baseURL`. This is set to `http://localhost:4000/api/v3` so that you can run the tests against a local Dockerized resonate api (v4) container instance. If you need to run the tests against a different instance of the API, you can comment this const out and replace it with a url of your choosing, ie `const baseURL = 'http://awesome.sauce.com/api/v2'` or similar.

`https://stream.resonate.coop/api/v3/` is the 'beam/api' instance. This is another possible test target. Further clarification of the correct test target url is needed. You can change the baseURL const in `testConfig.js` to this URL if that is appropriate.

Run the old / as-built tests
```sh
npm run test:as-built
```

Run the new / to-be tests for endpoints in Api.ts file
```sh
npm run test:to-be:api
```

Run the new / to-be tests for endpoints in Admin.ts file
```sh
npm run test:to-be:admin
```

Run the new / to-be tests for endpoints in User.ts file
```sh
npm run test:to-be:user
```

You can create more test script commands in the api (v4) repo's `package.json` file, if you need something else.

## Notes

If you cloned the Resonate API repo in the past and then ran `yarn install`, you might have something called 'Tape' installed on your machine. 'Tape' is a test runner that was used in an earlier version of the API.

You might want to delete 'Tape' from your system. The decision is yours. Do so with the command
```sh
yarn remove tape
```

This testing suite uses Mocha, and Mocha will be installed as a dev dependency if / when you run `yarn` at the repo root.

This testing suite uses some assertions from Chai, and Chai will be installed as a dev dependency if / when you run `yarn` at the repo root.

## The Tests As-Built
This might be a bit confusing. These are the tests that existed in a previous version of api (v4). This listing references the original fiolder structure. These will likely not run.

They are included here for archival purposes, just in case they are needed for something.

The tests from these files are migrated to the `test/as-built` folder, so that they can be run using Mocha.

Here are the previous tests:

* /test-as-built folder level
  * users
  * trackgroups
  * roles
  * metadata
* /test-as-built/db / models level
  * file
  * track
* /test-as-built/fixtures level
  * profiles
* /test-as-built/media level
  * several audio files
* /test-as-built/user level
  * credit
  * payment
  * plays
  * trackgroups
  * tracks
  
The purpose / use of test-as-built/db/models/*.js is unclear. It looks like is isn't used. Need to confirm this.

The purpose / use of test-as-built/fixtures/profiles.js is unclear. It looks like it isn't used. Need to confirm this.

There are no tests for the test-as-built/media folder because this folder is only audio files.

These old / previous-version tests are migrated to `test/as-built`. These will run under Mocha, and will likely fail.

You can run the Mocha-migrated old / as-built tests.
```sh
npm run test:as-built
```

## The Tests To-Be
These are the new tests, for api (v4). They are currently based on endpoints revealed [in this document](https://github.com/resonatecoop/beam/tree/main/src/services).

Still not clear on how well the endpoints map to the underlying data.

For the first iteration of these tests, we capture the endpoints' output and return that output to the tests. This is a 'what does it do?' and not a 'what should it do?' approach. Later iterations of test development should focus on actual required functionality and valid test data.

### Api.ts tests

Run the new / to-be tests for endpoints in Api.ts file
```sh
npm run test:to-be:api
```

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
  * GET /tracks/${trackId}****
* search
  * GET /search/
  * searchString: string
  * // NOTE: API is looking for actual "+" (%2B) values instead of whitespace (%20)
  * { q: searchString.replace(/ /g, "+") } <- q is query string?

### Admin.ts tests
Run the new / to-be tests for endpoints in Admin.ts file
```sh
npm run test:to-be:admin
```

These tests are incomplete. Main thing to do next is implement a way to get access token from test target.

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

### User.ts tests
Run the new / to-be tests for endpoints in User.ts file
```sh
npm run test:to-be:user
```

These tests are incomplete. Main thing to do next is implement a way to get access token from test target.

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

As work on the new API continues, you might need to edit the existing tests, as well as create new tests. You can use `Template.test.js` and `testConfig.js`, located in the `test` folder, to get started.

## To Do
* Need to clarify location of test target, ie 'beam' or 'api(4)'.
* Find a simple, straightforward way to get access tokens.
  * These are needed in the Admin.ts and User.ts tests.
  * Most straightforward solution would be to copy the login process and capture the token in the response.
* Look over api/src/db/models/* to get a better idea of what the data/datatypes are.
* It might be good to run tests from within Docker, using `docker exec -it resonate-api mocha <some.test.js>`? 
  * Not sure if this helps anything.
* Configure Mocha 
  * error log naming / location
  * anything else useful
    * --reporter type?
* Better / more TypeScript integration