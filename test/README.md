
## Resonate API Testing

These are tests for the WIP Resonate API migration. This iteration of the tests development simply migrates tests as-built to a Mocha environment. Later iterations will focus on more fancy stuff.

The purpose of these tests is to verify / validate the endpoints of this API, and to begin development of a robust API test suite.

For the sake of total clarity, these tests live in the `/api/test` directory. The previous tests live in `/api/test-as-built` directory.

These tests expect a running instance of the Docker container that you get when you `docker compose up` at the `api` repo root. Make sure first that this container instance is running / has finished loading / etc. before running the tests. 

You also need to seed the database.

The `Getting started with local dev` section of [README.md](../README.md) file for the api repo explains what to do.

## Setup and running
There is a file named `testConfig.js` in the `test` folder. It has vars and objects that are used in most / all test files. It's basically used as an include header at the head of each test file. If you want to create new tests, this file will help you go faster.

In `testConfig.js` there is a const `baseURL`. This is set to `http://localhost:4000/api/v3` so that you can run the tests against the Dockerized resonate api container instance. If you need to run the tests against a different instance of the API, you can comment this const out and replace it with a url of your choosing, ie `const baseURL = http://awesome.sauce.com/api/v2` or similar.

If you're not familiar with Mocha, take a moment to learn about `skip` and `only`. They are your friends. The tests are structured so that you can 'switch off' and 'switch on' chunks of a test file using `skip` and `only`.

Run the tests in watch mode
```sh
npm run test:watch
```

Run the tests once
```sh
npm run test
```

Run a specific test once
```sh
npm run test <test.name.goes.here.without.brackets>
```
(nts: check response vs. response.body)

### Notes

If you cloned the Resonate API repo in the past and then ran `yarn install`, you might have something called 'Tape' installed on your machine. 'Tape' is a test runner that was used in an earlier version of the API. The reasons for this are unknown. Accept the mystery.

You might want to delete 'Tape' from your system. The decision is yours. Do so with the command
```sh
yarn remove tape
```

This testing suite uses Mocha, and Mocha will be installed as a dev dependency if / when you run `yarn` at the repo root.

This testing suite uses some assertions from Chai, and Chai will be installed as a dev dependency if / when you run `yarn` at the repo root.

The purpose / use of test-as-built/db/models/*.js is unclear. It looks like is isn't used. Need to confirm this.

The purpose / use of test-as-built/fixtures/profiles.js is unclear. It looks like it isn't used. Need to confirm this.

There are no tests for the test-as-built/media folder because this folder is only audio files.

(nts: it might be good to run tests from within Docker, using `docker exec -it resonate-api mocha <some.test.js>` ???)

### The Tests As-Built
These are the tests that existed previously.

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
  
### The Tests To-Be
These are the new tests.

## To Do
* Better / more TypeScript integration