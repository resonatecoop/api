
# Resonate API Testing

These are tests for the WIP Resonate API (v4) migration. This iteration begins development of tests of the WIP api specification. This stage of the testing effort deliberately keeps things simple. Perhaps later iterations will focus on more fancy stuff.

The purpose of these tests is to verify / validate the endpoints of this API, and to begin development of a more robust API test suite.

These tests reference the [beam](https://github.com/resonatecoop/beam/tree/main/src/services) repository. The 'beam' repo serves as a reference for available endpoints, which are to be integrated into the api(v4) repo.

The api(v4) tests live in the `/api/test` directory. In this directory there are two subdirectories, `baseline` and `integration`. 
* `baseline tests` cover the existing functionality. They depend on static, fixed test data and are intended to verify and validate the baseline functionality of the api, as this functionality is developed.
  * In this directory there are three subdirectories (`Admin.ts`, `Api.ts`, and `User.ts`), each of which corresponds to a file in the [beam](https://github.com/resonatecoop/beam/tree/main/src/services) repository.
  * A list of the endpoints tested in `baseline` is [here](./ListOfBaselineEndpoints.md).
* `integration tests` are intended for Github Actions and any other CI/CD needs. We have not yet decided if an integration version of these tests is required. These tests will be developed once the `baseline` test sets are stable and a need for integration tests is determined.

## About the test data
**You should never edit, re-create or replace the base test data set.** Put another way, you should never change the code in the existing test seeders. However, you can add new test data if and when needed. For help with adding new test data, you can start by reading an overview of how the test data was made [here](./HowTheTestDataWasMade.md).

TL;DR: Add new test data by creating new SQL INSERT INTO statements in a new test data seeder in the `api/src/db/seeders/test` folder. Create a new seeder in order to not disrupt the existing test data. You will need to re-seed the test database, as if you were starting the test container for the first time. If anything about this process doesn't make sense, just ask.

## Dev Notes
This section changes over time, as issues arise and are dealt with.
* Current / known issues:
  * We are skipping the `Admin.ts` endpoint tests. The concensus is that these endpoints should be rewritten.
  * Several `User.ts` tests are skipped for various reasons (alteration of test data, invalid API key, etc.). More info can be found by looking at the `FIXME` comments within the test files.
  * We are skipping tests for `Labels`, and `Tags` because of upstream data migration issues and incomplete funcitonality to be resolved at some point soon.
* The test data is stored locally in the `api/data/pgsql-test` and `api/data/pgsql-test-backups` subdirectories. They are accessed as `volumes` from within the Docker test container.
* These tests run locally under Mocha in watch mode. Watch mode is enabled locally in the `.mocharc.js` config file, which is located in the project root folder. You should not run these tests in watch mode when deploying them to CI/CD pipelines. You can reference the `.mocharc.js` file [here](../.mocharc.js). Watch mode is usually toggled using the `CI` environment variable.
* If you are not familiar with Mocha, take a moment and familiarize yourself with `only` and `skip`. `only` and `skip` are your friends, and can help focus on specific tests as you develop them, work on problems with tests, or figuring out why a test fails, etc.
* You can create more test script commands in the api (v4) repo's `package.json` file, if you need something else.
* If you use a model to `.create()` a record during a test set-up, make sure that you `.destroy()` the record during test tear-down. 
  * [Here is a simple example](./test/../baseline/Api.ts/Search.test.js) of a test that does this. 
  * [This link](https://sequelize.org/docs/v6/core-concepts/paranoid/) provides more information about writing a `.destroy()` call. (Most of the tables in this project use a paranoid model, btw). We suggest that you use [hard deletes](https://sequelize.org/docs/v6/core-concepts/paranoid/#deleting).
  * **Please DO NOT leave extra data records in the test database after running tests.** Extra data records will likely break other tests. 
* As always, if something doesn't make sense, please ask.
## Setup
First, start up the Docker test container.
```sh
yarn docker:compose:test:up
```
If this is the first time you have started this test container, you will need to seed the test database. You should only do this once. You don't have to do this every time you start the test container.
```sh
yarn docker:seed:all:test
```
* You might need to shutdown then restart the Docker test container after seeding the test data.
 
To stop the Docker test container as usual.
```sh
docker compose down
```

## Run the tests
Once the test Docker container is running and seeded with test data, you can run tests. Please note that the tests are designed to run locally in `watch` mode. You can change this in the [.mocharc.js file](../.mocharc.js). Watch mode is usually toggled using the `CI` environment variable.

Open a new terminal window. It is often helpful to open it next to the terminal window which displays the output of the Docker test container. 

Run all of the tests (`baseline` and `integration`)
```sh
yarn test:all
```

Run all of the baseline tests
```sh
yarn test:baseline:all
```

Run the tests for endpoints in Admin.ts file
```sh
yarn test:admin
```

Run the tests for endpoints in Api.ts file
```sh
yarn test:api
```

Run the tests for endpoints in User.ts file
```sh
yarn test:user
```

## Configuration and how to make more tests
As work on the new API continues, you might need to change the test runner configuration, edit the existing tests, as well as create new tests. Here are files that are helpful:

* `.mocharc.js` in the project root. This file contains Mocha configuration settings for running the tests locally. Watch mode is usually toggled using the `CI` environment variable.
* `Template.test.js` in the `test` folder. You can copy this file to start writing new tests more quickly.
* `testConfig.js` in the `test` folder. It has vars and modules that are used in test files. It's basically used as an include header at the beginning of each test file. If you create new tests, this file will help you go faster. **Look through this file before adding new `requires` to your tests. What you need might already be in this file.**
* `MockAccessToken.js` in the `test` folder. This file can help you test endpoints that require authentication. It's rather simple. Refer to the file for more infos.
* If you use a model to `.create()` a record during a test set-up, make sure that you `.destroy()` the record during test tear-down. Please do not leave abandoned data in the test database. [Here is an example](./test/../baseline/Api.ts/Search.test.js) of a test that properly sets up and tears down with an in-test data record. 

## To Do
* Rearrange / refactor the test seeder files, to better reflect what the different groups of seeders actually do.
  * Also make a template test seeder file.
* Finish `Labels` and `Tags` testing once upstream data issues are resolved.
* Finish `Admin.ts` tests once the underlying functionality is in place.
* Review / resolve various `User.ts` skipped tests that are labelled with `FIXME` tags.
* Look over api/src/db/models/ files to get a better idea of what the data/datatypes are.
* Better / more TypeScript integration
* CI/CD
  * `skip` and `only` linting.
  * ability to test different users/other entities by id, for different test cases.
  * If useful / helpful, convert tests to run off of db models.
