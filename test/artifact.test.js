var supertest = require('supertest-as-promised');
var expect = require('chai').expect;
var server = require('../server.js');
var app = server.app;
var comocha = require("co-mocha");
var admin = require("../config/config").admin;
var password = require("../config/config").password;
var cred = {email:admin, password: password};


var request = supertest(app.callback());

describe('Artifacts', function(){

    describe('GET /artifacts', function(){

        it('should return a status of 302 redirecting to 200', function *(){
            yield request.post("/login").send(cred).then(request.get('/artifacts').expect(200));
        });
    });
    describe('GET /artifact/2', function(){

        it('should return a status of 302 redirecting to 200', function *(){
            yield request.post("/login").send(cred).then(request.get('/artifact/2').expect(200));
        });
    });
    describe('GET /artifact/100', function(){

        it('should return a status of 404', function *(){
            yield request.post("/login").send(cred).then(request.get('/artifact/100').expect(404));
        });
    });

});