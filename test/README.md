
# Resonate API Testing

These are tests for the WIP Resonate API (v4) migration. This iteration begins development of tests of the WIP api specification. This stage of the testing effort deliberately keeps things simple. Perhaps later iterations will focus on more fancy stuff.

The purpose of these tests is to verify / validate the endpoints of this API, and to begin development of a more robust API test suite.

These tests reference the [beam](https://github.com/resonatecoop/beam/tree/main/src/services) repository. The 'beam' repo serves as a reference for available endpoints, which are to be integrated into the api(v4) repo.

The api(v4) tests live in the `/api/test` directory. In this directory there are three subfolders (`Admin.ts`, `Api.ts`, and `User.ts`), each of which corresponds to a file in the [beam](https://github.com/resonatecoop/beam/tree/main/src/services) repository.

## Dev Notes
This section changes over time, as issues arise and are dealt with.
* We are currently skipping the `Admin.ts` endpoint tests. The concensus is that these endpoints should be rewritten.
* It looks like the protected endpoints will accept any value for an accessToken, and that the only check against this token is whether or not it is provided.
* Many of the endpoints return a 404 code, when perhaps a 400 is more appropriate.
* We are skipping tests for `Labels`, and `Tags` because of upstream data migration issues and incomplete funcitonality to be resolved at some point soon.

## How the test data was made
You should never need to create test data. However, you can read an overview of how the test data was made [here](./HowTheTestDataWasMade.md). 

## Setup and running
First, start up the Docker test container.
```sh
yarn docker:compose:test:up
```
If this is the first time you have started this test container, you will need to seed the test database. You should only do this once. You don't have to do this every time you start the test container.
```sh
docker:seed:all:test
```
* Note: You might need to shutdown then restart the Docker test container after seeding the test data.
 
To stop the Docker test container.
```sh
yarn docker:compose:test:down
```

Once the test Docker container is seeded and up, you can run tests. Please note that the tests are designed to run in `watch` mode. You can change this in the `.mocharc.js` file.

Open a new terminal window. It is often helpful to open it next to the terminal window which displays the output of the Docker test container. 

Run the tests for endpoints in Api.ts file
```sh
yarn test:api
```

Run the tests for endpoints in Admin.ts file
```sh
yarn test:admin
```

Run the tests for endpoints in User.ts file
```sh
yarn test:user
```

These tests run locally under Mocha in watch mode. Watch mode is enabled locally in the `.mocharc.js` config file, which is located in the project root folder. You should not run these tests in watch mode when deploying them to CI/CD pipelines.

For reference, here are the contents of the `mocharc.js` config file:
```sh
module.exports = {
    "reporter": "spec",
    "watch": true,
    "watch-files": ['test/**/*.js', 'src/**/*.js'],
    "watch-ignore": ['node_modules'],
    "recursive": true
};
```

If you are not familiar with Mocha, take a moment and familiarize yourself with `only` and `skip`. `only` and `skip` are your friends, and can help focus on specific tests as they are being developed, or problems with tests, or when a test fails, etc.

You can create more test script commands in the api (v4) repo's `package.json` file, if you need something else.

## Configuration and how to make more tests
There is a file named `.mocharc.js` located in the project root. This file contains configuration settings for running the tests locally.

There is a file named `Template.test.js` in the `test` folder. You can copy this file to start writing new tests more quickly.

There is a file named `testConfig.js` in the `test` folder. It has vars and modules that are used in test files. It's basically used as an include header at the beginning of each test file. If you create new tests, this file will help you go faster.

In `testConfig.js` there is a const `baseURL`. This is set to `http://localhost:4000/api/v3` so that you can run the tests against a local Dockerized resonate api (v4) container instance. If you need to run the tests against a different instance of the API, you can comment this const out and replace it with a url of your choosing, ie `const baseURL = 'http://awesome.sauce.com/api/v2'` or similar.

There is a file named `MockAccessToken.js` in the `test` folder. This file can help you test endpoints that require authentication. It's rather simple. Refer to the file for more infos.

## The Tests
These are tests for api (v4). They are currently based on endpoints revealed [in this document](https://github.com/resonatecoop/beam/tree/main/src/services).

Still not clear on how well the endpoints map to the underlying data.

For this iteration of these tests, we capture the endpoints' output and return that output to the tests. This tests answer the questions 'what do we have?' and 'what does it do?' and not 'what should it do?'. Later iterations of test development should focus on testing actual required functionality and valid test data.

### Api.ts tests

* Currently we are skipping `Labels` tests and `Tags` tests. This is due to issues upstream with legacy data migration.
* Currently we are skipping `Search ` tests. This can continue once search functionality is implemented. This implementation should occur after initial test development is complete.

Run the tests for endpoints in Api.ts file
```sh
yarn test:api
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
  * GET /tracks/${trackId}
* search
  * GET /search/
  * searchString: string
    * // NOTE: API is looking for actual "+" (%2B) values instead of whitespace (%20)
    * { q: searchString.replace(/ /g, "+") } <- q is query string?

### Admin.ts tests
Run the tests for endpoints in Admin.ts file
```sh
yarn test:admin
```

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
Run the tests for endpoints in User.ts file
```sh
yarn test:user
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

As work on the new API continues, you might need to edit the existing tests, as well as create new tests. You can use `Template.test.js`, `testConfig.js` and `MockAccessToken`, located in the `test` folder, to get started with new tests.

## To Do
* Resolve tests that 200 when invalid access token is sent.
* Finish `Labels` and `Tags` testing once upstream data issues are resolved.
* Implement search endpoint.
* Resume test development for endpoints that currently have no data (Labels, Tags, etc.).
* Look over api/src/db/models/ files to get a better idea of what the data/datatypes are.
* Better / more TypeScript integration
* CI/CD
  * Integrate into Github Actions.
  * `skip` and `only` linting.
  * disable watch mode.
    * no `.mocharc.js` in CI/CD deployment is a step towards this.
  * ability to test different users/other entities by id, for different test cases.
  * convert tests to run off of db models.
