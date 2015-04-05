var supertest = require('supertest-as-promised');
var expect = require('chai').expect;
var server = require('../server.js');
var app = server.app;
var comocha = require("co-mocha");


request = supertest(app.callback());
var users = require('../js/db.js').users;

describe('Users', function(){

    describe('GET /users', function(){

        it('should return a status of 302 redirecting to 200', function *(){
            yield request.post("/login").send({email:"admin@upr.edu", password:"123456"}).then(
                request.get('/users').expect(200));
        });
    });

});