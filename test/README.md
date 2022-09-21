
# Resonate API Testing

These are tests for the WIP Resonate API migration. This iteration of the tests development simply migrates tests as-built to a Mocha environment and begins development of new tests of the WIP api specification to-be. Later iterations will focus on more fancy stuff.

The purpose of these tests is to verify / validate the endpoints of this API, and to begin development of a robust API test suite.

For the sake of total clarity, these tests live in the `/api/test` directory. The previous tests live in `/api/test/as-built` directory. The new tests live in `api/test/to-be` directory.

These tests expect a running instance of the Docker container that you get when you `docker compose up` at the `api` repo root. Make sure first that this container instance is running / has finished loading / etc. before running the tests. 

You also need to seed the database.

The `Getting started with local dev` section of the main repo [README.md](../README.md) file explains what to do.

## Setup and running
There is a file named `testConfig.js` in the `test` folder. It has vars and modules that are used in test files. It's basically used as an include header at the head of each test file. If you create new tests, this file will help you go faster.

In `testConfig.js` there is a const `baseURL`. This is set to `http://localhost:4000/api/v3` so that you can run the tests against the Dockerized resonate api container instance. If you need to run the tests against a different instance of the API, you can comment this const out and replace it with a url of your choosing, ie `const baseURL = 'http://awesome.sauce.com/api/v2'` or similar.

If you're not familiar with Mocha, take a moment to learn about `skip` and `only`. They are your friends. The tests are structured so that you can 'switch off' and 'switch on' chunks of a test file using `skip` and `only`.

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

Run all the tests in watch mode
```sh
npm run test:watch
```

Run all the tests once
```sh
npm run test
```

Run a specific test once
```sh
npm run test <test.name.goes.here.without.these.brackets>
```

You can create more test script commands in the main repo's `package.json` file, if you need something else.

## Notes

If you cloned the Resonate API repo in the past and then ran `yarn install`, you might have something called 'Tape' installed on your machine. 'Tape' is a test runner that was used in an earlier version of the API.

You might want to delete 'Tape' from your system. The decision is yours. Do so with the command
```sh
yarn remove tape
```

This testing suite uses Mocha, and Mocha will be installed as a dev dependency if / when you run `yarn` at the repo root.

This testing suite uses some assertions from Chai, and Chai will be installed as a dev dependency if / when you run `yarn` at the repo root.

## The Tests As-Built
This might be a bit confusing. These are the tests that existed previously. This listing references the original fiolder structure. These will likely not run in your dev environment.

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

The migrated as-built tests are located in `test/as-built`. These will run under Mocha.

## The Tests To-Be
These are the new tests. They are currently based on endpoints revealed [in this document](https://github.com/resonatecoop/beam/tree/main/src/services).

Still not clear on how well the endpoints map to the underlying data.

For the first iteration of these tests, we capture the endpoints' output and put that output into the tests. This is a 'what does it do?' and not a 'what should it do?' approach.

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

Run the new / to-be tests for endpoints in Admin.ts file
```sh
npm run test:to-be:admin
```

Endpoints in [Admin.ts](https://github.com/resonatecoop/beam/blob/main/src/services/api/Admin.ts)
nts: there are interfaces for typing
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

Run the new / to-be tests for endpoints in User.ts file
```sh
npm run test:to-be:user
```

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

As work on the new API continues, you might need to edit the existing tests, as well as create new tests.

## To Do
* nts: look over api/src/db/models/* to get a better idea of what the data/datatypes are.
* (nts: it might be good to run tests from within Docker, using `docker exec -it resonate-api mocha <some.test.js>`? Not sure if this helps...)
* Configure Mocha 
  * error log naming / location
  * anything else useful
* Better / more TypeScript integration