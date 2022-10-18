// Config for running Mocha in watch mode, inside of resonate api test Docker container

// https://www.testim.io/blog/mocharc-configuration/
// https://stackoverflow.com/questions/72479267/mocha-watch-with-docker

// CI is set to true set by the CI provider (GitHub Actions in our case)
// We don't need to worry about it locally.
const shouldWatch = process.env.CI === "true" ? false : true;

module.exports = {
    "reporter": "spec",
    "watch": shouldWatch,
    "watch-files": ['test/**/*.js', 'src/**/*.js', 'src/**/*.mjs'],
    "watch-ignore": ['node_modules'],
    "recursive": true
};