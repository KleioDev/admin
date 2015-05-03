var supertest = require('supertest-as-promised');
var comocha = require('co-mocha');
var app = require('../server.js').app;
var admin = require("../config/config").admin;
var password = require("../config/config").password;
var cred = {email:admin, password: password};

exports.login = function(request, done) {
    var agent = supertest.agent();
    request.post('/login')
    agent.saveCookies(res);

    request.send(cred);
    request.end(function (err, res) {
            if (err)
                throw err;
            done(agent);
        });
}
