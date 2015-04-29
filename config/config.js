

var env = require('node-env-file'); //process.env.whatever
env(__dirname + '/.env');

module.exports = {
    url: "http://136.145.116.229",
    secret: process.env.SECRET,
    sessionDuration: 24 * 60 * 60 * 1000,
    sessionActiveDuration: 24 * 60 * 60 * 1000

}