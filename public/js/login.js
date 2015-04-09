var supertest = require('supertest-as-promised');
var comocha = require('co-mocha');
var app = require('../server.js').app;


exports.login = function(request, done) {
    var agent = supertest.agent();
    request.post('/login')
    agent.saveCookies(res);

    request.send({username: 'admin@upr.edu', password: '123456'});
    request.end(function (err, res) {
            if (err)
                throw err;
            done(agent);
        });
}
