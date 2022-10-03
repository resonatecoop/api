
# Resonate API Testing

These are tests for the WIP Resonate API (v4) migration. This iteration begins development of tests of the WIP api specification. This stage of the testing effort deliberately keeps things simple. Perhaps later iterations will focus on more fancy stuff.

The purpose of these tests is to verify / validate the endpoints of this API, and to begin development of a more robust API test suite.

These tests reference the [beam](https://github.com/resonatecoop/beam/tree/main/src/services) repository. The 'beam' repo serves as a reference for available endpoints, which are to be integrated into the api(v4) repo.

The api(v4) tests live in the `/api/test` directory. In this directory there are three subfolders (`Admin.ts`, `Api.ts`, and `User.ts`), each of which corresponds to a file in the [beam](https://github.com/resonatecoop/beam/tree/main/src/services) repository.

## How the test data was made
You can read an overview of how the test data was made [here](./HowTheTestDataWasMade.md). 


## Setup and running
First, start up the Docker test container.
```sh
yarn docker:compose:test:up
```
If this is the first time you have started this test container, you will need to seed the test database. You don't have to do this every time you start the test container.
```sh
docker:seed:all:test
```
* Note: You might need to shutdown then restart the Docker test container after seeding the test data.
 
To stop the Docker test container.
```sh
yarn docker:compose:test:down
```

Once the test Docker container is seeded and up, you can run tests.

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

You can run a test in `watch` mode, from the command line. This is helpful while you work on a test, or work on the functionality being tested.
```sh
mocha -w someFilePath/someTestFileName
```

You can create more test script commands in the api (v4) repo's `package.json` file, if you need something else.

## Notes
There is a file named `Template.test.js` in the `test` folder. You can copy this file to start writing new tests more quickly.

There is a file named `testConfig.js` in the `test` folder. It has vars and modules that are used in test files. It's basically used as an include header at the beginning of each test file. If you create new tests, this file will help you go faster.

In `testConfig.js` there is a const `baseURL`. This is set to `http://localhost:4000/api/v3` so that you can run the tests against a local Dockerized resonate api (v4) container instance. If you need to run the tests against a different instance of the API, you can comment this const out and replace it with a url of your choosing, ie `const baseURL = 'http://awesome.sauce.com/api/v2'` or similar.

These tests run under Mocha as test runner. If you are not familiar with Mocha, take a moment and familiarize yourself with `only` and `skip`. `only` and `skip` are your friends, and can help on specific tests as they are being developed, or problems with tests, or when a test fails, etc.

This testing suite uses Mocha, and Mocha will be installed as a dev dependency if / when you run `yarn` at the repo root.

This testing suite uses some assertions from Chai, and Chai will be installed as a dev dependency if / when you run `yarn` at the repo root.

## The Tests
These are tests for api (v4). They are currently based on endpoints revealed [in this document](https://github.com/resonatecoop/beam/tree/main/src/services).

Still not clear on how well the endpoints map to the underlying data.

For this iteration of these tests, we capture the endpoints' output and return that output to the tests. This is a 'what does it do?' and not a 'what should it do?' approach. Later iterations of test development should focus on testing actual required functionality and valid test data.

### Api.ts tests

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
Run the tests for endpoints in User.ts file
```sh
yarn test:user
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

As work on the new API continues, you might need to edit the existing tests, as well as create new tests. You can use `Template.test.js` and `testConfig.js`, located in the `test` folder, to get started with new tests.

## To Do
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
