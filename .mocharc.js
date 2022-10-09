// Config for running Mocha in watch mode, inside of resonate api test Docker container

// https://www.testim.io/blog/mocharc-configuration/
// https://stackoverflow.com/questions/72479267/mocha-watch-with-docker

module.exports = {
    "reporter": "spec",
    "watch": process.env.CI ? false : true,
    "watch-files": ['test/**/*.js', 'src/**/*.js'],
    "watch-ignore": ['node_modules'],
    // "file": 'test/common.js',
    "recursive": true
};