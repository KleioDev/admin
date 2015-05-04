var env = require('node-env-file');
env(__dirname + '/../.env');
module.exports = {
    url: "http://136.145.116.229",
    secret: process.env.SECRET,
    sessionDuration: 24 * 60 * 60 * 1000,
    sessionActiveDuration: 24 * 60 * 60 * 1000,
    admin: process.env.ADMIN,
    password: process.env.PASSWORD,
    auth: "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6Imx1aXNmcmlrQGdtYWlsLmNvbSIsInR5cGUiOiJhZG1pbiIsImlkIjozLCJpYXQiOjE0MzA3NzUyMTIsImV4cCI6MTQzMDg2MTYxMn0.Di6MQV4FRgcKhLYhg1ntS8z9AMxTU5Yt-P9bz6HQzoI"
};