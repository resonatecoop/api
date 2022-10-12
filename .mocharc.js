// Config for running Mocha in watch mode, inside of resonate api test Docker container

// https://www.testim.io/blog/mocharc-configuration/
// https://stackoverflow.com/questions/72479267/mocha-watch-with-docker

const shouldWatch = process.env.CI === "true" ? false : true;

module.exports = {
    "reporter": "spec",
    "watch": shouldWatch,
    "watch-files": ['test/**/*.js', 'src/**/*.js'],
    "watch-ignore": ['node_modules'],
    "recursive": true
};