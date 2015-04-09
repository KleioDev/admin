var supertest = require('supertest-as-promised');
var expect = require('chai').expect;
var server = require('../server.js');
var app = server.app;
var comocha = require("co-mocha");


request = supertest(app.callback());
var exhibitions = require('./db.js').exhibitions;

describe('Exhibitions', function(){

    describe('GET /exhibitions', function(){

        it('should return a status of 302 redirecting to 200', function *(){
            yield request.post("/login").send({email:"admin@upr.edu", password:"123456"}).then(
                request.get('/exhibitions').expect(200));
        });
    });
    describe('GET /exhibition/1', function(){

        it('should return a status of 302 redirecting to 200', function *(){
            yield request.post("/login").send({email:"admin@upr.edu", password:"123456"}).then(
                request.get('/exhibition/1').expect(200));
        });
    });

    describe('GET /exhibition/10', function(){

        it('should return a status of 404', function *(){
            yield request.post("/login").send({email:"admin@upr.edu", password:"123456"}).then(
                request.get('/exhibition/10').expect(200));
        });
    });

});